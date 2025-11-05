"""
Скрипт для хеширования паролей по умолчанию
Запустить один раз для генерации хешей для тестовых данных
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Пароль по умолчанию для всех пользователей
DEFAULT_PASSWORD = "password123"

# Генерируем хеш
hashed = pwd_context.hash(DEFAULT_PASSWORD)

print(f"Пароль по умолчанию: {DEFAULT_PASSWORD}")
print(f"Хеш для вставки в БД: {hashed}")

