"""
Маппинг ID клиентов к коротким кодам для генерации ID
"""

# Словарь соответствия client_id -> код
CLIENT_CODES = {
    "client-a": "TSV",  # ТехноСервис
    "client-b": "FNH",  # ФинансХост
    "client-c": "MDD",  # МедиаДиджитал
    "client-d": "KZL",  # Козлов
    "client-e": "RZP",  # РозницаПро
    "client-f": "VGP",  # ВолковГрупп
}

def get_client_code(client_id: str) -> str:
    """Получить код клиента по его ID"""
    return CLIENT_CODES.get(client_id, "XXX")

def generate_vulnerability_id(client_id: str, number: int) -> str:
    """Сгенерировать ID уязвимости: V-TSV-001"""
    code = get_client_code(client_id)
    return f"V-{code}-{number:03d}"

def generate_ticket_id(client_id: str, number: int) -> str:
    """Сгенерировать ID тикета: T-TSV-001"""
    code = get_client_code(client_id)
    return f"T-{code}-{number:03d}"

def generate_asset_id(client_id: str, number: int) -> str:
    """Сгенерировать ID актива: A-TSV-001"""
    code = get_client_code(client_id)
    return f"A-{code}-{number:03d}"

def generate_project_id(client_id: str, number: int) -> str:
    """Сгенерировать ID проекта: P-TSV-001"""
    code = get_client_code(client_id)
    return f"P-{code}-{number:03d}"

