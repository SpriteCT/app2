"""
API routes for reference data (asset types, scanners)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import AssetType, Scanner
from app.schemas import (
    AssetType as AssetTypeSchema,
    AssetTypeCreate,
    AssetTypeUpdate,
    Scanner as ScannerSchema,
    ScannerCreate,
    ScannerUpdate
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

