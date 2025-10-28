"""
Роутер для работы с уязвимостями
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.data import mock_data

router = APIRouter()

@router.get("/")
async def get_vulnerabilities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    criticality: Optional[str] = None,
    status: Optional[str] = None,
    client: Optional[str] = None,
    search: Optional[str] = None
) -> List[dict]:
    """
    Получить список уязвимостей с фильтрацией
    """
    result = mock_data.mock_vulnerabilities
    
    # Фильтрация по критичности
    if criticality and criticality != "All":
        result = [v for v in result if v["criticality"] == criticality]
    
    # Фильтрация по статусу
    if status and status != "All":
        result = [v for v in result if v["status"] == status]
    
    # Фильтрация по клиенту
    if client and client != "client-all":
        result = [v for v in result if v["client"] == client]
    
    # Поиск
    if search:
        search_lower = search.lower()
        result = [
            v for v in result
            if search_lower in v["id"].lower()
            or search_lower in v["title"].lower()
            or search_lower in v["asset"].lower()
        ]
    
    return result[skip:skip+limit]

@router.get("/{vulnerability_id}")
async def get_vulnerability(vulnerability_id: str) -> dict:
    """
    Получить информацию о конкретной уязвимости
    """
    for vuln in mock_data.mock_vulnerabilities:
        if vuln["id"] == vulnerability_id:
            return vuln
    raise HTTPException(status_code=404, detail="Vulnerability not found")

@router.post("/")
async def create_vulnerability(vulnerability: dict) -> dict:
    """
    Создать новую уязвимость вручную
    """
    from app.data.client_codes import get_client_code
    
    client_id = vulnerability.get("client")
    code = get_client_code(client_id)
    
    # Получаем последний номер для этого клиента
    existing = [v for v in mock_data.mock_vulnerabilities if v["client"] == client_id]
    number = len(existing) + 1
    
    new_vuln = {
        "id": f"V-{code}-{number:03d}",
        "tags": [],
        **vulnerability
    }
    mock_data.mock_vulnerabilities.append(new_vuln)
    return new_vuln

@router.put("/{vulnerability_id}")
async def update_vulnerability(vulnerability_id: str, vuln_data: dict) -> dict:
    """
    Обновить информацию об уязвимости
    """
    for i, vuln in enumerate(mock_data.mock_vulnerabilities):
        if vuln["id"] == vulnerability_id:
            mock_data.mock_vulnerabilities[i] = {**vuln, **vuln_data}
            return mock_data.mock_vulnerabilities[i]
    raise HTTPException(status_code=404, detail="Vulnerability not found")

@router.delete("/{vulnerability_id}")
async def delete_vulnerability(vulnerability_id: str) -> dict:
    """
    Удалить уязвимость
    """
    for i, vuln in enumerate(mock_data.mock_vulnerabilities):
        if vuln["id"] == vulnerability_id:
            deleted = mock_data.mock_vulnerabilities.pop(i)
            return {"status": "deleted", "vulnerability": deleted}
    raise HTTPException(status_code=404, detail="Vulnerability not found")

@router.post("/import")
async def import_vulnerabilities(scanner: str, file_data: dict) -> dict:
    """
    Импортировать уязвимости из сканера
    """
    from app.data.client_codes import get_client_code
    
    imported = []
    for vuln in file_data.get("vulnerabilities", []):
        client_id = vuln.get("client")
        code = get_client_code(client_id)
        existing = [v for v in mock_data.mock_vulnerabilities if v["client"] == client_id]
        number = len(existing) + len(imported) + 1
        imported.append({
            "id": f"V-{code}-{number:03d}",
            **vuln
        })
    
    mock_data.mock_vulnerabilities.extend(imported)
    
    return {
        "status": "success",
        "imported": len(imported),
        "scanner": scanner
    }

@router.get("/stats/criticality")
async def get_criticality_stats(client: Optional[str] = None) -> dict:
    """
    Получить статистику по критичности уязвимостей
    """
    result = mock_data.mock_vulnerabilities
    
    if client and client != "client-all":
        result = [v for v in result if v["client"] == client]
    
    stats = {
        "Critical": len([v for v in result if v["criticality"] == "Critical"]),
        "High": len([v for v in result if v["criticality"] == "High"]),
        "Medium": len([v for v in result if v["criticality"] == "Medium"]),
        "Low": len([v for v in result if v["criticality"] == "Low"]),
    }
    
    return stats

