"""
API routes for tickets management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models import Ticket, TicketVulnerability, TicketMessage, Client, Vulnerability
from app.utils import get_ticket_display_id
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
    from sqlalchemy.orm import joinedload
    from sqlalchemy import or_
    # Filter out deleted tickets - check both False and NULL
    query = db.query(Ticket).filter(or_(Ticket.is_deleted == False, Ticket.is_deleted.is_(None))).options(
        joinedload(Ticket.ticket_vulnerabilities).joinedload(TicketVulnerability.vulnerability),
        joinedload(Ticket.messages).joinedload(TicketMessage.author),
        joinedload(Ticket.assignee),
        joinedload(Ticket.reporter),
        joinedload(Ticket.client)
    )
    if client_id:
        query = query.filter(Ticket.client_id == client_id)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    tickets = query.offset(skip).limit(limit).all()
    print(f"Found {len(tickets)} tickets in database")
    # Ensure vulnerabilities are loaded for each ticket
    for ticket in tickets:
        # Force loading of relationships
        _ = ticket.ticket_vulnerabilities
        _ = ticket.messages
        _ = ticket.vulnerabilities  # Access property to trigger loading
        print(f"Ticket {ticket.id} ({ticket.display_id}): is_deleted={ticket.is_deleted}, client_id={ticket.client_id}")
    return tickets


@router.get("/{ticket_id}", response_model=TicketSchema)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get a specific ticket by ID"""
    from sqlalchemy.orm import joinedload
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.is_deleted == False).options(
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
    # Remove id if present
    ticket_data.pop('id', None)
    # Generate display_id
    ticket_data['display_id'] = get_ticket_display_id(client, db)
    db_ticket = Ticket(**ticket_data)
    db.add(db_ticket)
    
    try:
        db.flush()
    except Exception as e:
        # If we get an ID conflict, fix the sequence and retry once
        if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
            from sqlalchemy import text
            # Fix the sequence
            db.execute(text("SELECT setval('tickets_id_seq', (SELECT MAX(id) FROM tickets), true)"))
            db.commit()
            # Retry the insert
            db_ticket = Ticket(**ticket_data)
            db.add(db_ticket)
            db.flush()
        else:
            raise
    
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
    from app.models import UserAccount
    
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    update_data = ticket_update.model_dump(exclude_unset=True, exclude={"vulnerability_ids"})
    
    # Validate due_date if provided
    if "due_date" in update_data and update_data["due_date"] is not None:
        if update_data["due_date"] < db_ticket.created_at.date():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Due date cannot be earlier than creation date"
            )
    
    # Store old values for change tracking
    old_values = {
        'status': db_ticket.status,
        'priority': db_ticket.priority,
        'assignee_id': db_ticket.assignee_id,
        'due_date': db_ticket.due_date,
        'title': db_ticket.title,
        'resolution': db_ticket.resolution
    }
    
    status_changed = False
    changes = []
    
    # Apply updates and track changes
    for field, value in update_data.items():
        old_value = old_values.get(field)
        
        # Check if value actually changed
        if old_value != value:
            if field == 'status':
                status_changed = True
                changes.append(('status', old_value, value))
            elif field == 'priority':
                changes.append(('priority', old_value, value))
            elif field == 'assignee_id':
                # Get assignee names
                old_assignee = None
                new_assignee = None
                if old_value:
                    old_assignee_obj = db.query(UserAccount).filter(UserAccount.id == old_value).first()
                    old_assignee = old_assignee_obj.full_name if old_assignee_obj else None
                if value:
                    new_assignee_obj = db.query(UserAccount).filter(UserAccount.id == value).first()
                    new_assignee = new_assignee_obj.full_name if new_assignee_obj else None
                changes.append(('assignee_id', old_assignee or 'не назначен', new_assignee or 'не назначен'))
            elif field == 'due_date':
                old_due_str = old_value.strftime('%d.%m.%Y') if old_value else 'не установлен'
                new_due_str = value.strftime('%d.%m.%Y') if value else 'не установлен'
                changes.append(('due_date', old_due_str, new_due_str))
            elif field == 'title':
                changes.append(('title', old_value, value))
            elif field == 'resolution':
                if old_value and not value:
                    changes.append(('resolution', 'удалено', None))
                elif not old_value and value:
                    changes.append(('resolution', None, 'добавлено'))
                else:
                    changes.append(('resolution', old_value, value))
        
        setattr(db_ticket, field, value)
    
    # If status changed, update related vulnerabilities
    if status_changed and db_ticket.status:
        # Get all vulnerabilities linked to this ticket
        ticket_vulns = db.query(TicketVulnerability).filter(
            TicketVulnerability.ticket_id == ticket_id
        ).all()
        
        for ticket_vuln in ticket_vulns:
            vulnerability = db.query(Vulnerability).filter(
                Vulnerability.id == ticket_vuln.vulnerability_id
            ).first()
            if vulnerability:
                vulnerability.status = db_ticket.status
                vulnerability.updated_at = datetime.now(timezone.utc)
    
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
        
        # Update ticket's updated_at when vulnerabilities are changed
        db_ticket.updated_at = datetime.now(timezone.utc)
    
    # Create chat messages for changes
    if changes:
        field_names = {
            'status': 'Статус',
            'priority': 'Приоритет',
            'assignee_id': 'Ответственный',
            'due_date': 'Срок выполнения',
            'title': 'Название',
            'resolution': 'Решение'
        }
        
        for field, old_val, new_val in changes:
            field_name = field_names.get(field, field)
            message_text = f"{field_name} изменен: {old_val} → {new_val}"
            
            db_message = TicketMessage(
                ticket_id=ticket_id,
                author_id=None,  # System message
                message=message_text,
                timestamp=datetime.now(timezone.utc)
            )
            db.add(db_message)
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Soft delete a ticket"""
    from datetime import datetime, timezone
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.is_deleted == False).first()
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    db_ticket.is_deleted = True
    db_ticket.updated_at = datetime.now(timezone.utc)
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
    
    # Update ticket's updated_at when message is added
    from datetime import datetime, timezone
    ticket.updated_at = datetime.now(timezone.utc)
    
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

