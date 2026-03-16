import sqlite3
from redis import Redis
from rq import Queue
from infrastructure.databases.db import DatabaseConfig
from infrastructure.vector_store_provider import VectorStoreProvider
from features.google_drive.google_drive_service import GoogleDriveService
from infrastructure.logging_config import logger

from features.ingestion.embed import run_embedding

# Redis connection
redis_conn = Redis(host='localhost', port=6379, db=0)
q = Queue('embeddings', connection=redis_conn)

class WorkerServices:
    _instance = None
    
    def __init__(self):
        logger.info("Initializing worker services...")
        self.db_config = DatabaseConfig()
        self.db = self.db_config.client
        self.vector_store = VectorStoreProvider()
        self.google_drive_service = GoogleDriveService()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

def process_embed_task(
    file_ids: list[str],
    file_id_to_doc_id: dict[str, int],
    project_id: str | None,
    department_value: str,
    batch_size: int = 5,
):
    """
    Background task to process embedding.
    This runs in the worker process.
    """
    services = WorkerServices.get_instance()
    
    # Use department_value directly
    department = department_value

    run_embedding(
        file_ids=file_ids,
        file_id_to_doc_id=file_id_to_doc_id,
        project_id=project_id,
        google_drive_service=services.google_drive_service,
        vector_store=services.vector_store,
        db=services.db,
        department=department,
        batch_size=batch_size,
    )
