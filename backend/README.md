# Vulnerability Management API Backend

FastAPI backend для системы управления уязвимостями.

## Требования

### Для Docker:
- Docker 20.10+
- Docker Compose 2.0+

### Для локальной установки:
- Python 3.10+
- PostgreSQL 13+
- pip или poetry

## Быстрый старт с Docker

```bash
cd backend
cp .env.example .env  # Опционально: настройте параметры
docker-compose up -d
```

API будет доступен на http://localhost:8000

## Установка

### Вариант 1: С помощью Docker (рекомендуется)

1. **Скопируйте файл `.env.example` в `.env`** (опционально, есть значения по умолчанию):
```bash
cd backend
cp .env.example .env
# Отредактируйте .env при необходимости
```

2. **Запустите контейнеры:**
```bash
docker-compose up -d
```

Это автоматически:
- Создаст и запустит контейнер PostgreSQL
- Применит схему БД из `../db/schema.sql` при первом запуске
- Соберет и запустит контейнер бэкенда
- Настроит сеть между контейнерами

3. **Проверьте статус:**
```bash
docker-compose ps
```

4. **Просмотрите логи:**
```bash
docker-compose logs -f backend
docker-compose logs -f db
```

5. **Проверьте работу API:**
```bash
curl http://localhost:8000/health
# или откройте в браузере http://localhost:8000/docs
```

6. **Остановка:**
```bash
docker-compose down
```

7. **Остановка с удалением данных БД:**
```bash
docker-compose down -v
```

**Примечание:** При первом запуске PostgreSQL автоматически выполнит `schema.sql` и `insert_test_data.sql`, создав все таблицы и заполнив их тестовыми данными. Данные БД сохраняются в Docker volume `postgres_data`.

Для заполнения БД тестовыми данными вручную:
```bash
docker-compose exec db psql -U postgres -d vulnerability_db -f /docker-entrypoint-initdb.d/02-insert-test-data.sql
```

### Вариант 2: Локальная установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` в директории `backend/`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/vulnerability_db
DEBUG=True
```

4. Создайте базу данных PostgreSQL и выполните миграцию схемы:
```bash
psql -U postgres -c "CREATE DATABASE vulnerability_db;"
psql -U postgres -d vulnerability_db -f ../db/schema.sql
```

## Запуск

### С Docker (после `docker-compose up -d`)

API автоматически запускается и доступен по адресу: http://localhost:8000

### Без Docker (локально)

**Важно:** Запускайте команды из директории `backend/`, а не из `backend/app/`!

### Вариант 1: Через uvicorn напрямую
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Вариант 2: Через скрипт run.py (рекомендуется)
```bash
cd backend
python run.py
```

### Доступ к API

API будет доступен по адресу: http://localhost:8000

Документация Swagger: http://localhost:8000/docs
Документация ReDoc: http://localhost:8000/redoc

### Полезные Docker команды

```bash
# Пересобрать образы
docker-compose build

# Перезапустить сервисы
docker-compose restart

# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f db

# Выполнить команду в контейнере
docker-compose exec backend bash
docker-compose exec db psql -U postgres -d vulnerability_db

# Остановить и удалить контейнеры
docker-compose down

# Остановить и удалить контейнеры с данными
docker-compose down -v
```

## Структура проекта

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Главное приложение FastAPI
│   ├── database.py          # Настройка БД и сессий
│   ├── models.py            # SQLAlchemy модели
│   ├── schemas.py           # Pydantic схемы
│   └── routers/             # API роутеры
│       ├── __init__.py
│       ├── clients.py       # Клиенты
│       ├── projects.py       # Проекты
│       ├── assets.py         # Активы
│       ├── vulnerabilities.py # Уязвимости
│       ├── tickets.py       # Тикеты
│       ├── workers.py        # Рабочие
│       ├── reference.py      # Справочники (типы активов, сканеры)
│       └── gantt.py          # Задачи Ганта
├── requirements.txt
├── .env.example
└── README.md
```

## API Endpoints

### Clients (Клиенты)
- `GET /api/v1/clients/` - Список клиентов
- `GET /api/v1/clients/{id}` - Получить клиента
- `POST /api/v1/clients/` - Создать клиента
- `PUT /api/v1/clients/{id}` - Обновить клиента
- `DELETE /api/v1/clients/{id}` - Удалить клиента
- `POST /api/v1/clients/{id}/contacts` - Добавить контакт
- `PUT /api/v1/clients/{id}/contacts/{contact_id}` - Обновить контакт
- `DELETE /api/v1/clients/{id}/contacts/{contact_id}` - Удалить контакт

### Projects (Проекты)
- `GET /api/v1/projects/` - Список проектов
- `GET /api/v1/projects/{id}` - Получить проект
- `POST /api/v1/projects/` - Создать проект
- `PUT /api/v1/projects/{id}` - Обновить проект
- `DELETE /api/v1/projects/{id}` - Удалить проект

### Assets (Активы)
- `GET /api/v1/assets/` - Список активов
- `GET /api/v1/assets/{id}` - Получить актив
- `POST /api/v1/assets/` - Создать актив
- `PUT /api/v1/assets/{id}` - Обновить актив
- `DELETE /api/v1/assets/{id}` - Удалить актив

### Vulnerabilities (Уязвимости)
- `GET /api/v1/vulnerabilities/` - Список уязвимостей
- `GET /api/v1/vulnerabilities/{id}` - Получить уязвимость
- `POST /api/v1/vulnerabilities/` - Создать уязвимость
- `PUT /api/v1/vulnerabilities/{id}` - Обновить уязвимость
- `DELETE /api/v1/vulnerabilities/{id}` - Удалить уязвимость

### Tickets (Тикеты)
- `GET /api/v1/tickets/` - Список тикетов
- `GET /api/v1/tickets/{id}` - Получить тикет
- `POST /api/v1/tickets/` - Создать тикет
- `PUT /api/v1/tickets/{id}` - Обновить тикет
- `DELETE /api/v1/tickets/{id}` - Удалить тикет
- `POST /api/v1/tickets/{id}/messages` - Добавить сообщение
- `GET /api/v1/tickets/{id}/messages` - Получить сообщения

### Workers (Рабочие)
- `GET /api/v1/workers/` - Список рабочих
- `GET /api/v1/workers/{id}` - Получить рабочего
- `POST /api/v1/workers/` - Создать рабочего
- `PUT /api/v1/workers/{id}` - Обновить рабочего
- `DELETE /api/v1/workers/{id}` - Удалить рабочего

### Reference Data (Справочники)
- Asset Types:
  - `GET /api/v1/reference/asset-types/`
  - `POST /api/v1/reference/asset-types/`
  - `PUT /api/v1/reference/asset-types/{id}`
  - `DELETE /api/v1/reference/asset-types/{id}`
  
- Scanners:
  - `GET /api/v1/reference/scanners/`
  - `POST /api/v1/reference/scanners/`
  - `PUT /api/v1/reference/scanners/{id}`
  - `DELETE /api/v1/reference/scanners/{id}`

### Gantt Tasks (Задачи Ганта)
- `GET /api/v1/gantt/projects/{project_id}/tasks` - Задачи проекта
- `GET /api/v1/gantt/tasks/{task_id}` - Получить задачу
- `POST /api/v1/gantt/tasks` - Создать задачу
- `PUT /api/v1/gantt/tasks/{task_id}` - Обновить задачу
- `DELETE /api/v1/gantt/tasks/{task_id}` - Удалить задачу
- `DELETE /api/v1/gantt/projects/{project_id}/tasks` - Удалить все задачи проекта

## Особенности

- Валидация данных через Pydantic
- Автоматическая документация API (Swagger/ReDoc)
- Поддержка CORS для фронтенда
- Строгая типизация и проверка ограничений БД
- Валидация связей между сущностями
- Проверка дат задач Ганта в рамках проекта

## Разработка

Для разработки с hot-reload (запуск из директории `backend/`):
```bash
cd backend
uvicorn app.main:app --reload
```

Или используйте скрипт:
```bash
cd backend
python run.py
```

