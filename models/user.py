from datetime import datetime
from pydantic import BaseModel, ConfigDict


class User(BaseModel):
    id: int
    name: str
    email: str | None = None
    role: str = "user"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserInDB(User):
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)


class UserProject(BaseModel):
    user_id: int
    project_id: int
    id: int

    model_config = ConfigDict(from_attributes=True)
