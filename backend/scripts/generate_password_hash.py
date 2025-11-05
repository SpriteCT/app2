#!/usr/bin/env python3
"""
Скрипт для генерации хеша пароля
Запуск: python scripts/generate_password_hash.py
"""
import sys
import os

# Добавляем путь к app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Пароль по умолчанию
DEFAULT_PASSWORD = "password123"

# Генерируем хеш
hashed = pwd_context.hash(DEFAULT_PASSWORD)

print(f"Пароль: {DEFAULT_PASSWORD}")
print(f"Хеш: {hashed}")
print("\nИспользуйте этот хеш в insert_test_data.sql")

