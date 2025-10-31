"""
API routes for assets management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

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
    client_id: Optional[UUID] = None,
    type_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """Get all assets, optionally filtered by client or type"""
    query = db.query(Asset)
    if client_id:
        query = query.filter(Asset.client_id == client_id)
    if type_id:
        query = query.filter(Asset.type_id == type_id)
    assets = query.offset(skip).limit(limit).all()
    return assets


@router.get("/{asset_id}", response_model=AssetSchema)
def get_asset(asset_id: UUID, db: Session = Depends(get_db)):
    """Get a specific asset by ID"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
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
    
    db_asset = Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


@router.put("/{asset_id}", response_model=AssetSchema)
def update_asset(
    asset_id: UUID,
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
def delete_asset(asset_id: UUID, db: Session = Depends(get_db)):
    """Delete an asset"""
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    db.delete(db_asset)
    db.commit()
    return None

