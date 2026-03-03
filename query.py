from llama_index.core import (
    VectorStoreIndex,
)
from infrastructure.vector_store_provider import VectorStoreProvider
from utils import dump_json

provider = VectorStoreProvider()

index = VectorStoreIndex.from_vector_store(vector_store=provider.get_vector_store())


query = "Where can i find the specs for the http protocol?"
retriever = index.as_retriever()
retrieved_nodes = retriever.retrieve(query)
dump_json("result.json", retrieved_nodes)
