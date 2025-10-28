"""
Роутер для отчетов и аналитики
"""
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime

from app.data import mock_data

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    client: Optional[str] = "client-all"
) -> dict:
    """
    Получить данные для дашборда
    """
    # Фильтруем данные по клиенту
    vulnerabilities = mock_data.mock_vulnerabilities
    tickets = mock_data.mock_tickets
    assets = mock_data.mock_assets
    
    if client and client != "client-all":
        vulnerabilities = [v for v in vulnerabilities if v["client"] == client]
        tickets = [t for t in tickets if t["client"] == client]
    
    # Уязвимости по критичности
    vuln_by_crit = {
        "Critical": len([v for v in vulnerabilities if v["criticality"] == "Critical"]),
        "High": len([v for v in vulnerabilities if v["criticality"] == "High"]),
        "Medium": len([v for v in vulnerabilities if v["criticality"] == "Medium"]),
        "Low": len([v for v in vulnerabilities if v["criticality"] == "Low"]),
    }
    
    # Тикеты по статусам
    tickets_by_status = {
        "Open": len([t for t in tickets if t["status"] == "Open"]),
        "In Progress": len([t for t in tickets if t["status"] == "In Progress"]),
        "Fixed": len([t for t in tickets if t["status"] == "Fixed"]),
        "Verified": len([t for t in tickets if t["status"] == "Verified"]),
    }
    
    # Тикеты по приоритетам
    tickets_by_priority = {
        "Critical": len([t for t in tickets if t["priority"] == "Critical"]),
        "High": len([t for t in tickets if t["priority"] == "High"]),
        "Medium": len([t for t in tickets if t["priority"] == "Medium"]),
        "Low": len([t for t in tickets if t["priority"] == "Low"]),
    }
    
    # Общая статистика
    total_stats = {
        "vulnerabilities": len(vulnerabilities),
        "critical_vulnerabilities": vuln_by_crit["Critical"],
        "active_tickets": len(tickets),
        "resolved_tickets": tickets_by_status["Fixed"],
        "total_assets": len(assets),
        "assets_in_production": len([a for a in assets if a["status"] == "В эксплуатации"]),
        "resolution_rate": 72,  # Mock данные
    }
    
    return {
        "total_stats": total_stats,
        "vulnerabilities_by_criticality": vuln_by_crit,
        "tickets_by_status": tickets_by_status,
        "tickets_by_priority": tickets_by_priority,
        "client": client
    }

@router.get("/vulnerability-trend")
async def get_vulnerability_trend(
    client: Optional[str] = "client-all",
    months: int = Query(4, ge=1, le=12)
) -> dict:
    """
    Получить тренд уязвимостей по месяцам
    """
    # Mock данные для тренда
    trend = [
        {"month": "Янв", "critical": 3, "high": 2, "medium": 1, "low": 1},
        {"month": "Фев", "critical": 2, "high": 1, "medium": 2, "low": 0},
        {"month": "Мар", "critical": 1, "high": 3, "medium": 1, "low": 1},
        {"month": "Апр", "critical": 0, "high": 2, "medium": 3, "low": 0},
    ]
    
    return {
        "trend": trend,
        "client": client
    }

@router.get("/assets-distribution")
async def get_assets_distribution(
    client: Optional[str] = "client-all"
) -> dict:
    """
    Получить распределение активов по статусам
    """
    result = mock_data.mock_assets
    
    distribution = {
        "В эксплуатации": len([a for a in result if a["status"] == "В эксплуатации"]),
        "Недоступен": len([a for a in result if a["status"] == "Недоступен"]),
        "Выведен из эксплуатации": len([a for a in result if a["status"] == "Выведен из эксплуатации"]),
    }
    
    return {
        "distribution": distribution,
        "client": client
    }

@router.post("/generate")
async def generate_report(
    report_type: str,
    start_date: str,
    end_date: str,
    format: str = "pdf",
    client: Optional[str] = None
) -> dict:
    """
    Сгенерировать отчет по заданным параметрам
    """
    return {
        "status": "success",
        "report_type": report_type,
        "start_date": start_date,
        "end_date": end_date,
        "format": format,
        "client": client,
        "generated_at": datetime.now().isoformat(),
        "message": "Report generation in progress"
    }

@router.get("/templates")
async def get_report_templates() -> list:
    """
    Получить список доступных шаблонов отчётов
    """
    return [
        {
            "id": "weekly",
            "name": "Еженедельный отчёт",
            "description": "Статистика за неделю",
            "icon": "blue"
        },
        {
            "id": "monthly",
            "name": "Ежемесячный отчёт",
            "description": "Полная статистика за месяц",
            "icon": "purple"
        },
        {
            "id": "client",
            "name": "Отчёт для клиента",
            "description": "Итоговый отчёт по проекту",
            "icon": "green"
        }
    ]

