"""
API routes for projects management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import Project, ProjectTeamMember, Client
from app.schemas import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[ProjectSchema])
def get_projects(
    skip: int = 0,
    limit: int = 100,
    client_id: UUID = None,
    db: Session = Depends(get_db)
):
    """Get all projects, optionally filtered by client"""
    query = db.query(Project)
    if client_id:
        query = query.filter(Project.client_id == client_id)
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: UUID, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == project.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    project_data = project.model_dump(exclude={"team_member_ids"})
    db_project = Project(**project_data)
    db.add(db_project)
    db.flush()
    
    # Add team members
    if project.team_member_ids:
        for worker_id in project.team_member_ids:
            db_team_member = ProjectTeamMember(
                project_id=db_project.id,
                worker_id=worker_id
            )
            db.add(db_team_member)
    
    db.commit()
    db.refresh(db_project)
    return db_project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: UUID,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update a project"""
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    update_data = project_update.model_dump(exclude_unset=True, exclude={"team_member_ids"})
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    # Update team members if provided
    if "team_member_ids" in project_update.model_dump(exclude_unset=True):
        # Remove existing team members
        db.query(ProjectTeamMember).filter(
            ProjectTeamMember.project_id == project_id
        ).delete()
        
        # Add new team members
        if project_update.team_member_ids:
            for worker_id in project_update.team_member_ids:
                db_team_member = ProjectTeamMember(
                    project_id=project_id,
                    worker_id=worker_id
                )
                db.add(db_team_member)
    
    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, db: Session = Depends(get_db)):
    """Delete a project"""
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(db_project)
    db.commit()
    return None

