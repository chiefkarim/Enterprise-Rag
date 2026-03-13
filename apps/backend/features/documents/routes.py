from fastapi import APIRouter, Depends, HTTPException, status
import sqlite3
from deps import get_db
from features.documents.models import DocumentModel
from features.documents.dto import CreateDocument, UpdateDocument
from features.documents import repository as documents_repo
from features.auth.service import require_admin

router = APIRouter(prefix="/documents", dependencies=[Depends(require_admin)])

@router.get("/", response_model=list[DocumentModel])
async def get_documents(db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to get all documents."""
    return documents_repo.get_documents(db)

@router.get("/{id}", response_model=DocumentModel)
async def get_document(id: int, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to get a specific document."""
    document = documents_repo.get_document_by_id(db, id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document

@router.post("/", response_model=DocumentModel, status_code=status.HTTP_201_CREATED)
async def create_document(payload: CreateDocument, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to create a new document."""
    document = documents_repo.create_document(db, payload.file_name, payload.source_file_update_at)
    if not document:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create document")
    return document

@router.put("/{id}", response_model=DocumentModel)
async def update_document(id: int, payload: UpdateDocument, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to update an existing document."""
    document = documents_repo.get_document_by_id(db, id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    updated = documents_repo.update_document(db, id, payload.file_name, payload.source_file_update_at)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update document")
    return updated

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(id: int, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to delete a document."""
    document = documents_repo.get_document_by_id(db, id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    success = documents_repo.delete_document(db, id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete document")
    return None
