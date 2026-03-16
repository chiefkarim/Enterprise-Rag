from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from features.query.models import QueryRequest
from deps import get_vector_store
from infrastructure.vector_store_provider import VectorStoreProvider
from llama_index.core import VectorStoreIndex, Settings
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.llms.ollama import Ollama
import json
import asyncio

router = APIRouter()

# Setup similar to rag.py
reranking_post_processor = SentenceTransformerRerank(
    model="ibm-granite/granite-embedding-reranker-english-r2",
    top_n=3,
)

Settings.llm = Ollama(
    model="qwen3:0.6b", request_timeout=3000, base_url="http://127.0.0.1:11434", thinking=False
)

@router.post("/chat")
async def chat(
    payload: QueryRequest,
    vector_store: VectorStoreProvider = Depends(get_vector_store),
):
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store.get_vector_store())
    
    query_engine = index.as_query_engine(
        similarity_top_k=3,
        node_postprocessors=[reranking_post_processor],
        streaming=True,
    )

    async def event_generator():
        llm_response = query_engine.query(payload.query)
        for token in llm_response.response_gen:
            # Yield as SSE data
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
