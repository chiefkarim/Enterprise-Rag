from fastapi import Request
from infrastructure.vector_store_provider import VectorStoreProvider
import sqlite3

from features.google_drive.google_drive_service import GoogleDriveService


def get_db(request: Request) -> sqlite3.Connection:
    return request.app.state.db.client


def get_vectore_store(request: Request) -> VectorStoreProvider:
    return request.app.state.vector_store


def get_google_drive(request: Request) -> GoogleDriveService:
    return request.app.state.google_drive
