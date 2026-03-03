from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from database.db import QdrantConfig
from llama_index.core import (
    Settings,
    StorageContext,
)


class VectorStoreProvider:
    def __init__(self, collection_name="company-docs") -> None:
        self.qdrant = QdrantConfig()
        self.client = self.qdrant.client

        Settings.embed_model = FastEmbedEmbedding(
            model_name="BAAI/bge-small-en-v1.5",
            local_files_only=False,
        )

        self._vector_store = QdrantVectorStore(
            client=self.client, collection_name=collection_name
        )

    def get_vector_store(self):
        return self._vector_store

    def get_storage_context(self):
        return StorageContext.from_defaults(vector_store=self.vector_store)
