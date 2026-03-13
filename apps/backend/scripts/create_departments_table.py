import sys
import os

# Add the parent directory to sys.path so we can import project modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from infrastructure.databases.db import DatabaseConfig

def create_departments_table():
    print("Creating departments table...")
    db_config = DatabaseConfig()
    db = db_config.client
    
    try:
        db.execute("""
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.commit()
        print("Successfully created 'departments' table.")
        
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_departments_table()
