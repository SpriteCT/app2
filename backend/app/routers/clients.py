"""
Роутер для работы с клиентами
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.data import mock_data

router = APIRouter()

@router.get("/")
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
) -> List[dict]:
    """
    Получить список всех клиентов
    """
    return mock_data.mock_clients[skip:skip+limit]

@router.get("/{client_id}")
async def get_client(client_id: str) -> dict:
    """
    Получить информацию о конкретном клиенте
    """
    for client in mock_data.mock_clients:
        if client["id"] == client_id:
            return client
    raise HTTPException(status_code=404, detail="Client not found")

@router.get("/{client_id}/projects")
async def get_client_projects(client_id: str) -> List[dict]:
    """
    Получить проекты клиента
    """
    projects = [
        p for p in mock_data.mock_projects 
        if p["clientId"] == client_id
    ]
    return projects

@router.post("/")
async def create_client(client: dict) -> dict:
    """
    Создать нового клиента
    """
    # В реальном приложении здесь была бы логика сохранения
    new_client = {
        "id": f"client-{len(mock_data.mock_clients) + 1}",
        **client
    }
    mock_data.mock_clients.append(new_client)
    return new_client

@router.put("/{client_id}")
async def update_client(client_id: str, client_data: dict) -> dict:
    """
    Обновить информацию о клиенте
    """
    for i, client in enumerate(mock_data.mock_clients):
        if client["id"] == client_id:
            mock_data.mock_clients[i] = {**client, **client_data}
            return mock_data.mock_clients[i]
    raise HTTPException(status_code=404, detail="Client not found")

@router.delete("/{client_id}")
async def delete_client(client_id: str) -> dict:
    """
    Удалить клиента
    """
    for i, client in enumerate(mock_data.mock_clients):
        if client["id"] == client_id:
            deleted = mock_data.mock_clients.pop(i)
            return {"status": "deleted", "client": deleted}
    raise HTTPException(status_code=404, detail="Client not found")

@router.post("/{client_id}/projects")
async def create_client_project(client_id: str, project: dict) -> dict:
    """
    Создать проект для клиента
    """
    # Проверяем существование клиента
    client_exists = any(c["id"] == client_id for c in mock_data.mock_clients)
    if not client_exists:
        raise HTTPException(status_code=404, detail="Client not found")
    
    from app.data.client_codes import get_client_code
    
    # В реальном приложении здесь была бы логика сохранения
    code = get_client_code(client_id)
    existing = [p for p in mock_data.mock_projects if p["clientId"] == client_id]
    number = len(existing) + 1
    
    new_project = {
        "id": f"P-{code}-{number:03d}",
        "clientId": client_id,
        "status": "Planning",
        "progress": 0,
        "vulnerabilities": [],
        "tickets": [],
        "assets": 0,
        **project
    }
    mock_data.mock_projects.append(new_project)
    return new_project

