# Vulnerability Management System

Система управления уязвимостями с элементами сервисдеска. Полнофункциональное приложение с фронтендом, бэкендом и базой данных.

## Структура проекта

```
app2/
├── frontend/          # React приложение (Vite)
├── backend/           # FastAPI приложение
├── db/                # SQL схемы и тестовые данные
└── docker-compose.yml # Docker Compose конфигурация
```

## Быстрый старт с Docker

### Запуск всех сервисов

1. Скопируйте `.env.example` в `.env` и настройте переменные окружения:
```bash
cp .env.example .env
```

2. Запустите все сервисы:
```bash
docker-compose up -d
```

3. Приложение будет доступно:
   - **Фронтенд**: http://localhost:5173
   - **Бэкенд API**: http://localhost:8000
   - **API документация**: http://localhost:8000/docs

### Запуск отдельных сервисов

#### Запуск только Backend и БД

```bash
docker-compose up -d db backend
```

Будет доступно:
   - **Бэкенд API**: http://localhost:8000
   - **API документация**: http://localhost:8000/docs
   - **База данных**: localhost:5432

#### Запуск только Frontend

```bash
docker-compose up -d frontend
```

**Важно**: Frontend требует запущенный Backend для работы API запросов. Если Backend не запущен, убедитесь что он доступен по адресу, указанному в `VITE_API_URL`.

#### Запуск только БД

```bash
docker-compose up -d db
```

База данных будет доступна на `localhost:5432`

## Разработка

### Вариант 1: Frontend локально, Backend и БД в Docker

1. Запустите Backend и БД:
```bash
docker-compose up -d db backend
```

2. Запустите Frontend локально:
```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:5173 (Vite dev server) и будет использовать Backend API из Docker.

### Вариант 2: Backend локально, Frontend и БД в Docker

1. Запустите БД:
```bash
docker-compose up -d db
```

2. Запустите Backend локально:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Запустите Frontend в Docker:
```bash
docker-compose up -d frontend
```

### Вариант 3: Все локально, только БД в Docker

1. Запустите только БД:
```bash
docker-compose up -d db
```

2. Запустите Backend локально:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Запустите Frontend локально:
```bash
cd frontend
npm install
npm run dev
```

### Остановка отдельных сервисов

```bash
# Остановить только Frontend
docker-compose stop frontend

# Остановить только Backend
docker-compose stop backend

# Остановить только БД
docker-compose stop db

# Остановить все
docker-compose down
```

### Решение проблем с Docker

Если возникает ошибка `KeyError: 'ContainerConfig'` при запуске:

```bash
# 1. Полная остановка и удаление контейнеров
docker-compose down

# 2. Удаление поврежденных контейнеров
docker-compose rm -f

# 3. Удаление образов проекта
docker rmi vulnerability_frontend vulnerability_backend 2>/dev/null || true

# 4. Очистка неиспользуемых образов
docker image prune -f

# 5. Пересборка и запуск
docker-compose up -d --build
```

Или используйте скрипт очистки:
```bash
chmod +x docker-cleanup.sh
./docker-cleanup.sh
docker-compose up -d --build
```

## Документация

- **Frontend**: см. `frontend/README_DOCKER.md`
- **Backend**: см. `backend/README.md` и `backend/API_ENDPOINTS.md`
- **Database**: см. `db/DB_SCHEMA.md`

## Технологии

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Infrastructure**: Docker, Docker Compose, Nginx
