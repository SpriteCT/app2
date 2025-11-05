"""
API routes for projects management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Project, ProjectTeamMember, Client
from app.schemas import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate
)
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[ProjectSchema])
def get_projects(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all projects, optionally filtered by client"""
    query = db.query(Project).options(joinedload(Project.team_members).joinedload(ProjectTeamMember.user_account))
    if client_id:
        query = query.filter(Project.client_id == client_id)
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    project = db.query(Project).options(
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user_account)
    ).filter(Project.id == project_id).first()
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
        for user_account_id in project.team_member_ids:
            db_team_member = ProjectTeamMember(
                project_id=db_project.id,
                user_account_id=user_account_id
            )
            db.add(db_team_member)
    
    db.commit()
    db.refresh(db_project)
    # Загружаем связанные данные для возврата
    db_project = db.query(Project).options(
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user_account)
    ).filter(Project.id == db_project.id).first()
    return db_project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
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
        db.flush()  # Убеждаемся, что удаление выполнено перед добавлением новых
        
        # Add new team members
        if project_update.team_member_ids:
            for user_account_id in project_update.team_member_ids:
                db_team_member = ProjectTeamMember(
                    project_id=project_id,
                    user_account_id=user_account_id
                )
                db.add(db_team_member)
    
    db.commit()
    db.refresh(db_project)
    # Загружаем связанные данные для возврата
    db_project = db.query(Project).options(
        joinedload(Project.team_members).joinedload(ProjectTeamMember.user_account)
    ).filter(Project.id == db_project.id).first()
    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
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

