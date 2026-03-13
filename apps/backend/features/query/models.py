from __future__ import annotations
from typing import Optional

from pydantic import BaseModel, Field
from qdrant_client.http.models import DatetimeRange
from features.departments.models import Department


class QueryFields(BaseModel):
    department: Optional[Department] = None
    created_at: Optional[DatetimeRange] = None
    project_id: Optional[int] = None
    is_empty: list[str] = Field(default_factory=list)


class QueryFilters(BaseModel):
    must: list[QueryFields | QueryFilters] = Field(default_factory=list)
    should: list[QueryFields | QueryFilters] = Field(default_factory=list)
    must_not: list[QueryFields | QueryFilters] = Field(default_factory=list)


class QueryRequest(BaseModel):
    filters: Optional[QueryFilters] = None
    query: str = Field(min_length=1)
