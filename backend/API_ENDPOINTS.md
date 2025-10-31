# API Endpoints Documentation

Полная документация всех API эндпоинтов бэкенда.

## Base URL
```
http://localhost:8000/api/v1
```

## Clients (Клиенты)

### GET /clients/
Получить список всех клиентов
- Query параметры:
  - `skip` (int, default: 0) - количество записей для пропуска
  - `limit` (int, default: 100) - максимальное количество записей
- Response: `List[Client]`

### GET /clients/{client_id}
Получить клиента по ID
- Path параметры:
  - `client_id` (UUID) - ID клиента
- Response: `Client`

### POST /clients/
Создать нового клиента
- Body: `ClientCreate`
- Response: `Client` (201 Created)

### PUT /clients/{client_id}
Обновить клиента
- Path параметры:
  - `client_id` (UUID) - ID клиента
- Body: `ClientUpdate`
- Response: `Client`

### DELETE /clients/{client_id}
Удалить клиента
- Path параметры:
  - `client_id` (UUID) - ID клиента
- Response: 204 No Content

### POST /clients/{client_id}/contacts
Добавить дополнительный контакт к клиенту
- Path параметры:
  - `client_id` (UUID) - ID клиента
- Body: `ClientAdditionalContactCreate`
- Response: `ClientAdditionalContact` (201 Created)

### PUT /clients/{client_id}/contacts/{contact_id}
Обновить дополнительный контакт
- Path параметры:
  - `client_id` (UUID) - ID клиента
  - `contact_id` (UUID) - ID контакта
- Body: `ClientAdditionalContactUpdate`
- Response: `ClientAdditionalContact`

### DELETE /clients/{client_id}/contacts/{contact_id}
Удалить дополнительный контакт
- Path параметры:
  - `client_id` (UUID) - ID клиента
  - `contact_id` (UUID) - ID контакта
- Response: 204 No Content

## Projects (Проекты)

### GET /projects/
Получить список всех проектов
- Query параметры:
  - `skip` (int, default: 0)
  - `limit` (int, default: 100)
  - `client_id` (UUID, optional) - фильтр по клиенту
- Response: `List[Project]`

### GET /projects/{project_id}
Получить проект по ID
- Path параметры:
  - `project_id` (UUID) - ID проекта
- Response: `Project`

### POST /projects/
Создать новый проект
- Body: `ProjectCreate`
  - `team_member_ids` (List[UUID], optional) - список ID рабочих
- Response: `Project` (201 Created)

### PUT /projects/{project_id}
Обновить проект
- Path параметры:
  - `project_id` (UUID) - ID проекта
- Body: `ProjectUpdate`
  - `team_member_ids` (List[UUID], optional) - обновить команду проекта
- Response: `Project`

### DELETE /projects/{project_id}
Удалить проект
- Path параметры:
  - `project_id` (UUID) - ID проекта
- Response: 204 No Content

## Assets (Активы)

### GET /assets/
Получить список всех активов
- Query параметры:
  - `skip` (int, default: 0)
  - `limit` (int, default: 100)
  - `client_id` (UUID, optional) - фильтр по клиенту
  - `type_id` (UUID, optional) - фильтр по типу
- Response: `List[Asset]`

### GET /assets/{asset_id}
Получить актив по ID
- Path параметры:
  - `asset_id` (UUID) - ID актива
- Response: `Asset`

### POST /assets/
Создать новый актив
- Body: `AssetCreate`
- Response: `Asset` (201 Created)

### PUT /assets/{asset_id}
Обновить актив
- Path параметры:
  - `asset_id` (UUID) - ID актива
- Body: `AssetUpdate`
- Response: `Asset`

### DELETE /assets/{asset_id}
Удалить актив
- Path параметры:
  - `asset_id` (UUID) - ID актива
- Response: 204 No Content

## Vulnerabilities (Уязвимости)

### GET /vulnerabilities/
Получить список всех уязвимостей
- Query параметры:
  - `skip` (int, default: 0)
  - `limit` (int, default: 100)
  - `client_id` (UUID, optional) - фильтр по клиенту
  - `asset_id` (UUID, optional) - фильтр по активу
  - `status` (str, optional) - фильтр по статусу
  - `criticality` (str, optional) - фильтр по критичности
- Response: `List[Vulnerability]`

### GET /vulnerabilities/{vulnerability_id}
Получить уязвимость по ID
- Path параметры:
  - `vulnerability_id` (UUID) - ID уязвимости
- Response: `Vulnerability`

### POST /vulnerabilities/
Создать новую уязвимость
- Body: `VulnerabilityCreate`
- Response: `Vulnerability` (201 Created)

### PUT /vulnerabilities/{vulnerability_id}
Обновить уязвимость
- Path параметры:
  - `vulnerability_id` (UUID) - ID уязвимости
- Body: `VulnerabilityUpdate`
- Response: `Vulnerability`

### DELETE /vulnerabilities/{vulnerability_id}
Удалить уязвимость
- Path параметры:
  - `vulnerability_id` (UUID) - ID уязвимости
- Response: 204 No Content

## Tickets (Тикеты)

### GET /tickets/
Получить список всех тикетов
- Query параметры:
  - `skip` (int, default: 0)
  - `limit` (int, default: 100)
  - `client_id` (UUID, optional) - фильтр по клиенту
  - `status` (str, optional) - фильтр по статусу
  - `priority` (str, optional) - фильтр по приоритету
- Response: `List[Ticket]`

### GET /tickets/{ticket_id}
Получить тикет по ID (включая связанные уязвимости и сообщения)
- Path параметры:
  - `ticket_id` (UUID) - ID тикета
- Response: `Ticket`

### POST /tickets/
Создать новый тикет
- Body: `TicketCreate`
  - `vulnerability_ids` (List[UUID], optional) - список ID уязвимостей
- Response: `Ticket` (201 Created)

### PUT /tickets/{ticket_id}
Обновить тикет
- Path параметры:
  - `ticket_id` (UUID) - ID тикета
- Body: `TicketUpdate`
  - `vulnerability_ids` (List[UUID], optional) - обновить список уязвимостей
- Response: `Ticket`

### DELETE /tickets/{ticket_id}
Удалить тикет
- Path параметры:
  - `ticket_id` (UUID) - ID тикета
- Response: 204 No Content

### POST /tickets/{ticket_id}/messages
Добавить сообщение к тикету
- Path параметры:
  - `ticket_id` (UUID) - ID тикета
- Body: `TicketMessageCreate`
- Response: `TicketMessage` (201 Created)

### GET /tickets/{ticket_id}/messages
Получить все сообщения тикета
- Path параметры:
  - `ticket_id` (UUID) - ID тикета
- Response: `List[TicketMessage]`

## Workers (Рабочие)

### GET /workers/
Получить список всех рабочих
- Query параметры:
  - `skip` (int, default: 0)
  - `limit` (int, default: 100)
- Response: `List[Worker]`

### GET /workers/{worker_id}
Получить рабочего по ID
- Path параметры:
  - `worker_id` (UUID) - ID рабочего
- Response: `Worker`

### POST /workers/
Создать нового рабочего
- Body: `WorkerCreate`
- Response: `Worker` (201 Created)

### PUT /workers/{worker_id}
Обновить рабочего
- Path параметры:
  - `worker_id` (UUID) - ID рабочего
- Body: `WorkerUpdate`
- Response: `Worker`

### DELETE /workers/{worker_id}
Удалить рабочего
- Path параметры:
  - `worker_id` (UUID) - ID рабочего
- Response: 204 No Content

## Reference Data (Справочники)

### Asset Types (Типы активов)

#### GET /reference/asset-types/
Получить список всех типов активов
- Response: `List[AssetType]`

#### GET /reference/asset-types/{asset_type_id}
Получить тип актива по ID
- Response: `AssetType`

#### POST /reference/asset-types/
Создать новый тип актива
- Body: `AssetTypeCreate`
- Response: `AssetType` (201 Created)

#### PUT /reference/asset-types/{asset_type_id}
Обновить тип актива
- Body: `AssetTypeUpdate`
- Response: `AssetType`

#### DELETE /reference/asset-types/{asset_type_id}
Удалить тип актива
- Response: 204 No Content

### Scanners (Сканеры)

#### GET /reference/scanners/
Получить список всех сканеров
- Response: `List[Scanner]`

#### GET /reference/scanners/{scanner_id}
Получить сканер по ID
- Response: `Scanner`

#### POST /reference/scanners/
Создать новый сканер
- Body: `ScannerCreate`
- Response: `Scanner` (201 Created)

#### PUT /reference/scanners/{scanner_id}
Обновить сканер
- Body: `ScannerUpdate`
- Response: `Scanner`

#### DELETE /reference/scanners/{scanner_id}
Удалить сканер
- Response: 204 No Content

## Gantt Tasks (Задачи Ганта)

### GET /gantt/projects/{project_id}/tasks
Получить все задачи Ганта для проекта
- Path параметры:
  - `project_id` (UUID) - ID проекта
- Response: `List[GanttTask]`

### GET /gantt/tasks/{task_id}
Получить задачу Ганта по ID
- Path параметры:
  - `task_id` (UUID) - ID задачи
- Response: `GanttTask`

### POST /gantt/tasks
Создать новую задачу Ганта
- Body: `GanttTaskCreate`
  - Даты задачи должны быть в пределах дат проекта
- Response: `GanttTask` (201 Created)

### PUT /gantt/tasks/{task_id}
Обновить задачу Ганта
- Path параметры:
  - `task_id` (UUID) - ID задачи
- Body: `GanttTaskUpdate`
  - Обновленные даты должны быть в пределах дат проекта
- Response: `GanttTask`

### DELETE /gantt/tasks/{task_id}
Удалить задачу Ганта
- Path параметры:
  - `task_id` (UUID) - ID задачи
- Response: 204 No Content

### DELETE /gantt/projects/{project_id}/tasks
Удалить все задачи Ганта для проекта
- Path параметры:
  - `project_id` (UUID) - ID проекта
- Response: 204 No Content

## Примеры запросов

### Создание клиента с дополнительными контактами
```json
POST /api/v1/clients/
{
  "name": "ООО ТехноСервис",
  "short_name": "TSV",
  "industry": "IT-инфраструктура",
  "contact_person": "Иванов И.И.",
  "position": "Директор",
  "phone": "+7 (495) 123-45-67",
  "email": "ivanov@example.ru",
  "sla": "Premium",
  "security_level": "Critical",
  "billing_cycle": "Monthly",
  "additional_contacts": [
    {
      "name": "Петров П.П.",
      "role": "IT-директор",
      "email": "petrov@example.ru",
      "phone": "+7 (495) 123-45-68"
    }
  ]
}
```

### Создание проекта с командой
```json
POST /api/v1/projects/
{
  "client_id": "uuid-here",
  "name": "Аудит безопасности",
  "type": "Penetration Test",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "priority": "High",
  "team_member_ids": ["uuid-worker-1", "uuid-worker-2"]
}
```

### Создание тикета с уязвимостями
```json
POST /api/v1/tickets/
{
  "client_id": "uuid-here",
  "title": "Критические уязвимости требуют устранения",
  "priority": "Critical",
  "vulnerability_ids": ["uuid-vuln-1", "uuid-vuln-2"]
}
```

