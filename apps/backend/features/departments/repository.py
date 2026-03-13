import sqlite3
from features.departments.models import DepartmentModel

def get_departments(db: sqlite3.Connection) -> list[DepartmentModel]:
    cursor = db.cursor()
    cursor.execute("SELECT id, name, created_at, updated_at FROM departments")
    rows = cursor.fetchall()
    return [DepartmentModel(id=row[0], name=row[1], created_at=row[2], updated_at=row[3]) for row in rows]

def get_department_by_id(db: sqlite3.Connection, id: int) -> DepartmentModel | None:
    cursor = db.cursor()
    cursor.execute("SELECT id, name, created_at, updated_at FROM departments WHERE id = ?", (id,))
    row = cursor.fetchone()
    if row:
        return DepartmentModel(id=row[0], name=row[1], created_at=row[2], updated_at=row[3])
    return None

def create_department(db: sqlite3.Connection, name: str) -> DepartmentModel | None:
    cursor = db.cursor()
    cursor.execute("INSERT INTO departments (name) VALUES (?) RETURNING id, name, created_at, updated_at", (name,))
    db.commit()
    row = cursor.fetchone()
    if row:
        return DepartmentModel(id=row[0], name=row[1], created_at=row[2], updated_at=row[3])
    return None

def update_department(db: sqlite3.Connection, id: int, name: str) -> DepartmentModel | None:
    cursor = db.cursor()
    cursor.execute("UPDATE departments SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING id, name, created_at, updated_at", (name, id))
    db.commit()
    row = cursor.fetchone()
    if row:
        return DepartmentModel(id=row[0], name=row[1], created_at=row[2], updated_at=row[3])
    return None

def delete_department(db: sqlite3.Connection, id: int) -> bool:
    cursor = db.cursor()
    cursor.execute("DELETE FROM departments WHERE id = ?", (id,))
    db.commit()
    return cursor.rowcount > 0
