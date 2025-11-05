"""
API routes for user accounts management (workers and clients)
Возвращает пользователей с их профилями для обратной совместимости с фронтендом
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.models import User, ClientProfile, WorkerProfile
from app.schemas import UserWithProfile

router = APIRouter(prefix="/workers", tags=["workers"])  # Оставляем /workers для обратной совместимости


def _combine_user_with_profile(user: User) -> dict:
    """Объединяет данные пользователя с его профилем"""
    result = {
        "id": user.id,
        "username": user.email,  # Для обратной совместимости используем email как username
        "password_hash": user.password_hash,
        "email": user.email,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "full_name": None,
        "phone": None,  # Для обратной совместимости (не используется из профилей)
        "user_type": None,
        "client_id": None,
        "department": None,  # Для обратной совместимости (не используется)
        "contact_name": None,  # Для обратной совместимости (не используется)
    }
    
    # Проверяем, есть ли профиль клиента
    if user.client_profile:
        result["full_name"] = user.client_profile.contact_name
        result["user_type"] = "client"
        result["client_id"] = user.client_profile.client_id
    
    # Проверяем, есть ли профиль работника
    elif user.worker_profile:
        result["full_name"] = user.worker_profile.full_name
        result["user_type"] = "worker"
    
    return result


@router.get("/", response_model=List[UserWithProfile])
def get_workers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all users with their profiles (workers and clients)"""
    users = db.query(User).options(
        joinedload(User.client_profile),
        joinedload(User.worker_profile)
    ).offset(skip).limit(limit).all()
    
    # Преобразуем в формат для фронтенда
    return [_combine_user_with_profile(user) for user in users]
