from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
from infrastructure.vector_store_provider import VectorStoreProvider
from .reader import file_metadata

reader = SimpleDirectoryReader(
    input_dir="./test_data/", file_metadata=file_metadata, recursive=True
)
documents = reader.load_data()

sentence_parser = SentenceSplitter(
    chunk_size=3072,
    chunk_overlap=300,
)
nodes = sentence_parser.get_nodes_from_documents(documents)

provider = VectorStoreProvider(collection_name="company")
index = VectorStoreIndex(
    nodes,
    storage_context=provider.get_storage_context(),
    show_progress=True,
)
