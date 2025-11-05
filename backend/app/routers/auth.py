"""
API routes for authentication
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import User
from app.schemas import User as UserSchema

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    user: UserSchema
    token: str  # Пока упрощенный токен, можно заменить на JWT


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Авторизация пользователя по email"""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    
    # Устанавливаем пароль по умолчанию, если его нет
    if not user.password_hash:
        user.password_hash = "password123"
        db.commit()
        db.refresh(user)
    
    # Проверяем пароль (без хеширования, в чистом виде)
    if user.password_hash != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    
    # Упрощенный токен (в реальном приложении используйте JWT)
    # Здесь просто возвращаем ID пользователя как токен
    token = f"user_{user.id}"
    
    return LoginResponse(user=user, token=token)


@router.get("/me", response_model=UserSchema)
def get_current_user(token: str, db: Session = Depends(get_db)):
    """Получить информацию о текущем пользователе по токену"""
    if not token or not token.startswith("user_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен"
        )
    
    try:
        user_id = int(token.replace("user_", ""))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )
    
    return user

