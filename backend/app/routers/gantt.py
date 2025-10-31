"""
API routes for Gantt chart tasks management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import GanttTask, Project
from app.schemas import (
    GanttTask as GanttTaskSchema,
    GanttTaskCreate,
    GanttTaskUpdate
)

router = APIRouter(prefix="/gantt", tags=["gantt"])


@router.get("/projects/{project_id}/tasks", response_model=List[GanttTaskSchema])
def get_gantt_tasks(project_id: int, db: Session = Depends(get_db)):
    """Get all Gantt tasks for a project"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    tasks = db.query(GanttTask).filter(GanttTask.project_id == project_id).all()
    return tasks


@router.get("/tasks/{task_id}", response_model=GanttTaskSchema)
def get_gantt_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific Gantt task by ID"""
    task = db.query(GanttTask).filter(GanttTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gantt task not found"
        )
    return task


@router.post("/tasks", response_model=GanttTaskSchema, status_code=status.HTTP_201_CREATED)
def create_gantt_task(task: GanttTaskCreate, db: Session = Depends(get_db)):
    """Create a new Gantt task"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == task.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify task dates are within project dates
    if task.start_date < project.start_date or task.end_date > project.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task dates must be within project start and end dates"
        )
    
    # Verify start_date <= end_date
    if task.start_date > task.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task start date must be before or equal to end date"
        )
    
    db_task = GanttTask(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put("/tasks/{task_id}", response_model=GanttTaskSchema)
def update_gantt_task(
    task_id: int,
    task_update: GanttTaskUpdate,
    db: Session = Depends(get_db)
):
    """Update a Gantt task"""
    db_task = db.query(GanttTask).filter(GanttTask.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gantt task not found"
        )
    
    # Get project for date validation
    project = db.query(Project).filter(Project.id == db_task.project_id).first()
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    # Validate dates if being updated
    start_date = update_data.get("start_date", db_task.start_date)
    end_date = update_data.get("end_date", db_task.end_date)
    
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task start date must be before or equal to end date"
        )
    
    if start_date < project.start_date or end_date > project.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task dates must be within project start and end dates"
        )
    
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gantt_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a Gantt task"""
    db_task = db.query(GanttTask).filter(GanttTask.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gantt task not found"
        )
    
    db.delete(db_task)
    db.commit()
    return None


@router.delete("/projects/{project_id}/tasks", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_gantt_tasks(project_id: int, db: Session = Depends(get_db)):
    """Delete all Gantt tasks for a project"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.query(GanttTask).filter(GanttTask.project_id == project_id).delete()
    db.commit()
    return None

