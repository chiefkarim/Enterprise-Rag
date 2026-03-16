from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from features.query.models import QueryRequest
from deps import get_vector_store
from infrastructure.vector_store_provider import VectorStoreProvider
from llama_index.core import VectorStoreIndex, Settings
from llama_index.core.chat_engine.types import ChatMode
from llama_index.core.postprocessor import SentenceTransformerRerank
from llama_index.llms.openrouter import OpenRouter
from infrastructure.config import get_settings
from llama_index.core.base.response.schema import (
    StreamingResponse as LlamaStreamingResponse,
    AsyncStreamingResponse as LlamaAsyncStreamingResponse,
)
from llama_index.core.llms import ChatMessage as LlamaChatMessage
import json
import logging

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


def get_chat_engine(vector_store: VectorStoreProvider):
    global _index

    settings = get_settings()

    # Explicitly set Settings.llm if it's not already our OpenRouter instance
    if getattr(Settings, "_llm", None) is None or not isinstance(
        Settings.llm, OpenRouter
    ):
        Settings.llm = OpenRouter(
            model="arcee-ai/trinity-large-preview:free",
            api_key=settings.OPENROUTER_API_KEY,
        )

    if _index is None:
        _index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store.get_vector_store()
        )

    return _index.as_chat_engine(
        chat_mode=ChatMode.CONDENSE_PLUS_CONTEXT,
        similarity_top_k=20,
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
    chat_engine = get_chat_engine(vector_store)

    # Convert history to LlamaIndex ChatMessage format
    chat_history = []
    if payload.history:
        chat_history = [
            LlamaChatMessage(role=msg.role, content=msg.content)
            for msg in payload.history
        ]

    async def event_generator():
        try:
            # Use the asynchronous achat to avoid blocking the event loop
            llm_response = await chat_engine.achat(payload.query, chat_history=chat_history)

            if isinstance(llm_response, LlamaAsyncStreamingResponse):
                async for token in llm_response.response_gen:
                    yield f"data: {json.dumps({'token': token})}\n\n"
            elif isinstance(llm_response, LlamaStreamingResponse):
                for token in llm_response.response_gen:
                    yield f"data: {json.dumps({'token': token})}\n\n"
            else:
                yield f"data: {json.dumps({'token': str(llm_response)})}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Error in chat stream: {e}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
