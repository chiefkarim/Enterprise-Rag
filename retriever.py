from llama_index.core import (
    StorageContext,
    Settings,
    VectorStoreIndex,
)
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.vector_stores.qdrant import QdrantVectorStore
from database.db import QdrantConfig
from utils import dump_json

qdrant = QdrantConfig()
qdrant_client = qdrant.client
Settings.embed_model = FastEmbedEmbedding(
    model_name="BAAI/bge-small-en-v1.5",
    local_files_only=False,
)

COLLECTION_NAME = "company-docs"
vector_store = QdrantVectorStore(client=qdrant_client, collection_name=COLLECTION_NAME)
storage_context = StorageContext.from_defaults(vector_store=vector_store)


index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

retriever = index.as_retriever(similarity_top_k=10)
query = "what is the link to the specs for the http protocol?"
nodes = retriever.retrieve(query)
print(f"nodes:======================={nodes}")

reranking_post_processor = SentenceTransformerRerank(
    model="ibm-granite/granite-embedding-reranker-english-r2",
    top_n=3,
)
reranked_nodes = reranking_post_processor.postprocess_nodes(nodes, query_str=query)
dump_json("reranked.json", reranked_nodes)
