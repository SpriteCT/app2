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
        ('users_id_seq', 'users'),
        ('asset_types_id_seq', 'asset_types'),
        ('scanners_id_seq', 'scanners'),
        ('project_types_id_seq', 'project_types'),
        ('project_statuses_id_seq', 'project_statuses'),
        ('priority_levels_id_seq', 'priority_levels'),
        ('asset_statuses_id_seq', 'asset_statuses'),
        ('vuln_statuses_id_seq', 'vuln_statuses'),
        ('ticket_statuses_id_seq', 'ticket_statuses'),
        ('clients_id_seq', 'clients'),
        ('client_contacts_id_seq', 'client_contacts'),
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


def set_default_passwords():
    """
    Set default password for all users that don't have one.
    Default password: password123 (хранится в чистом виде без хеширования)
    """
    default_password = "password123"
    
    with engine.begin() as conn:
        try:
            # Update all users without password (храним в чистом виде)
            result = conn.execute(
                text("UPDATE users SET password_hash = :password WHERE password_hash IS NULL"),
                {"password": default_password}
            )
            updated_count = result.rowcount
            if updated_count > 0:
                print(f"Default passwords set for {updated_count} users without passwords")
            else:
                print("No users needed password update")
        except Exception as e:
            print(f"Warning: Could not set default passwords: {e}")
            import traceback
            traceback.print_exc()


def ensure_sequences_fixed():
    """
    Ensure sequences are fixed. Called on application startup.
    """
    try:
        fix_sequences()
        set_default_passwords()
        print("Database sequences synchronized")
    except Exception as e:
        print(f"Warning: Could not synchronize sequences: {e}")

