# Vulnerability Management System - Backend API

Backend API для системы управления уязвимостями на FastAPI.

## Технологии

- **FastAPI** - Современный веб-фреймворк для построения API
- **Python 3.9+** 
- **Uvicorn** - ASGI сервер
- **Pydantic** - Валидация данных

## Установка и запуск

### 1. Создать виртуальное окружение

```bash
cd backend
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 2. Установить зависимости

```bash
pip install -r requirements.txt
```

### 3. Запустить сервер

```bash
uvicorn main:app --reload
```

Сервер будет доступен по адресу: http://localhost:8000

API документация (Swagger): http://localhost:8000/docs

## API Эндпоинты

### Клиенты (`/api/clients`)
- `GET /api/clients` - Получить список всех клиентов
- `GET /api/clients/{client_id}` - Получить информацию о клиенте
- `GET /api/clients/{client_id}/projects` - Получить проекты клиента
- `POST /api/clients` - Создать нового клиента
- `PUT /api/clients/{client_id}` - Обновить информацию о клиенте
- `DELETE /api/clients/{client_id}` - Удалить клиента
- `POST /api/clients/{client_id}/projects` - Создать проект для клиента

### Уязвимости (`/api/vulnerabilities`)
- `GET /api/vulnerabilities` - Получить список уязвимостей (с фильтрацией)
- `GET /api/vulnerabilities/{vulnerability_id}` - Получить информацию об уязвимости
- `POST /api/vulnerabilities` - Создать новую уязвимость вручную
- `PUT /api/vulnerabilities/{vulnerability_id}` - Обновить уязвимость
- `DELETE /api/vulnerabilities/{vulnerability_id}` - Удалить уязвимость
- `POST /api/vulnerabilities/import` - Импортировать уязвимости из сканера
- `GET /api/vulnerabilities/stats/criticality` - Статистика по критичности

**Фильтры для GET /api/vulnerabilities:**
- `criticality` - Critical, High, Medium, Low
- `status` - Open, In Progress, Fixed, Verified
- `client` - ID клиента
- `search` - Поиск по ID, названию, активу

### Тикеты (`/api/tickets`)
- `GET /api/tickets` - Получить список тикетов (с фильтрацией)
- `GET /api/tickets/{ticket_id}` - Получить информацию о тикете
- `POST /api/tickets` - Создать новый тикет
- `PUT /api/tickets/{ticket_id}` - Обновить тикет
- `DELETE /api/tickets/{ticket_id}` - Удалить тикет
- `POST /api/tickets/{ticket_id}/messages` - Добавить сообщение в чат
- `GET /api/tickets/stats/priority` - Статистика по приоритетам
- `GET /api/tickets/stats/status` - Статистика по статусам

**Фильтры для GET /api/tickets:**
- `priority` - Critical, High, Medium, Low
- `status` - Open, In Progress, Fixed, Verified
- `client` - ID клиента
- `search` - Поиск по ID, названию

### Активы (`/api/assets`)
- `GET /api/assets` - Получить список активов (с фильтрацией)
- `GET /api/assets/{asset_id}` - Получить информацию об активе
- `POST /api/assets` - Добавить новый актив
- `PUT /api/assets/{asset_id}` - Обновить актив
- `DELETE /api/assets/{asset_id}` - Удалить актив
- `POST /api/assets/import` - Импортировать активы из CMDB
- `GET /api/assets/export/csv` - Экспортировать активы в CSV

**Фильтры для GET /api/assets:**
- `type` - Тип актива
- `status` - Статус актива
- `criticality` - Критичность
- `client` - ID клиента
- `search` - Поиск по ID, имени, IP

### Отчёты (`/api/reports`)
- `GET /api/reports/dashboard` - Получить данные для дашборда
- `GET /api/reports/vulnerability-trend` - Тренд уязвимостей
- `GET /api/reports/assets-distribution` - Распределение активов
- `POST /api/reports/generate` - Сгенерировать отчёт
- `GET /api/reports/templates` - Получить список шаблонов

## Структура проекта

```
backend/
├── app/
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── clients.py         # Эндпоинты клиентов
│   │   ├── vulnerabilities.py # Эндпоинты уязвимостей
│   │   ├── tickets.py         # Эндпоинты тикетов
│   │   ├── assets.py          # Эндпоинты активов
│   │   └── reports.py         # Эндпоинты отчётов
│   └── data/
│       ├── __init__.py
│       └── mock_data.py       # Моковые данные
├── main.py                    # Главный файл приложения
├── requirements.txt           # Зависимости
└── README.md
```

## Примеры использования

### Получить список всех клиентов
```bash
curl http://localhost:8000/api/clients
```

### Получить уязвимости с фильтрацией
```bash
curl "http://localhost:8000/api/vulnerabilities?criticality=Critical&client=client-a"
```

### Создать новый тикет
```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новый тикет",
    "priority": "High",
    "client": "client-a"
  }'
```

### Получить статистику дашборда
```bash
curl "http://localhost:8000/api/reports/dashboard?client=client-a"
```

## CORS

API настроен для работы с фронтендом на `http://localhost:5173`.

## Дальнейшее развитие

- [ ] Добавить базу данных (PostgreSQL)
- [ ] Добавить аутентификацию (JWT)
- [ ] Добавить реальный парсинг файлов импорта
- [ ] Добавить генерацию отчётов в PDF/Excel
- [ ] Добавить WebSocket для real-time обновлений
- [ ] Добавить Redis для кэширования
- [ ] Добавить логирование
- [ ] Добавить тесты

