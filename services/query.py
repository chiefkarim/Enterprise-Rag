from typing import Optional
from llama_index.core import (
    VectorStoreIndex,
)
from qdrant_client.http.models import MatchValue, FieldCondition, Filter

from infrastructure.vector_store_provider import VectorStoreProvider
from models.query_request import QueryFilters


def query(query: str, user_filters: Optional[QueryFilters] = None):
    provider = VectorStoreProvider()
    must = []
    if user_filters:
        department = user_filters.department
        if department:
            must.append(
                FieldCondition(
                    key="department", match=MatchValue(value=department.value)
                )
            )
        created_at = user_filters.created_at
        if created_at:
            must.append(FieldCondition(key="created_at", range=(created_at)))
    qdrant_filters = Filter(must=must) if len(must) != 0 else None

    index = VectorStoreIndex.from_vector_store(vector_store=provider.get_vector_store())

    retriever = index.as_retriever(
        vector_store_kwargs=(
            {"qdrant_filters": qdrant_filters} if qdrant_filters else None
        )
    )
    return retriever.retrieve(query)
