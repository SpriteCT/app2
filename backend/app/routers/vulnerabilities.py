"""
API routes for vulnerabilities management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Vulnerability, Client, Asset, AssetType, Scanner
from app.utils import get_vulnerability_display_id
from app.schemas import (
    Vulnerability as VulnerabilitySchema,
    VulnerabilityCreate,
    VulnerabilityUpdate
)

router = APIRouter(prefix="/vulnerabilities", tags=["vulnerabilities"])


@router.get("/", response_model=List[VulnerabilitySchema])
def get_vulnerabilities(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    asset_id: Optional[int] = None,
    status: Optional[str] = None,
    criticality: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all vulnerabilities, optionally filtered"""
    from sqlalchemy.orm import joinedload
    query = db.query(Vulnerability).filter(Vulnerability.is_deleted == False).options(
        joinedload(Vulnerability.asset).joinedload(Asset.type),
        joinedload(Vulnerability.scanner),
        joinedload(Vulnerability.client)
    )
    if client_id:
        query = query.filter(Vulnerability.client_id == client_id)
    if asset_id:
        query = query.filter(Vulnerability.asset_id == asset_id)
    if status:
        query = query.filter(Vulnerability.status == status)
    if criticality:
        query = query.filter(Vulnerability.criticality == criticality)
    vulnerabilities = query.offset(skip).limit(limit).all()
    return vulnerabilities


@router.get("/{vulnerability_id}", response_model=VulnerabilitySchema)
def get_vulnerability(vulnerability_id: int, db: Session = Depends(get_db)):
    """Get a specific vulnerability by ID"""
    from sqlalchemy.orm import joinedload
    vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id, Vulnerability.is_deleted == False).options(
        joinedload(Vulnerability.asset).joinedload(Asset.type),
        joinedload(Vulnerability.scanner),
        joinedload(Vulnerability.client)
    ).first()
    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    return vulnerability


@router.post("/", response_model=VulnerabilitySchema, status_code=status.HTTP_201_CREATED)
def create_vulnerability(vulnerability: VulnerabilityCreate, db: Session = Depends(get_db)):
    """Create a new vulnerability"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == vulnerability.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Verify asset if provided
    if vulnerability.asset_id:
        asset = db.query(Asset).filter(Asset.id == vulnerability.asset_id).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found"
            )
        # Verify asset belongs to the same client
        if asset.client_id != vulnerability.client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Asset must belong to the same client as the vulnerability"
            )
    
    # Asset type is derived from asset, no need to verify separately
    
    # Verify scanner if provided
    if vulnerability.scanner_id:
        scanner = db.query(Scanner).filter(Scanner.id == vulnerability.scanner_id).first()
        if not scanner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scanner not found"
            )
    
    vuln_data = vulnerability.model_dump()
    # Remove id if present (should not be in model_dump, but just in case)
    vuln_data.pop('id', None)
    # Generate display_id
    vuln_data['display_id'] = get_vulnerability_display_id(client, db)
    # Set discovered date to today if not provided
    if not vuln_data.get('discovered'):
        from datetime import date
        vuln_data['discovered'] = date.today()
    db_vulnerability = Vulnerability(**vuln_data)
    db.add(db_vulnerability)
    
    try:
        db.commit()
    except Exception as e:
        # If we get an ID conflict, fix the sequence and retry once
        if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
            from sqlalchemy import text
            # Fix the sequence
            db.execute(text("SELECT setval('vulnerabilities_id_seq', (SELECT MAX(id) FROM vulnerabilities), true)"))
            db.commit()
            # Retry the insert
            db_vulnerability = Vulnerability(**vuln_data)
            db.add(db_vulnerability)
            db.commit()
        else:
            raise
    
    db.refresh(db_vulnerability)
    return db_vulnerability


@router.put("/{vulnerability_id}", response_model=VulnerabilitySchema)
def update_vulnerability(
    vulnerability_id: int,
    vulnerability_update: VulnerabilityUpdate,
    db: Session = Depends(get_db)
):
    """Update a vulnerability"""
    db_vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id).first()
    if not db_vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    
    # Verify related entities if updated
    if vulnerability_update.asset_id:
        asset = db.query(Asset).filter(Asset.id == vulnerability_update.asset_id).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found"
            )
    
    # Asset type is derived from asset, no need to verify separately
    
    if vulnerability_update.scanner_id:
        scanner = db.query(Scanner).filter(Scanner.id == vulnerability_update.scanner_id).first()
        if not scanner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scanner not found"
            )
    
    update_data = vulnerability_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_vulnerability, field, value)
    
    # Update related tickets' updated_at timestamp
    from app.models import TicketVulnerability, Ticket
    from sqlalchemy.sql import func
    related_tickets = db.query(TicketVulnerability).filter(
        TicketVulnerability.vulnerability_id == vulnerability_id
    ).all()
    
    if related_tickets:
        ticket_ids = [tv.ticket_id for tv in related_tickets]
        db.query(Ticket).filter(Ticket.id.in_(ticket_ids)).update(
            {Ticket.updated_at: func.now()},
            synchronize_session=False
        )
    
    db.commit()
    db.refresh(db_vulnerability)
    return db_vulnerability


@router.delete("/{vulnerability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vulnerability(vulnerability_id: int, db: Session = Depends(get_db)):
    """Soft delete a vulnerability"""
    from app.models import TicketVulnerability, Ticket
    from datetime import datetime, timezone
    
    db_vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id, Vulnerability.is_deleted == False).first()
    if not db_vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    
    # Check if vulnerability is linked to any non-deleted tickets
    linked_tickets = db.query(TicketVulnerability).join(
        Ticket, TicketVulnerability.ticket_id == Ticket.id
    ).filter(
        TicketVulnerability.vulnerability_id == vulnerability_id,
        Ticket.is_deleted == False
    ).all()
    
    if linked_tickets:
        ticket_ids = [tv.ticket_id for tv in linked_tickets]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete vulnerability: it is linked to {len(linked_tickets)} ticket(s) (IDs: {', '.join(map(str, ticket_ids))})"
        )
    
    db_vulnerability.is_deleted = True
    db_vulnerability.updated_at = datetime.now(timezone.utc)
    db.commit()
    return None

