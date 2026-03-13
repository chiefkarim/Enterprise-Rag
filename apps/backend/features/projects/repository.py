import sqlite3
from features.projects.models import Project


def create_project(db: sqlite3.Connection, name: str) -> Project:
    cursor = db.execute("INSERT INTO projects (name) VALUES (?)", (name,))
    db.commit()

    project_id = cursor.lastrowid

    cursor = db.execute(
        "SELECT id, name, created_at FROM projects WHERE id = ?", (project_id,)
    )
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()

    return Project.model_validate(dict(zip(columns, row)))


def get_projects(db: sqlite3.Connection) -> list[Project]:
    cursor = db.execute("SELECT * FROM projects;")
    columns = [col[0] for col in cursor.description]
    rows = cursor.fetchall()

    return [Project.model_validate(dict(zip(columns, row))) for row in rows]
