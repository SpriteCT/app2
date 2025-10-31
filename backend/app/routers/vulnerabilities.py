"""
API routes for vulnerabilities management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Vulnerability, Client, Asset, AssetType, Scanner
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
    query = db.query(Vulnerability)
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
    vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id).first()
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
    
    # Verify asset type if provided
    if vulnerability.asset_type_id:
        asset_type = db.query(AssetType).filter(AssetType.id == vulnerability.asset_type_id).first()
        if not asset_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset type not found"
            )
    
    # Verify scanner if provided
    if vulnerability.scanner_id:
        scanner = db.query(Scanner).filter(Scanner.id == vulnerability.scanner_id).first()
        if not scanner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scanner not found"
            )
    
    db_vulnerability = Vulnerability(**vulnerability.model_dump())
    db.add(db_vulnerability)
    db.commit()
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
    
    if vulnerability_update.asset_type_id:
        asset_type = db.query(AssetType).filter(AssetType.id == vulnerability_update.asset_type_id).first()
        if not asset_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset type not found"
            )
    
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
    
    db.commit()
    db.refresh(db_vulnerability)
    return db_vulnerability


@router.delete("/{vulnerability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vulnerability(vulnerability_id: int, db: Session = Depends(get_db)):
    """Delete a vulnerability"""
    db_vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id).first()
    if not db_vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    
    db.delete(db_vulnerability)
    db.commit()
    return None

