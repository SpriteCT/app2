"""
API routes for user accounts management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import UserAccount
from app.schemas import (
    UserAccount as UserAccountSchema,
    UserAccountCreate,
    UserAccountUpdate
)

router = APIRouter(prefix="/workers", tags=["workers"])  # Оставляем /workers для обратной совместимости


@router.get("/", response_model=List[UserAccountSchema])
def get_workers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all user accounts (workers and clients)"""
    users = db.query(UserAccount).offset(skip).limit(limit).all()
    return users


@router.get("/{worker_id}", response_model=UserAccountSchema)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    """Get a specific user account by ID"""
    user = db.query(UserAccount).filter(UserAccount.id == worker_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found"
        )
    return user


@router.post("/", response_model=UserAccountSchema, status_code=status.HTTP_201_CREATED)
def create_worker(user: UserAccountCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    # Валидация: если user_type = 'client', то client_id должен быть указан
    if user.user_type == 'client' and not user.client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="client_id is required when user_type is 'client'"
        )
    if user.user_type == 'worker' and user.client_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="client_id must be null when user_type is 'worker'"
        )
    
    db_user = UserAccount(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{worker_id}", response_model=UserAccountSchema)
def update_worker(
    worker_id: int,
    user_update: UserAccountUpdate,
    db: Session = Depends(get_db)
):
    """Update a user account"""
    db_user = db.query(UserAccount).filter(UserAccount.id == worker_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found"
        )
    
    # Валидация при обновлении
    new_user_type = user_update.user_type if user_update.user_type is not None else db_user.user_type
    new_client_id = user_update.client_id if user_update.client_id is not None else db_user.client_id
    
    if new_user_type == 'client' and not new_client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="client_id is required when user_type is 'client'"
        )
    if new_user_type == 'worker' and new_client_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="client_id must be null when user_type is 'worker'"
        )
    
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    """Delete a user account"""
    db_user = db.query(UserAccount).filter(UserAccount.id == worker_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found"
        )
    
    db.delete(db_user)
    db.commit()
    return None

