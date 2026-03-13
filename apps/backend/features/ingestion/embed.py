import os
import tempfile

from infrastructure.vector_store_provider import VectorStoreProvider
from features.departments.models import Department
from features.ingestion.reader import file_metadata
from llama_index.readers.docling import DoclingReader
from llama_index.node_parser.docling import DoclingNodeParser
from llama_index.core import VectorStoreIndex

from features.google_drive.google_drive_service import GoogleDriveService


def embed(
    file_ids: list[str],
    project_id: str | None,
    google_drive_service: GoogleDriveService,
    vector_store: VectorStoreProvider,
    department: Department = Department.GENERAL,
):
    with tempfile.TemporaryDirectory() as temp_dir:
        reader = DoclingReader(export_type=DoclingReader.ExportType.JSON)
        node_parser = DoclingNodeParser()
        
        all_nodes = []

        for file_id in file_ids:
            try:
                FILE_PATH = google_drive_service.download_file(temp_dir, file_id)
                documents = reader.load_data(FILE_PATH)
                file_name = os.path.basename(FILE_PATH)
                for doc in documents:
                    doc.metadata.update(file_metadata(FILE_PATH, department, project_id, file_name))

                nodes = node_parser.get_nodes_from_documents(documents, True)
                all_nodes.extend(nodes)
            except Exception as e:
                print(f"Failed to process file_id {file_id}: {e}")

        if not all_nodes:
            return {"status": "error", "message": "No files were successfully processed"}

        store = vector_store.get_vector_store()
        index = VectorStoreIndex.from_vector_store(vector_store=store)
        index.insert_nodes(all_nodes)

        return {"status": "success", "nodes_inserted": len(all_nodes)}
