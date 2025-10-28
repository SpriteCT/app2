"""
Роутер для работы с тикетами
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.data import mock_data

router = APIRouter()

@router.get("/")
async def get_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    priority: Optional[str] = None,
    status: Optional[str] = None,
    client: Optional[str] = None,
    search: Optional[str] = None
) -> List[dict]:
    """
    Получить список тикетов с фильтрацией
    """
    result = mock_data.mock_tickets
    
    # Фильтрация по приоритету
    if priority and priority != "All":
        result = [t for t in result if t["priority"] == priority]
    
    # Фильтрация по статусу
    if status and status != "All":
        result = [t for t in result if t["status"] == status]
    
    # Фильтрация по клиенту
    if client and client != "client-all":
        result = [t for t in result if t["client"] == client]
    
    # Поиск
    if search:
        search_lower = search.lower()
        result = [
            t for t in result
            if search_lower in t["id"].lower()
            or search_lower in t["title"].lower()
            or search_lower in t.get("client", "").lower()
        ]
    
    return result[skip:skip+limit]

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str) -> dict:
    """
    Получить информацию о конкретном тикете
    """
    for ticket in mock_data.mock_tickets:
        if ticket["id"] == ticket_id:
            return ticket
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.post("/")
async def create_ticket(ticket: dict) -> dict:
    """
    Создать новый тикет
    """
    from app.data.client_codes import get_client_code
    
    client_id = ticket.get("client")
    code = get_client_code(client_id)
    
    existing = [t for t in mock_data.mock_tickets if t["client"] == client_id]
    number = len(existing) + 1
    
    new_ticket = {
        "id": f"T-{code}-{number:03d}",
        "chatMessages": [],
        "resolution": "",
        **ticket
    }
    mock_data.mock_tickets.append(new_ticket)
    return new_ticket

@router.put("/{ticket_id}")
async def update_ticket(ticket_id: str, ticket_data: dict) -> dict:
    """
    Обновить информацию о тикете
    """
    for i, ticket in enumerate(mock_data.mock_tickets):
        if ticket["id"] == ticket_id:
            mock_data.mock_tickets[i] = {**ticket, **ticket_data}
            return mock_data.mock_tickets[i]
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: str) -> dict:
    """
    Удалить тикет
    """
    for i, ticket in enumerate(mock_data.mock_tickets):
        if ticket["id"] == ticket_id:
            deleted = mock_data.mock_tickets.pop(i)
            return {"status": "deleted", "ticket": deleted}
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.post("/{ticket_id}/messages")
async def add_ticket_message(ticket_id: str, message: dict) -> dict:
    """
    Добавить сообщение в чат тикета
    """
    for i, ticket in enumerate(mock_data.mock_tickets):
        if ticket["id"] == ticket_id:
            new_message = {
                "id": f"msg-{len(ticket['chatMessages']) + 1}",
                "timestamp": message.get("timestamp", ""),
                **message
            }
            mock_data.mock_tickets[i]["chatMessages"].append(new_message)
            return new_message
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.get("/stats/priority")
async def get_priority_stats(client: Optional[str] = None) -> dict:
    """
    Получить статистику тикетов по приоритетам
    """
    result = mock_data.mock_tickets
    
    if client and client != "client-all":
        result = [t for t in result if t["client"] == client]
    
    stats = {
        "Critical": len([t for t in result if t["priority"] == "Critical"]),
        "High": len([t for t in result if t["priority"] == "High"]),
        "Medium": len([t for t in result if t["priority"] == "Medium"]),
        "Low": len([t for t in result if t["priority"] == "Low"]),
    }
    
    return stats

@router.get("/stats/status")
async def get_status_stats(client: Optional[str] = None) -> dict:
    """
    Получить статистику тикетов по статусам
    """
    result = mock_data.mock_tickets
    
    if client and client != "client-all":
        result = [t for t in result if t["client"] == client]
    
    stats = {
        "Open": len([t for t in result if t["status"] == "Open"]),
        "In Progress": len([t for t in result if t["status"] == "In Progress"]),
        "Fixed": len([t for t in result if t["status"] == "Fixed"]),
        "Verified": len([t for t in result if t["status"] == "Verified"]),
    }
    
    return stats

