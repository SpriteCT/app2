"""
API routes for reference data (asset types, scanners, and reference tables replacing ENUMs)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import (
    AssetType, Scanner,
    ProjectType, ProjectStatus,
    PriorityLevel, AssetStatus,
    VulnStatus, TicketStatus
)
from app.schemas import (
    AssetType as AssetTypeSchema,
    AssetTypeCreate,
    AssetTypeUpdate,
    Scanner as ScannerSchema,
    ScannerCreate,
    ScannerUpdate,
    ProjectType as ProjectTypeSchema,
    ProjectStatus as ProjectStatusSchema,
    PriorityLevel as PriorityLevelSchema,
    AssetStatus as AssetStatusSchema,
    VulnStatus as VulnStatusSchema,
    TicketStatus as TicketStatusSchema
)

router = APIRouter(prefix="/reference", tags=["reference"])


# Asset Types routes
@router.get("/asset-types", response_model=List[AssetTypeSchema])
def get_asset_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all asset types"""
    asset_types = db.query(AssetType).offset(skip).limit(limit).all()
    return asset_types


@router.get("/asset-types/{asset_type_id}", response_model=AssetTypeSchema)
def get_asset_type(asset_type_id: int, db: Session = Depends(get_db)):
    """Get a specific asset type by ID"""
    asset_type = db.query(AssetType).filter(AssetType.id == asset_type_id).first()
    if not asset_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset type not found"
        )
    return asset_type


@router.post("/asset-types", response_model=AssetTypeSchema, status_code=status.HTTP_201_CREATED)
def create_asset_type(asset_type: AssetTypeCreate, db: Session = Depends(get_db)):
    """Create a new asset type"""
    db_asset_type = AssetType(**asset_type.model_dump())
    db.add(db_asset_type)
    db.commit()
    db.refresh(db_asset_type)
    return db_asset_type


@router.put("/asset-types/{asset_type_id}", response_model=AssetTypeSchema)
def update_asset_type(
    asset_type_id: int,
    asset_type_update: AssetTypeUpdate,
    db: Session = Depends(get_db)
):
    """Update an asset type"""
    db_asset_type = db.query(AssetType).filter(AssetType.id == asset_type_id).first()
    if not db_asset_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset type not found"
        )
    
    update_data = asset_type_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_asset_type, field, value)
    
    db.commit()
    db.refresh(db_asset_type)
    return db_asset_type


@router.delete("/asset-types/{asset_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset_type(asset_type_id: int, db: Session = Depends(get_db)):
    """Delete an asset type"""
    db_asset_type = db.query(AssetType).filter(AssetType.id == asset_type_id).first()
    if not db_asset_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset type not found"
        )
    
    db.delete(db_asset_type)
    db.commit()
    return None


# Scanners routes
@router.get("/scanners", response_model=List[ScannerSchema])
def get_scanners(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all scanners"""
    scanners = db.query(Scanner).offset(skip).limit(limit).all()
    return scanners


@router.get("/scanners/{scanner_id}", response_model=ScannerSchema)
def get_scanner(scanner_id: int, db: Session = Depends(get_db)):
    """Get a specific scanner by ID"""
    scanner = db.query(Scanner).filter(Scanner.id == scanner_id).first()
    if not scanner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scanner not found"
        )
    return scanner


@router.post("/scanners", response_model=ScannerSchema, status_code=status.HTTP_201_CREATED)
def create_scanner(scanner: ScannerCreate, db: Session = Depends(get_db)):
    """Create a new scanner"""
    db_scanner = Scanner(**scanner.model_dump())
    db.add(db_scanner)
    db.commit()
    db.refresh(db_scanner)
    return db_scanner


@router.put("/scanners/{scanner_id}", response_model=ScannerSchema)
def update_scanner(
    scanner_id: int,
    scanner_update: ScannerUpdate,
    db: Session = Depends(get_db)
):
    """Update a scanner"""
    db_scanner = db.query(Scanner).filter(Scanner.id == scanner_id).first()
    if not db_scanner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scanner not found"
        )
    
    update_data = scanner_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_scanner, field, value)
    
    db.commit()
    db.refresh(db_scanner)
    return db_scanner


@router.delete("/scanners/{scanner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scanner(scanner_id: int, db: Session = Depends(get_db)):
    """Delete a scanner"""
    db_scanner = db.query(Scanner).filter(Scanner.id == scanner_id).first()
    if not db_scanner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scanner not found"
        )
    
    db.delete(db_scanner)
    db.commit()
    return None


# Project Types routes
@router.get("/project-types", response_model=List[ProjectTypeSchema])
def get_project_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all project types"""
    project_types = db.query(ProjectType).offset(skip).limit(limit).all()
    return project_types


# Project Statuses routes
@router.get("/project-statuses", response_model=List[ProjectStatusSchema])
def get_project_statuses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all project statuses"""
    project_statuses = db.query(ProjectStatus).offset(skip).limit(limit).all()
    return project_statuses


# Priority Levels routes
@router.get("/priority-levels", response_model=List[PriorityLevelSchema])
def get_priority_levels(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all priority levels"""
    priority_levels = db.query(PriorityLevel).offset(skip).limit(limit).all()
    return priority_levels


# Asset Statuses routes
@router.get("/asset-statuses", response_model=List[AssetStatusSchema])
def get_asset_statuses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all asset statuses"""
    asset_statuses = db.query(AssetStatus).offset(skip).limit(limit).all()
    return asset_statuses


# Vulnerability Statuses routes
@router.get("/vuln-statuses", response_model=List[VulnStatusSchema])
def get_vuln_statuses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all vulnerability statuses"""
    vuln_statuses = db.query(VulnStatus).offset(skip).limit(limit).all()
    return vuln_statuses


# Ticket Statuses routes
@router.get("/ticket-statuses", response_model=List[TicketStatusSchema])
def get_ticket_statuses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all ticket statuses"""
    ticket_statuses = db.query(TicketStatus).offset(skip).limit(limit).all()
    return ticket_statuses

