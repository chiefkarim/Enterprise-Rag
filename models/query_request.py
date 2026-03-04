from typing import Optional
from pydantic import BaseModel, Field
from qdrant_client.http.models import DatetimeRange

from models.department import Department


class QueryFilters(BaseModel):
    department: Optional[Department] = None
    created_at: Optional[DatetimeRange] = None


class QueryRequest(BaseModel):
    filters: Optional[QueryFilters] = None
    query: str = Field(min_length=1)
