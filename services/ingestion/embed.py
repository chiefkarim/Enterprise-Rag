import os
import tempfile

from llama_index.core import Settings
from infrastructure.vector_store_provider import VectorStoreProvider
from models.department import Department
from .reader import file_metadata
from llama_index.readers.docling import DoclingReader
from llama_index.node_parser.docling import DoclingNodeParser

from services.google_drive.google_drive_service import GoogleDriveService

TEMP_PATH = os.path.join(tempfile.gettempdir(), "/tmp")


def embed(
    file_id: str,
    project_id: str | None,
    google_drive_service: GoogleDriveService,
    vector_store: VectorStoreProvider,
    department: Department = Department.GENERAL,
):
    FILE_PATH = google_drive_service.download_file(TEMP_PATH, file_id)

    reader = DoclingReader(export_type=DoclingReader.ExportType.JSON)
    node_parser = DoclingNodeParser()

    documents = reader.load_data(FILE_PATH)
    for doc in documents:
        doc.metadata.update(file_metadata(FILE_PATH, department, project_id))

    nodes = node_parser.get_nodes_from_documents(documents, True)

    store = vector_store.get_vector_store()

    embed_model = Settings.embed_model

    texts = [node.get_content() for node in nodes]
    embeddings = embed_model.get_text_embedding_batch(texts, show_progress=True)

    for node, embedding in zip(nodes, embeddings):
        node.embedding = embedding

    store.add(nodes)

    return {"success"}
