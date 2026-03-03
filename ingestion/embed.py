from llama_index.core import SimpleDirectoryReader, StorageContext
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from database.db import QdrantConfig
from .reader import file_metadata
from llama_index.vector_stores.qdrant import QdrantVectorStore

qdrant = QdrantConfig()
qdrant_client = qdrant.client

reader = SimpleDirectoryReader(
    input_dir="./test_data/", file_metadata=file_metadata, recursive=True
)
documents = reader.load_data()

sentence_parser = SentenceSplitter(
    chunk_size=3072,
    chunk_overlap=300,
)
nodes = sentence_parser.get_nodes_from_documents(documents)


Settings.embed_model = FastEmbedEmbedding(
    model_name="BAAI/bge-small-en-v1.5",
    local_files_only=False,
)
COLLECTION_NAME = "company-docs"
vector_store = QdrantVectorStore(client=qdrant_client, collection_name=COLLECTION_NAME)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex(
    nodes,
    storage_context=storage_context,
    show_progress=True,
)
