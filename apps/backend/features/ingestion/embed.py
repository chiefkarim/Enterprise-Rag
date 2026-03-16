import json
import sqlite3
import tempfile
from typing import Any

from infrastructure.vector_store_provider import VectorStoreProvider
from features.ingestion.reader import file_metadata
from features.documents import service as document_service
from llama_index.readers.docling import DoclingReader
from llama_index.node_parser.docling import DoclingNodeParser
from llama_index.core import VectorStoreIndex
from features.google_drive.google_drive_service import GoogleDriveService
from infrastructure.logging_config import logger


def embed(
    file_ids: list[str],
    project_id: str | None,
    google_drive_service: GoogleDriveService,
    vector_store: VectorStoreProvider,
    db: sqlite3.Connection,
    department: str = "general",
    batch_size: int = 5,
):
    """
    Register documents and enqueue the embedding task.
    Returns immediately to the user.
    """
    file_ids = [fid.strip() for fid in file_ids]
    file_names = []
    for file_id in file_ids:
        try:
            name = google_drive_service.get_file_name(file_id)
            file_names.append(name)
        except Exception as e:
            logger.error(f"Failed to fetch metadata for file_id {file_id}: {e}")
            file_names.append(f"unknown_{file_id}")

    db_docs = document_service.register_documents(db, file_names)
    file_id_to_doc_id = {file_id: doc.id for file_id, doc in zip(file_ids, db_docs)}

    # Local import to avoid circular dependency
    from features.ingestion.tasks import enqueue_embedding_task
    
    enqueue_embedding_task(
        file_ids=file_ids,
        file_id_to_doc_id=file_id_to_doc_id,
        project_id=project_id,
        department=department,
        batch_size=batch_size
    )

    return {
        "status": "queued",
        "message": f"Embedding process started for {len(file_ids)} files.",
        "document_ids": [doc.id for doc in db_docs]
    }


def run_embedding(
    file_ids: list[str],
    file_id_to_doc_id: dict[str, int],
    project_id: str | None,
    google_drive_service: GoogleDriveService,
    vector_store: VectorStoreProvider,
    db: sqlite3.Connection,
    department: str = "general",
    batch_size: int = 5,
):
    """
    Background worker logic to process files.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        reader = DoclingReader(export_type=DoclingReader.ExportType.JSON)
        node_parser = DoclingNodeParser()
        
        store = vector_store.get_vector_store()
        index = VectorStoreIndex.from_vector_store(vector_store=store)

        total_nodes = 0

        for i in range(0, len(file_ids), batch_size):
            batch_ids = file_ids[i : i + batch_size]
            batch_nodes = []
            succeeded, failed = [], []

            for f_id in batch_ids:
                doc_id = file_id_to_doc_id[f_id]
                nodes = _process_file(
                    f_id, temp_dir, department, project_id, 
                    google_drive_service, reader, node_parser
                )
                if nodes:
                    batch_nodes.extend(nodes)
                    succeeded.append(doc_id)
                else:
                    failed.append(doc_id)

            if batch_nodes:
                index.insert_nodes(batch_nodes)
                total_nodes += len(batch_nodes)

            _update_batch_statuses(db, succeeded, failed)

        return {"status": "success", "nodes_inserted": total_nodes}


def _process_file(
    file_id: str,
    temp_dir: str,
    department: str,
    project_id: str | None,
    google_drive_service: GoogleDriveService,
    reader: DoclingReader,
    node_parser: DoclingNodeParser,
) -> list[Any]:
    """Helper to download and parse a single file."""
    try:
        path, name = google_drive_service.download_file(temp_dir, file_id)
        
        # Optional: Save sidecar metadata
        if project_id or department:
            meta = {"department": department, "project_id": project_id}
            with open(f"{path}.metadata.json", "w") as f:
                json.dump(meta, f, indent=2)

        documents = reader.load_data(path)
        for doc in documents:
            doc.metadata.update(file_metadata(path, department, project_id, name))

        return node_parser.get_nodes_from_documents(documents, True)
    except Exception as e:
        logger.error(f"Failed processing {file_id}: {e}")
        return []


def _update_batch_statuses(db: sqlite3.Connection, succeeded: list[int], failed: list[int]):
    """Helper for bulk status updates."""
    if succeeded:
        document_service.mark_documents_embedded(db, succeeded)
    if failed:
        document_service.mark_documents_failed(db, failed)

