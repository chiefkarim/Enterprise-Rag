from os import getenv
from dotenv import load_dotenv
from qdrant_client import QdrantClient


class QdrantConfig:
    def __init__(self):
        load_dotenv()

        self.qdrant_api_key = getenv("QDRANT_API_KEY")
        self.qdrant_endpoint = getenv("QDRANT_ENDPOINT")

        if self.qdrant_api_key is None:
            raise ValueError("QDRANT_API_KEY is None")

        if self.qdrant_endpoint is None:
            raise ValueError("QDRANT_ENDPOINT is None")

        self.client = QdrantClient(
            url=self.qdrant_endpoint, api_key=self.qdrant_api_key
        )
