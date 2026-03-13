import sqlite3
from features.users.models import User, UserInDB


def get_user_by_email(db: sqlite3.Connection, email: str) -> UserInDB | None:
    cursor = db.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    if row is None:
        return None
    columns = [col[0] for col in cursor.description]
    return UserInDB.model_validate(dict(zip(columns, row)))


def get_users(db: sqlite3.Connection) -> list[User]:
    cursor = db.execute("SELECT * FROM users;")
    rows = cursor.fetchall()
    columns = [col[0] for col in cursor.description]
    return [User.model_validate(dict(zip(columns, row))) for row in rows]


def create_user(db: sqlite3.Connection, name: str, email: str, role: str, hashed_password: str) -> list[User]:
    cursor = db.execute(
        "INSERT INTO users (name, email, role, hashed_password) VALUES (?, ?, ?, ?)",
        (name, email, role, hashed_password),
    )
    db.commit()

    user_id = cursor.lastrowid

    cursor = db.execute(
        "SELECT id, name, email, role, created_at FROM users WHERE id = ?", (user_id,)
    )
    columns = [col[0] for col in cursor.description]
    rows = cursor.fetchall()

    return [User.model_validate(dict(zip(columns, row))) for row in rows]
