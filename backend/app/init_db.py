"""
Initialize database sequences after data insertion
This ensures sequences are synced with existing records
"""
from sqlalchemy import text
from app.database import engine


def fix_sequences():
    """
    Fix all sequences to be in sync with existing records.
    This should be called after bulk inserts with explicit IDs.
    """
    sequences = [
        ('workers_id_seq', 'workers'),
        ('asset_types_id_seq', 'asset_types'),
        ('scanners_id_seq', 'scanners'),
        ('clients_id_seq', 'clients'),
        ('client_additional_contacts_id_seq', 'client_additional_contacts'),
        ('projects_id_seq', 'projects'),
        ('project_team_members_id_seq', 'project_team_members'),
        ('assets_id_seq', 'assets'),
        ('vulnerabilities_id_seq', 'vulnerabilities'),
        ('tickets_id_seq', 'tickets'),
        ('ticket_messages_id_seq', 'ticket_messages'),
        ('gantt_tasks_id_seq', 'gantt_tasks'),
    ]
    
    with engine.begin() as conn:
        for seq_name, table_name in sequences:
            try:
                # Get max ID from table
                result = conn.execute(text(f"SELECT COALESCE(MAX(id), 0) FROM {table_name}"))
                max_id = result.scalar()
                
                # Set sequence to max_id, with is_called=true so nextval returns max_id+1
                if max_id > 0:
                    # Use true (is_called) so nextval returns max_id+1
                    conn.execute(text(f"SELECT setval('{seq_name}', {max_id}, true)"))
                else:
                    # If table is empty, ensure sequence is ready for first insert
                    conn.execute(text(f"SELECT setval('{seq_name}', 1, false)"))
            except Exception as e:
                # If sequence doesn't exist, continue
                print(f"Warning: Could not fix sequence {seq_name}: {e}")
                continue


def ensure_sequences_fixed():
    """
    Ensure sequences are fixed. Called on application startup.
    """
    try:
        fix_sequences()
        print("Database sequences synchronized")
    except Exception as e:
        print(f"Warning: Could not synchronize sequences: {e}")

