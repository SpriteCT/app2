"""
Utility functions for generating display IDs
"""
from sqlalchemy.orm import Session
from app.models import Ticket, Asset, Vulnerability, Client


def generate_display_id(prefix: str, db: Session, model_class, client: Client = None) -> str:
    """
    Generate a unique display ID in format PREFIX-NUMBER
    Examples: T-TSV-123, V-FNH-456, T-KZL-789
    
    Args:
        prefix: Prefix based on client short name (e.g., 'T-TSV' for ticket)
        db: Database session
        model_class: The model class (Ticket, Asset, Vulnerability)
        client: Client object (optional, for prefix generation)
    
    Returns:
        Unique display ID string
    """
    # Get the latest entry with this prefix to find the next number
    # First try to find by display_id
    existing_by_display = db.query(model_class).filter(
        model_class.display_id.like(f"{prefix}-%")
    ).order_by(model_class.display_id.desc()).first()
    
    if existing_by_display and existing_by_display.display_id:
        # Extract number from existing display_id (e.g., "T-TSV-123" -> 123)
        try:
            last_num = int(existing_by_display.display_id.split('-')[-1])
            next_num = last_num + 1
        except (ValueError, IndexError):
            # If parsing fails, check by id count
            count = db.query(model_class).filter(
                model_class.display_id.like(f"{prefix}-%")
            ).count()
            next_num = count + 1
    else:
        # If no display_id found, check if there are any records for this client
        # and use count + 1
        if hasattr(model_class, 'client_id') and client:
            count = db.query(model_class).filter(
                model_class.client_id == client.id
            ).count()
            next_num = count + 1
        else:
            next_num = 1
    
    return f"{prefix}-{next_num}"


def get_ticket_display_id(client: Client, db: Session) -> str:
    """Generate display ID for ticket: T-{SHORT_NAME}-{NUMBER}"""
    prefix = f"T-{client.short_name}"
    return generate_display_id(prefix, db, Ticket)




def get_vulnerability_display_id(client: Client, db: Session) -> str:
    """Generate display ID for vulnerability: V-{SHORT_NAME}-{NUMBER}"""
    prefix = f"V-{client.short_name}"
    return generate_display_id(prefix, db, Vulnerability)

