"""
API routes for authentication
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import UserAccount
from app.schemas import UserAccount as UserAccountSchema

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    user: UserAccountSchema
    token: str  # Пока упрощенный токен, можно заменить на JWT


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Авторизация пользователя по email"""
    user = db.query(UserAccount).filter(UserAccount.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    
    # Проверяем пароль (без хеширования, в чистом виде)
    if not user.password_hash or user.password_hash != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    
    # Упрощенный токен (в реальном приложении используйте JWT)
    # Здесь просто возвращаем ID пользователя как токен
    token = f"user_{user.id}"
    
    return LoginResponse(user=user, token=token)


@router.get("/me", response_model=UserAccountSchema)
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
    
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )
    
    return user

