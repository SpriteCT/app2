"""
API routes for clients management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import Client, ClientAdditionalContact
from app.schemas import (
    Client as ClientSchema,
    ClientCreate,
    ClientUpdate,
    ClientAdditionalContact as ContactSchema,
    ClientAdditionalContactCreate,
    ClientAdditionalContactUpdate
)

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("/", response_model=List[ClientSchema])
def get_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all clients"""
    clients = db.query(Client).offset(skip).limit(limit).all()
    return clients


@router.get("/{client_id}", response_model=ClientSchema)
def get_client(client_id: UUID, db: Session = Depends(get_db)):
    """Get a specific client by ID"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client


@router.post("/", response_model=ClientSchema, status_code=status.HTTP_201_CREATED)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    db_client = Client(**client.model_dump(exclude={"additional_contacts"}))
    db.add(db_client)
    db.flush()  # Get the ID
    
    # Add additional contacts
    if client.additional_contacts:
        for contact in client.additional_contacts:
            db_contact = ClientAdditionalContact(
                client_id=db_client.id,
                **contact.model_dump()
            )
            db.add(db_contact)
    
    db.commit()
    db.refresh(db_client)
    return db_client


@router.put("/{client_id}", response_model=ClientSchema)
def update_client(
    client_id: UUID,
    client_update: ClientUpdate,
    db: Session = Depends(get_db)
):
    """Update a client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)
    
    db.commit()
    db.refresh(db_client)
    return db_client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: UUID, db: Session = Depends(get_db)):
    """Delete a client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    db.delete(db_client)
    db.commit()
    return None


# Additional Contacts routes
@router.post("/{client_id}/contacts", response_model=ContactSchema, status_code=status.HTTP_201_CREATED)
def create_client_contact(
    client_id: UUID,
    contact: ClientAdditionalContactCreate,
    db: Session = Depends(get_db)
):
    """Add an additional contact to a client"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    db_contact = ClientAdditionalContact(client_id=client_id, **contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.put("/{client_id}/contacts/{contact_id}", response_model=ContactSchema)
def update_client_contact(
    client_id: UUID,
    contact_id: UUID,
    contact_update: ClientAdditionalContactUpdate,
    db: Session = Depends(get_db)
):
    """Update an additional contact"""
    db_contact = db.query(ClientAdditionalContact).filter(
        ClientAdditionalContact.id == contact_id,
        ClientAdditionalContact.client_id == client_id
    ).first()
    if not db_contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    update_data = contact_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contact, field, value)
    
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.delete("/{client_id}/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client_contact(
    client_id: UUID,
    contact_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete an additional contact"""
    db_contact = db.query(ClientAdditionalContact).filter(
        ClientAdditionalContact.id == contact_id,
        ClientAdditionalContact.client_id == client_id
    ).first()
    if not db_contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    db.delete(db_contact)
    db.commit()
    return None

