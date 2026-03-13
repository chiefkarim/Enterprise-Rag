from llama_index.core import (
    VectorStoreIndex,
)
from llama_index.core.postprocessor import SentenceTransformerRerank
from infrastructure.vector_store_provider import VectorStoreProvider
from utils import dump_json

provider = VectorStoreProvider()

index = VectorStoreIndex.from_vector_store(vector_store=provider.get_vector_store())

retriever = index.as_retriever(similarity_top_k=10)
query = "what is the link to the specs for the http protocol?"
nodes = retriever.retrieve(query)

reranking_post_processor = SentenceTransformerRerank(
    model="ibm-granite/granite-embedding-reranker-english-r2",
    top_n=3,
)
reranked_nodes = reranking_post_processor.postprocess_nodes(nodes, query_str=query)
dump_json("reranked.json", reranked_nodes)
