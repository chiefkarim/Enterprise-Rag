from typing import Optional
from llama_index.core import (
    VectorStoreIndex,
)

from infrastructure.vector_store_provider import VectorStoreProvider
from features.query.models import QueryFilters
from features.query.filter_handler import FilterHandlerFactory


def query(
    vector_store: VectorStoreProvider,
    query: str,
    user_filters: Optional[QueryFilters] = None,
):
    filters = None

    if user_filters:
        filter_handler = FilterHandlerFactory().filter_handler
        filters = filter_handler.apply_filters(user_filters)

    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store.get_vector_store()
    )
    retriever = index.as_retriever(
        vector_store_kwargs={"qdrant_filters": filters}, similarity_top_k=10
    )
    return retriever.retrieve(query)
