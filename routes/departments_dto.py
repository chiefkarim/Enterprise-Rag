from pydantic import BaseModel, ConfigDict

class CreateDepartment(BaseModel):
    name: str
    
    model_config = ConfigDict(from_attributes=True)

class UpdateDepartment(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)
