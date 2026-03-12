import argparse
import sys
import os

# Add the parent directory to sys.path so we can import project modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from infrastructure.databases.db import DatabaseConfig
from services.auth import get_password_hash

def bootstrap_user(username: str, password: str):
    print(f"Bootstrapping user: {username}")
    db_config = DatabaseConfig()
    db = db_config.client
    
    try:
        # Check if user exists
        cursor = db.execute("SELECT id FROM users WHERE name = ?", (username,))
        row = cursor.fetchone()
        
        if row:
            print(f"User '{username}' already exists.")
            return

        # Create user with hashed password
        hashed_password = get_password_hash(password)
        cursor = db.execute(
            "INSERT INTO users (name, hashed_password) VALUES (?, ?)", 
            (username, hashed_password)
        )
        db.commit()
        print(f"Successfully created user: {username}")
        
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bootstrap the first user.")
    parser.add_argument("username", help="Username for the new account")
    parser.add_argument("password", help="Password for the new account")
    
    args = parser.parse_args()
    bootstrap_user(args.username, args.password)
