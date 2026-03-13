import sys
import os

# Add the parent directory to sys.path so we can import project modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from infrastructure.databases.db import DatabaseConfig

def create_documents_table():
    print("Creating documents table...")
    db_config = DatabaseConfig()
    db = db_config.client
    
    try:
        db.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                source_file_update_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.commit()
        print("Successfully created 'documents' table.")
        
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_documents_table()
