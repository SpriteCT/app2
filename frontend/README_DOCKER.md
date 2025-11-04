# Frontend - Docker Setup

Этот проект использует Docker Compose для запуска всего стека приложения (фронтенд, бэкенд и база данных).

## Быстрый старт

1. Убедитесь, что у вас установлены Docker и Docker Compose
2. В корне проекта скопируйте `.env.example` в `.env` и настройте переменные окружения
3. Запустите все сервисы:

```bash
docker-compose up -d
```

4. Приложение будет доступно по адресам:
   - **Фронтенд**: http://localhost:5173
   - **Бэкенд API**: http://localhost:8000
   - **База данных**: localhost:5432

## Структура сервисов

- **frontend**: React приложение на Vite, сервируется через nginx
- **backend**: FastAPI приложение
- **db**: PostgreSQL база данных

## Переменные окружения

Вы можете настроить переменные окружения, создав файл `.env` в корне проекта:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=vulnerability_db
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

## Остановка и очистка

Остановить все сервисы:
```bash
docker-compose down
```

Остановить и удалить все данные (включая БД):
```bash
docker-compose down -v
```

## Просмотр логов

Все сервисы:
```bash
docker-compose logs -f
```

Конкретный сервис:
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

## Пересборка после изменений

После изменения кода нужно пересобрать образы:

```bash
docker-compose build
docker-compose up -d
```

Или для конкретного сервиса:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Разработка

Для разработки с hot-reload рекомендуется запускать фронтенд и бэкенд локально:

### Фронтенд (локально):
```bash
npm run dev
```

### Бэкенд (локально):
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### БД (через Docker):
```bash
docker-compose up -d db
```

