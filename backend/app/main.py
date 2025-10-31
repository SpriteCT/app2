"""
FastAPI main application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    clients,
    projects,
    assets,
    vulnerabilities,
    tickets,
    workers,
    reference,
    gantt
)

# Create database tables (only if they don't exist)
# In production, use migrations or schema.sql in Docker
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vulnerability Management API",
    description="API for managing vulnerabilities, tickets, assets, clients and projects",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(clients.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(assets.router, prefix="/api/v1")
app.include_router(vulnerabilities.router, prefix="/api/v1")
app.include_router(tickets.router, prefix="/api/v1")
app.include_router(workers.router, prefix="/api/v1")
app.include_router(reference.router, prefix="/api/v1")
app.include_router(gantt.router, prefix="/api/v1")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Vulnerability Management API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

