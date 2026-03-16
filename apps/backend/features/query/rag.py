from llama_index.core import (
    VectorStoreIndex,
    Settings,
)
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.llms.openrouter import OpenRouter
from infrastructure.config import get_settings
from llama_index.core.base.response.schema import StreamingResponse

from infrastructure.vector_store_provider import VectorStoreProvider

provider = VectorStoreProvider()

index = VectorStoreIndex.from_vector_store(vector_store=provider.get_vector_store())

reranking_post_processor = SentenceTransformerRerank(
    model="ibm-granite/granite-embedding-reranker-english-r2",
    top_n=3,
)

settings = get_settings()
Settings.llm = OpenRouter(
    model="google/gemini-2.0-flash-001",
    api_key=settings.OPENROUTER_API_KEY
)

query_engine = index.as_query_engine(
    similarity_top_k=3,
    node_postprocessors=[reranking_post_processor],
    streaming=True,
)

query = "what is the link to the specs for the http protocol?"
llm_response = query_engine.query(query)

if type(llm_response) == StreamingResponse:
    for token in llm_response.response_gen:
        print(token, end="")
