from os import getenv
from qdrant_client import AsyncQdrantClient, QdrantClient


class QdrantConfig:
    def __init__(self):

        self.qdrant_api_key = getenv("QDRANT_API_KEY")
        self.qdrant_endpoint = getenv("QDRANT_URL")

        if self.qdrant_api_key is None:
            raise ValueError("QDRANT_API_KEY is None")

        if self.qdrant_endpoint is None:
            raise ValueError("QDRANT_ENDPOINT is None")

        self.aclient = AsyncQdrantClient(
            url=self.qdrant_endpoint,
            api_key=self.qdrant_api_key,
            timeout=60,
        )
        self.client = QdrantClient(
            url=self.qdrant_endpoint,
            api_key=self.qdrant_api_key,
            timeout=60,
        )
