from pydantic import BaseModel


class CreateUser(BaseModel):
    name: str
    password: str
    email: str
    

class CreateUserProject(BaseModel):
    user_id: int
    project_id: int
