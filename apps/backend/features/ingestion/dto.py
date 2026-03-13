from typing import Optional
from pydantic import BaseModel

from features.departments.models import Department


class EmbedRequest(BaseModel):
    file_ids: list[str]
    department: Department = Department.GENERAL
    project_id: Optional[str] = None
