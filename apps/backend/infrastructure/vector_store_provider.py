from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from .databases.vector_db import QdrantConfig
from llama_index.core import (
    Settings as LlamaSettings,
    StorageContext,
)
from infrastructure.config import get_settings

settings = get_settings()


class VectorStoreProvider:
    def __init__(self, collection_name=None) -> None:
        if collection_name is None:
            collection_name = settings.COLLECTION_NAME
        self.qdrant = QdrantConfig()
        self.client = self.qdrant.client
        self.aclient = self.qdrant.aclient

        LlamaSettings.embed_model = FastEmbedEmbedding(
            model_name=settings.MODEL_NAME,
            local_files_only=False,
        )

        self._vector_store = QdrantVectorStore(
            client=self.client, aclient=self.aclient, collection_name=collection_name
        )

    def get_vector_store(self):
        return self._vector_store

    def get_storage_context(self):
        return StorageContext.from_defaults(vector_store=self._vector_store)
