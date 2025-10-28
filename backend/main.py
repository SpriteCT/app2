"""
FastAPI backend для системы управления уязвимостями
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import clients, vulnerabilities, tickets, assets, reports

# Создаем экземпляр приложения
app = FastAPI(
    title="Vulnerability Management System API",
    description="API для системы управления уязвимостями с элементами сервисдеска",
    version="1.0.0"
)

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Адрес Vite dev сервера
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(vulnerabilities.router, prefix="/api/vulnerabilities", tags=["vulnerabilities"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Vulnerability Management System API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

