from pydantic import BaseModel, ConfigDict, Field
from enum import Enum
from app.models.profile import Profile

class Role(str, Enum):
    TOURIST = "tourist"
    ADMIN = "admin"

class ProfileCreate(BaseModel):
  name: str
  lastname: str | None = Field(default=None)
  imageUrl: str | None = Field(default=None)
  biography: str | None = Field(default=None)
  quote: str | None = Field(default=None)
  user_id: int
  role: Role

class ProfileUpdate(BaseModel):
  name: str | None = Field(default=None)
  lastname: str | None = Field(default=None)
  imageUrl: str | None = Field(default=None)
  biography: str | None = Field(default=None)
  quote: str | None = Field(default=None)

class ProfileResponse(BaseModel):
  model_config = ConfigDict(from_attributes=True) # for easier conversion later?

  id: int
  name: str | None = Field(default=None)
  lastname: str | None = Field(default=None)
  imageUrl: str | None = Field(default=None)
  biography: str | None = Field(default=None)
  quote: str | None = Field(default=None)
  user_id: int
  role: Role
