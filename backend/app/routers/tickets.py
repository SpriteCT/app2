"""
API routes for tickets management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Ticket, TicketVulnerability, TicketMessage, Client, Vulnerability
from app.schemas import (
    Ticket as TicketSchema,
    TicketCreate,
    TicketUpdate,
    TicketMessage as TicketMessageSchema,
    TicketMessageCreate,
    Vulnerability as VulnerabilitySchema
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("/", response_model=List[TicketSchema])
def get_tickets(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all tickets, optionally filtered"""
    query = db.query(Ticket)
    if client_id:
        query = query.filter(Ticket.client_id == client_id)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    tickets = query.offset(skip).limit(limit).all()
    return tickets


@router.get("/{ticket_id}", response_model=TicketSchema)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get a specific ticket by ID"""
    from sqlalchemy.orm import joinedload
    ticket = db.query(Ticket).options(
        joinedload(Ticket.ticket_vulnerabilities).joinedload(TicketVulnerability.vulnerability),
        joinedload(Ticket.messages).joinedload(TicketMessage.author),
        joinedload(Ticket.assignee),
        joinedload(Ticket.reporter),
        joinedload(Ticket.client)
    ).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    # Ensure vulnerabilities are loaded
    _ = ticket.vulnerabilities  # Access property to trigger loading
    return ticket


@router.post("/", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == ticket.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    ticket_data = ticket.model_dump(exclude={"vulnerability_ids"})
    db_ticket = Ticket(**ticket_data)
    db.add(db_ticket)
    db.flush()
    
    # Add vulnerabilities
    if ticket.vulnerability_ids:
        for vuln_id in ticket.vulnerability_ids:
            # Verify vulnerability exists and belongs to same client
            vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
            if not vulnerability:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Vulnerability {vuln_id} not found"
                )
            if vulnerability.client_id != ticket.client_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="All vulnerabilities must belong to the same client as the ticket"
                )
            
            db_ticket_vuln = TicketVulnerability(
                ticket_id=db_ticket.id,
                vulnerability_id=vuln_id
            )
            db.add(db_ticket_vuln)
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


@router.put("/{ticket_id}", response_model=TicketSchema)
def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db)
):
    """Update a ticket"""
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    update_data = ticket_update.model_dump(exclude_unset=True, exclude={"vulnerability_ids"})
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    
    # Update vulnerabilities if provided
    if "vulnerability_ids" in ticket_update.model_dump(exclude_unset=True):
        # Remove existing ticket-vulnerability links
        db.query(TicketVulnerability).filter(
            TicketVulnerability.ticket_id == ticket_id
        ).delete()
        
        # Add new vulnerabilities
        if ticket_update.vulnerability_ids:
            for vuln_id in ticket_update.vulnerability_ids:
                vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
                if not vulnerability:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Vulnerability {vuln_id} not found"
                    )
                if vulnerability.client_id != db_ticket.client_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="All vulnerabilities must belong to the same client as the ticket"
                    )
                
                db_ticket_vuln = TicketVulnerability(
                    ticket_id=ticket_id,
                    vulnerability_id=vuln_id
                )
                db.add(db_ticket_vuln)
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete a ticket"""
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    db.delete(db_ticket)
    db.commit()
    return None


# Ticket Messages routes
@router.post("/{ticket_id}/messages", response_model=TicketMessageSchema, status_code=status.HTTP_201_CREATED)
def create_ticket_message(
    ticket_id: int,
    message: TicketMessageCreate,
    db: Session = Depends(get_db)
):
    """Add a message to a ticket"""
    # Verify ticket exists
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    db_message = TicketMessage(ticket_id=ticket_id, **message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


@router.get("/{ticket_id}/messages", response_model=List[TicketMessageSchema])
def get_ticket_messages(ticket_id: int, db: Session = Depends(get_db)):
    """Get all messages for a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    return ticket.messages

