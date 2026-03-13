from enum import Enum
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class Department(Enum):
    HR = "hr"
    CONSULTING = "consulting"
    GENERAL = "general"
    RND = "rnd"
    ENGINEERING = "engineering"
    FINANCE = "finance"

class DepartmentModel(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
