"""
Роутер для работы с активами
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.data import mock_data

router = APIRouter()

@router.get("/")
async def get_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    type: Optional[str] = None,
    status: Optional[str] = None,
    criticality: Optional[str] = None,
    client: Optional[str] = None,
    search: Optional[str] = None
) -> List[dict]:
    """
    Получить список активов с фильтрацией
    """
    result = mock_data.mock_assets
    
    # Фильтрация по типу
    if type and type != "All":
        result = [a for a in result if a["type"] == type]
    
    # Фильтрация по статусу
    if status and status != "All":
        result = [a for a in result if a["status"] == status]
    
    # Фильтрация по критичности
    if criticality and criticality != "All":
        result = [a for a in result if a["criticality"] == criticality]
    
    # Поиск
    if search:
        search_lower = search.lower()
        result = [
            a for a in result
            if search_lower in a["id"].lower()
            or search_lower in a["name"].lower()
            or search_lower in a["ipAddress"].lower()
        ]
    
    return result[skip:skip+limit]

@router.get("/{asset_id}")
async def get_asset(asset_id: str) -> dict:
    """
    Получить информацию о конкретном активе
    """
    for asset in mock_data.mock_assets:
        if asset["id"] == asset_id:
            return asset
    raise HTTPException(status_code=404, detail="Asset not found")

@router.post("/")
async def create_asset(asset: dict) -> dict:
    """
    Добавить новый актив
    """
    from app.data.client_codes import get_client_code
    
    client_id = asset.get("client") or "1"
    code = get_client_code(client_id)
    
    existing = [a for a in mock_data.mock_assets]
    number = len(existing) + 1
    
    new_asset = {
        "id": f"A-{code}-{number:03d}",
        "vulnerabilities": [],
        "tickets": [],
        "lastScan": "2024-01-01",
        **asset
    }
    mock_data.mock_assets.append(new_asset)
    return new_asset

@router.put("/{asset_id}")
async def update_asset(asset_id: str, asset_data: dict) -> dict:
    """
    Обновить информацию об активе
    """
    for i, asset in enumerate(mock_data.mock_assets):
        if asset["id"] == asset_id:
            mock_data.mock_assets[i] = {**asset, **asset_data}
            return mock_data.mock_assets[i]
    raise HTTPException(status_code=404, detail="Asset not found")

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str) -> dict:
    """
    Удалить актив
    """
    for i, asset in enumerate(mock_data.mock_assets):
        if asset["id"] == asset_id:
            deleted = mock_data.mock_assets.pop(i)
            return {"status": "deleted", "asset": deleted}
    raise HTTPException(status_code=404, detail="Asset not found")

@router.post("/import")
async def import_assets(source: str, file_data: dict) -> dict:
    """
    Импортировать активы из CMDB или файла
    """
    from app.data.client_codes import get_client_code
    
    imported = []
    for asset in file_data.get("assets", []):
        client_id = asset.get("client") or "1"  # Default client
        code = get_client_code(client_id)
        existing = [a for a in mock_data.mock_assets]
        number = len(existing) + len(imported) + 1
        imported.append({
            "id": f"A-{code}-{number:03d}",
            **asset
        })
    
    mock_data.mock_assets.extend(imported)
    
    return {
        "status": "success",
        "imported": len(imported),
        "source": source
    }

@router.get("/export/csv")
async def export_assets_csv(client: Optional[str] = None) -> dict:
    """
    Экспортировать активы в CSV для сканеров
    """
    result = mock_data.mock_assets
    
    if client and client != "client-all":
        result = [a for a in result if a.get("owner") == client]
    
    # В реальном приложении здесь была бы генерация CSV
    csv_data = "\n".join([
        f"{a['name']},{a['ipAddress']},{a['type']}"
        for a in result
    ])
    
    return {
        "status": "success",
        "data": csv_data,
        "format": "csv"
    }

