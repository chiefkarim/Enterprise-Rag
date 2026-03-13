from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DocumentModel(BaseModel):
    id: int
    file_name: str
    source_file_update_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
