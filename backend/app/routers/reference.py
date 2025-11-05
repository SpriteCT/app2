"""
API routes for reference data (asset types, scanners, project types)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import (
    AssetType, Scanner,
    ProjectType
)
from app.schemas import (
    AssetType as AssetTypeSchema,
    AssetTypeCreate,
    AssetTypeUpdate,
    Scanner as ScannerSchema,
    ScannerCreate,
    ScannerUpdate,
    ProjectType as ProjectTypeSchema,
    ProjectTypeBase
)

router = APIRouter(prefix="/reference", tags=["reference"])


# Asset Types routes
@router.get("/asset-types", response_model=List[AssetTypeSchema])
def get_asset_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all asset types (excluding deleted ones)"""
    asset_types = db.query(AssetType).filter(AssetType.is_deleted == False).offset(skip).limit(limit).all()
    return asset_types


@router.get("/asset-types/{asset_type_id}", response_model=AssetTypeSchema)
def get_asset_type(asset_type_id: int, db: Session = Depends(get_db)):
    """Get a specific asset type by ID"""
    asset_type = db.query(AssetType).filter(AssetType.id == asset_type_id, AssetType.is_deleted == False).first()
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
    db_asset_type = db.query(AssetType).filter(AssetType.id == asset_type_id, AssetType.is_deleted == False).first()
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
    """Soft delete an asset type (mark as deleted)"""
    db_asset_type = db.query(AssetType).filter(AssetType.id == asset_type_id, AssetType.is_deleted == False).first()
    if not db_asset_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset type not found"
        )
    
    db_asset_type.is_deleted = True
    db.commit()
    return None


# Scanners routes
@router.get("/scanners", response_model=List[ScannerSchema])
def get_scanners(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all scanners (excluding deleted ones)"""
    scanners = db.query(Scanner).filter(Scanner.is_deleted == False).offset(skip).limit(limit).all()
    return scanners


@router.get("/scanners/{scanner_id}", response_model=ScannerSchema)
def get_scanner(scanner_id: int, db: Session = Depends(get_db)):
    """Get a specific scanner by ID"""
    scanner = db.query(Scanner).filter(Scanner.id == scanner_id, Scanner.is_deleted == False).first()
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
    db_scanner = db.query(Scanner).filter(Scanner.id == scanner_id, Scanner.is_deleted == False).first()
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
    """Soft delete a scanner (mark as deleted)"""
    db_scanner = db.query(Scanner).filter(Scanner.id == scanner_id, Scanner.is_deleted == False).first()
    if not db_scanner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scanner not found"
        )
    
    db_scanner.is_deleted = True
    db.commit()
    return None


# Project Types routes
@router.get("/project-types", response_model=List[ProjectTypeSchema])
def get_project_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all project types (excluding deleted ones)"""
    project_types = db.query(ProjectType).filter(ProjectType.is_deleted == False).offset(skip).limit(limit).all()
    return project_types


@router.post("/project-types", response_model=ProjectTypeSchema, status_code=status.HTTP_201_CREATED)
def create_project_type(
    project_type: ProjectTypeBase,
    db: Session = Depends(get_db)
):
    """Create a new project type"""
    db_project_type = ProjectType(**project_type.model_dump())
    db.add(db_project_type)
    db.commit()
    db.refresh(db_project_type)
    return db_project_type


@router.put("/project-types/{project_type_id}", response_model=ProjectTypeSchema)
def update_project_type(
    project_type_id: int,
    project_type_update: ProjectTypeBase,
    db: Session = Depends(get_db)
):
    """Update a project type"""
    db_project_type = db.query(ProjectType).filter(ProjectType.id == project_type_id, ProjectType.is_deleted == False).first()
    if not db_project_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project type not found"
        )
    
    update_data = project_type_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project_type, field, value)
    
    db.commit()
    db.refresh(db_project_type)
    return db_project_type


@router.delete("/project-types/{project_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_type(project_type_id: int, db: Session = Depends(get_db)):
    """Soft delete a project type (mark as deleted)"""
    db_project_type = db.query(ProjectType).filter(ProjectType.id == project_type_id, ProjectType.is_deleted == False).first()
    if not db_project_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project type not found"
        )
    
    db_project_type.is_deleted = True
    db.commit()
    return None
