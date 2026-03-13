import sqlite3
from typing import Optional
from datetime import datetime
from features.documents.models import DocumentModel

def get_documents(db: sqlite3.Connection) -> list[DocumentModel]:
    cursor = db.cursor()
    cursor.execute("SELECT id, file_name, source_file_update_at, created_at, updated_at FROM documents")
    rows = cursor.fetchall()
    return [DocumentModel(id=row[0], file_name=row[1], source_file_update_at=row[2], created_at=row[3], updated_at=row[4]) for row in rows]

def get_document_by_id(db: sqlite3.Connection, id: int) -> Optional[DocumentModel]:
    cursor = db.cursor()
    cursor.execute("SELECT id, file_name, source_file_update_at, created_at, updated_at FROM documents WHERE id = ?", (id,))
    row = cursor.fetchone()
    if row:
        return DocumentModel(id=row[0], file_name=row[1], source_file_update_at=row[2], created_at=row[3], updated_at=row[4])
    return None

def create_document(db: sqlite3.Connection, file_name: str, source_file_update_at: Optional[datetime] = None) -> Optional[DocumentModel]:
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO documents (file_name, source_file_update_at) VALUES (?, ?) RETURNING id, file_name, source_file_update_at, created_at, updated_at",
        (file_name, source_file_update_at)
    )
    db.commit()
    row = cursor.fetchone()
    if row:
        return DocumentModel(id=row[0], file_name=row[1], source_file_update_at=row[2], created_at=row[3], updated_at=row[4])
    return None

def update_document(db: sqlite3.Connection, id: int, file_name: str, source_file_update_at: Optional[datetime] = None) -> Optional[DocumentModel]:
    cursor = db.cursor()
    cursor.execute(
        "UPDATE documents SET file_name = ?, source_file_update_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING id, file_name, source_file_update_at, created_at, updated_at",
        (file_name, source_file_update_at, id)
    )
    db.commit()
    row = cursor.fetchone()
    if row:
        return DocumentModel(id=row[0], file_name=row[1], source_file_update_at=row[2], created_at=row[3], updated_at=row[4])
    return None

def delete_document(db: sqlite3.Connection, id: int) -> bool:
    cursor = db.cursor()
    cursor.execute("DELETE FROM documents WHERE id = ?", (id,))
    db.commit()
    return cursor.rowcount > 0
