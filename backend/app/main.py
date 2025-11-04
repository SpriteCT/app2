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
from app.init_db import ensure_sequences_fixed

# Create database tables (only if they don't exist)
# In production, use migrations or schema.sql in Docker
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vulnerability Management API",
    description="API for managing vulnerabilities, tickets, assets, clients and projects",
    version="1.0.0"
)

# Ensure sequences are synchronized on startup
@app.on_event("startup")
async def startup_event():
    """Fix database sequences on application startup"""
    import time
    max_retries = 10
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            ensure_sequences_fixed()
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Database not ready yet (attempt {attempt + 1}/{max_retries}), retrying in {retry_delay}s...")
                time.sleep(retry_delay)
            else:
                print(f"Warning: Could not synchronize sequences after {max_retries} attempts: {e}")
                # Don't fail startup, just log the warning

# CORS middleware for frontend
# Allow requests from frontend (both direct and through nginx proxy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins since nginx handles the proxy
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

