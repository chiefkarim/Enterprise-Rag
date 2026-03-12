import sys
import os

# Add the parent directory to sys.path so we can import project modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from infrastructure.databases.db import DatabaseConfig

def migrate():
    print("Starting database migration to add 'email' and 'role' fields...")
    db_config = DatabaseConfig()
    db = db_config.client
    
    try:
        # Check existing columns to avoid errors if run multiple times
        cursor = db.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'email' not in columns:
            print("Adding 'email' column...")
            db.execute("ALTER TABLE users ADD COLUMN email TEXT")
            print("Added 'email' column.")
        else:
            print("'email' column already exists.")
            
        if 'role' not in columns:
            print("Adding 'role' column...")
            db.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
            print("Added 'role' column.")
        else:
            print("'role' column already exists.")
            
        db.commit()
        print("Migration completed successfully.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
