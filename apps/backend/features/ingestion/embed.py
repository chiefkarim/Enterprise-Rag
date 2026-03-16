import json
import sqlite3
import tempfile

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
    Register documents and enqueue the embedding task to Redis.
    Returns immediately to the user.
    """
    # --- Step 1: Fetch names and register documents with correct names ---
    file_names = []
    for file_id in file_ids:
        try:
            name = google_drive_service.get_file_name(file_id)
            file_names.append(name)
        except Exception as e:
            logger.error(f"Failed to fetch metadata for file_id {file_id}: {e}")
            file_names.append(f"unknown_{file_id}")

    db_docs = document_service.register_documents(db, file_names)

    # Build a mapping from file_id to DB document id
    file_id_to_doc_id: dict[str, int] = {
        file_id: doc.id for file_id, doc in zip(file_ids, db_docs)
    }

    # Enqueue the task
    from features.ingestion.tasks import q, process_embed_task
    
    q.enqueue(
        process_embed_task,
        file_ids=file_ids,
        file_id_to_doc_id=file_id_to_doc_id,
        project_id=project_id,
        department_value=department,
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
    Actual logic to download, parse, and embed files.
    This is called by the background worker.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        reader = DoclingReader(export_type=DoclingReader.ExportType.JSON)
        node_parser = DoclingNodeParser()

        total_nodes = 0
        store = vector_store.get_vector_store()
        index = VectorStoreIndex.from_vector_store(vector_store=store)

        # --- Step 2: Process files in batches ---
        for batch_start in range(0, len(file_ids), batch_size):
            batch_ids = file_ids[batch_start : batch_start + batch_size]

            batch_nodes = []
            batch_succeeded: list[int] = []
            batch_failed: list[int] = []

            for file_id in batch_ids:
                doc_id = file_id_to_doc_id[file_id]
                try:
                    FILE_PATH, file_name = google_drive_service.download_file(
                        temp_dir, file_id
                    )

                    # --- Save metadata file if project_id or department is provided ---
                    if project_id or department:
                        meta_data = {
                            "department": department,
                            "project_id": project_id
                        }
                        meta_file_path = f"{FILE_PATH}.metadata.json"
                        with open(meta_file_path, "w") as f:
                            json.dump(meta_data, f, indent=2)
                        logger.info(f"Saved metadata to {meta_file_path}")

                    documents = reader.load_data(FILE_PATH)

                    for doc in documents:
                        doc.metadata.update(
                            file_metadata(FILE_PATH, department, project_id, file_name)
                        )

                    nodes = node_parser.get_nodes_from_documents(documents, True)
                    batch_nodes.extend(nodes)
                    batch_succeeded.append(doc_id)
                except Exception as e:
                    logger.error(f"Failed to process file_id {file_id}: {e}")
                    batch_failed.append(doc_id)

            # --- Step 3: Embed the batch and update states ---
            if batch_nodes:
                index.insert_nodes(batch_nodes)
                total_nodes += len(batch_nodes)

            if batch_succeeded:
                document_service.mark_documents_embedded(db, batch_succeeded)
            if batch_failed:
                document_service.mark_documents_failed(db, batch_failed)

        return {"status": "success", "nodes_inserted": total_nodes}

