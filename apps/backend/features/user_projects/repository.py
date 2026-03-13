import sqlite3
from features.users.models import UserProject


def create_user_project(db: sqlite3.Connection, user_id: int, project_id: int) -> UserProject:
    cursor = db.execute(
        "INSERT INTO users_projects (user_id, project_id) VALUES (?, ?)",
        (user_id, project_id),
    )
    db.commit()

    user_project_id = cursor.lastrowid

    cursor = db.execute(
        "SELECT id, user_id, project_id FROM users_projects WHERE id = ?",
        (user_project_id,),
    )
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()

    return UserProject.model_validate(dict(zip(columns, row)))


def get_user_projects(db: sqlite3.Connection) -> list[UserProject]:
    cursor = db.execute("SELECT id, user_id, project_id FROM users_projects;")
    columns = [col[0] for col in cursor.description]
    rows = cursor.fetchall()

    return [UserProject.model_validate(dict(zip(columns, row))) for row in rows]
