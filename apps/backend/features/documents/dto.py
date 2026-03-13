from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CreateDocument(BaseModel):
    file_name: str
    source_file_update_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class UpdateDocument(BaseModel):
    file_name: str
    source_file_update_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
