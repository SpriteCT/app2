"""
API routes for assets management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models import Asset, Client, AssetType
from app.schemas import (
    Asset as AssetSchema,
    AssetCreate,
    AssetUpdate
)

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/", response_model=List[AssetSchema])
def get_assets(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    type_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all assets, optionally filtered by client or type"""
    query = db.query(Asset).filter(Asset.is_deleted == False).options(
        joinedload(Asset.type),
        joinedload(Asset.status),
        joinedload(Asset.criticality)
    )
    if client_id:
        query = query.filter(Asset.client_id == client_id)
    if type_id:
        query = query.filter(Asset.type_id == type_id)
    assets = query.offset(skip).limit(limit).all()
    return assets


@router.get("/{asset_id}", response_model=AssetSchema)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    """Get a specific asset by ID"""
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.is_deleted == False).options(
        joinedload(Asset.type),
        joinedload(Asset.status),
        joinedload(Asset.criticality)
    ).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    return asset


@router.post("/", response_model=AssetSchema, status_code=status.HTTP_201_CREATED)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    """Create a new asset"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == asset.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Verify asset type exists
    asset_type = db.query(AssetType).filter(AssetType.id == asset.type_id).first()
    if not asset_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset type not found"
        )
    
    asset_data = asset.model_dump()
    # Remove id if present
    asset_data.pop('id', None)
    db_asset = Asset(**asset_data)
    db.add(db_asset)
    
    try:
        db.commit()
    except Exception as e:
        # If we get an ID conflict, fix the sequence and retry once
        if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
            from sqlalchemy import text
            # Fix the sequence
            db.execute(text("SELECT setval('assets_id_seq', (SELECT MAX(id) FROM assets), true)"))
            db.commit()
            # Retry the insert
            db_asset = Asset(**asset_data)
            db.add(db_asset)
            db.commit()
        else:
            raise
    
    db.refresh(db_asset)
    return db_asset


@router.put("/{asset_id}", response_model=AssetSchema)
def update_asset(
    asset_id: int,
    asset_update: AssetUpdate,
    db: Session = Depends(get_db)
):
    """Update an asset"""
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    # Verify asset type if updated
    if asset_update.type_id:
        asset_type = db.query(AssetType).filter(AssetType.id == asset_update.type_id).first()
        if not asset_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset type not found"
            )
    
    update_data = asset_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_asset, field, value)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    """Soft delete an asset"""
    from app.models import Vulnerability, TicketVulnerability, Ticket
    
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    # Check if asset is linked to any vulnerabilities that are linked to tickets
    linked_vulnerabilities = db.query(Vulnerability).filter(
        Vulnerability.asset_id == asset_id,
        Vulnerability.is_deleted == False
    ).all()
    
    if linked_vulnerabilities:
        # Check if any of these vulnerabilities are linked to non-deleted tickets
        vuln_ids = [v.id for v in linked_vulnerabilities]
        linked_tickets = db.query(TicketVulnerability).join(
            Ticket, TicketVulnerability.ticket_id == Ticket.id
        ).filter(
            TicketVulnerability.vulnerability_id.in_(vuln_ids),
            Ticket.is_deleted == False
        ).all()
        
        if linked_tickets:
            ticket_ids = list(set([tv.ticket_id for tv in linked_tickets]))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete asset: it has vulnerabilities linked to {len(ticket_ids)} ticket(s) (IDs: {', '.join(map(str, ticket_ids))})"
            )
        
        # If no tickets linked, soft delete all vulnerabilities
        for vuln in linked_vulnerabilities:
            vuln.is_deleted = True
            vuln.updated_at = datetime.now(timezone.utc)
    
    # Soft delete the asset
    db_asset.is_deleted = True
    db_asset.updated_at = datetime.now(timezone.utc)
    db.commit()
    return None

