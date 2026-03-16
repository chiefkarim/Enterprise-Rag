from __future__ import annotations
from typing import Optional

from pydantic import BaseModel, Field
from qdrant_client.http.models import DatetimeRange


class QueryFields(BaseModel):
    department: Optional[str] = None
    created_at: Optional[DatetimeRange] = None
    project_id: Optional[int] = None
    is_empty: list[str] = Field(default_factory=list)


class QueryFilters(BaseModel):
    must: list[QueryFields | QueryFilters] = Field(default_factory=list)
    should: list[QueryFields | QueryFilters] = Field(default_factory=list)
    must_not: list[QueryFields | QueryFilters] = Field(default_factory=list)


class ChatMessage(BaseModel):
    role: str
    content: str


class QueryRequest(BaseModel):
    filters: Optional[QueryFilters] = None
    query: str = Field(min_length=1)
    history: Optional[list[ChatMessage]] = Field(default_factory=list)
