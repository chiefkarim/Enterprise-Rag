from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex

from reader import file_metadata

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
index = VectorStoreIndex(
    nodes,
    show_progress=True,
)

index.storage_context.persist(persist_dir="./indexed-data")
