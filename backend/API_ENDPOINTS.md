# API Endpoints - Краткая документация

## Общая информация
- **Base URL**: `http://localhost:8000`
- **CORS**: Разрешено для `http://localhost:5173`
- **Документация**: http://localhost:8000/docs (Swagger UI)

## Клиенты (`/api/clients`)

### Получить список клиентов
```http
GET /api/clients?skip=0&limit=100
```

### Получить информацию о клиенте
```http
GET /api/clients/{client_id}
```

### Получить проекты клиента
```http
GET /api/clients/{client_id}/projects
```

### Создать клиента
```http
POST /api/clients
Content-Type: application/json

{
  "name": "ООО Пример",
  "contactPerson": "Иванов И.И.",
  "email": "ivanov@example.ru",
  ...
}
```

### Обновить клиента
```http
PUT /api/clients/{client_id}
```

### Удалить клиента
```http
DELETE /api/clients/{client_id}
```

### Создать проект для клиента
```http
POST /api/clients/{client_id}/projects
```

---

## Уязвимости (`/api/vulnerabilities`)

### Получить список уязвимостей
```http
GET /api/vulnerabilities?criticality=Critical&status=Open&client=client-a&search=SQL
```
**Фильтры:**
- `criticality`: Critical, High, Medium, Low, All
- `status`: Open, In Progress, Fixed, Verified, All
- `client`: client-a, client-b, ..., client-all
- `search`: поиск по ID, названию, активу
- `skip`, `limit`: пагинация

### Получить уязвимость
```http
GET /api/vulnerabilities/{vulnerability_id}
```

### Создать уязвимость вручную
```http
POST /api/vulnerabilities
Content-Type: application/json

{
  "title": "Новая уязвимость",
  "asset": "server.example.com",
  "criticality": "High",
  ...
}
```

### Импортировать уязвимости
```http
POST /api/vulnerabilities/import
Content-Type: application/json

{
  "scanner": "Nessus",
  "vulnerabilities": [...]
}
```

### Статистика по критичности
```http
GET /api/vulnerabilities/stats/criticality?client=client-a
```

---

## Тикеты (`/api/tickets`)

### Получить список тикетов
```http
GET /api/tickets?priority=Critical&status=Open&client=client-a
```
**Фильтры:**
- `priority`: Critical, High, Medium, Low, All
- `status`: Open, In Progress, Fixed, Verified, All
- `client`: ID клиента
- `search`: поиск

### Получить тикет
```http
GET /api/tickets/{ticket_id}
```

### Создать тикет
```http
POST /api/tickets
Content-Type: application/json

{
  "title": "Новый тикет",
  "priority": "High",
  "vulnerabilities": ["VULN-001"],
  ...
}
```

### Добавить сообщение в чат
```http
POST /api/tickets/{ticket_id}/messages
Content-Type: application/json

{
  "author": "Иванов И.И.",
  "message": "Приступаю к работе"
}
```

### Статистика по приоритетам
```http
GET /api/tickets/stats/priority?client=client-a
```

### Статистика по статусам
```http
GET /api/tickets/stats/status?client=client-a
```

---

## Активы (`/api/assets`)

### Получить список активов
```http
GET /api/assets?type=Web%20Server&status=В%20эксплуатации&criticality=Critical
```
**Фильтры:**
- `type`: тип актива
- `status`: статус
- `criticality`: критичность
- `search`: поиск

### Получить актив
```http
GET /api/assets/{asset_id}
```

### Импортировать активы
```http
POST /api/assets/import
Content-Type: application/json

{
  "source": "ServiceNow",
  "assets": [...]
}
```

### Экспортировать в CSV
```http
GET /api/assets/export/csv?client=client-a
```

---

## Отчёты (`/api/reports`)

### Дашборд
```http
GET /api/reports/dashboard?client=client-a
```
Возвращает:
- Общую статистику
- Уязвимости по критичности
- Тикеты по статусам и приоритетам

### Тренд уязвимостей
```http
GET /api/reports/vulnerability-trend?months=4
```

### Распределение активов
```http
GET /api/reports/assets-distribution
```

### Сгенерировать отчёт
```http
POST /api/reports/generate
Content-Type: application/json

{
  "report_type": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "format": "pdf",
  "client": "client-a"
}
```

### Шаблоны отчётов
```http
GET /api/reports/templates
```

---

## Общие эндпоинты

### Проверка здоровья
```http
GET /api/health
```

### Корневой эндпоинт
```http
GET /
```

