from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from features.query.models import QueryRequest
from deps import get_vector_store
from infrastructure.vector_store_provider import VectorStoreProvider
from llama_index.core import VectorStoreIndex, Settings
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.llms.ollama import Ollama
from llama_index.core.base.response.schema import StreamingResponse as LlamaStreamingResponse
from starlette.concurrency import run_in_threadpool
import json
import logging
import time

router = APIRouter()
logger = logging.getLogger(__name__)

# Global instances to avoid re-initialization
_reranker = None
_index = None

def get_reranker():
    global _reranker
    if _reranker is None:
        _reranker = SentenceTransformerRerank(
            model="ibm-granite/granite-embedding-reranker-english-r2",
            top_n=3,
        )
    return _reranker

def get_query_engine(vector_store: VectorStoreProvider):
    global _index
    
    # Explicitly set Settings.llm if it's not already our Ollama instance
    # Avoiding the property access 'Settings.llm' if it's not set yet
    if getattr(Settings, "_llm", None) is None or not isinstance(Settings.llm, Ollama):
        Settings.llm = Ollama(
            model="qwen3:0.6b", 
            request_timeout=120, 
            base_url="http://127.0.0.1:11434", 
            thinking=False
        )
    
    if _index is None:
        _index = VectorStoreIndex.from_vector_store(vector_store=vector_store.get_vector_store())
    
    return _index.as_query_engine(
        similarity_top_k=3,
        node_postprocessors=[get_reranker()],
        streaming=True,
    )

@router.post("/chat")
async def chat(
    payload: QueryRequest,
    vector_store: VectorStoreProvider = Depends(get_vector_store),
):
    logger.info(f"Chat request received: {payload.query}")
    
    # Initialize engine (cached)
    query_engine = get_query_engine(vector_store)

    async def event_generator():
        try:
            # query_engine.query is synchronous and blocks. 
            # We run it in a threadpool to avoid blocking the event loop.
            llm_response = await run_in_threadpool(query_engine.query, payload.query)
            
            if isinstance(llm_response, LlamaStreamingResponse):
                for token in llm_response.response_gen:
                    yield f"data: {json.dumps({'token': token})}\n\n"
            else:
                yield f"data: {json.dumps({'token': str(llm_response)})}\n\n"
                
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Error in chat stream: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
