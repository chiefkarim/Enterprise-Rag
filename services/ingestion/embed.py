import time

from llama_index.core import SimpleDirectoryReader, Settings
from llama_index.core.node_parser import SentenceSplitter
from infrastructure.vector_store_provider import VectorStoreProvider
from .reader import file_metadata


def stage_timer(stage_name, start):
    elapsed = time.perf_counter() - start
    print(f"[TIMER] {stage_name}: {elapsed:.2f}s")


pipeline_start = time.perf_counter()

# --- Read documents ---
start = time.perf_counter()
reader = SimpleDirectoryReader(
    input_dir="./test_data/departments/hr",
    file_metadata=file_metadata,
    recursive=True,
)
documents = reader.load_data()
stage_timer("Document loading", start)

# --- Parse to nodes ---
start = time.perf_counter()
sentence_parser = SentenceSplitter(
    chunk_size=3072,
    chunk_overlap=300,
)
nodes = sentence_parser.get_nodes_from_documents(documents)
stage_timer("Sentence splitting / node creation", start)

# --- Initialize vector store ---
start = time.perf_counter()
provider = VectorStoreProvider()
vector_store = provider.get_vector_store()
stage_timer("Vector store initialization", start)

# --- Generate embeddings only ---
start = time.perf_counter()
embed_model = Settings.embed_model

texts = [node.get_content(metadata_mode="all") for node in nodes]
embeddings = embed_model.get_text_embedding_batch(texts, show_progress=True)

for node, embedding in zip(nodes, embeddings):
    node.embedding = embedding

stage_timer("Embedding generation only", start)

# --- Upload to Qdrant only ---
start = time.perf_counter()
vector_store.add(nodes)
stage_timer("Qdrant upload only", start)

stage_timer("Total pipeline", pipeline_start)
