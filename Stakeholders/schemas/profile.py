from pydantic import BaseModel, ConfigDict, Field
from models.profile import Profile

class ProfileCreate(BaseModel):
  name: str
  lastname: str | None = Field(default=None)
  imageUrl: str | None = Field(default=None)
  biography: str | None = Field(default=None)
  quote: str | None = Field(default=None)
  user_id: int

class ProfileUpdate(BaseModel):
  name: str | None = Field(default=None)
  lastname: str | None = Field(default=None)
  imageUrl: str | None = Field(default=None)
  biography: str | None = Field(default=None)
  quote: str | None = Field(default=None)

class ProfileResponse(BaseModel):
  model_config = ConfigDict(from_attributes=True) # for easier conversion later?

  id: int
  name: str
  lastname: str | None = Field(default=None)
  imageUrl: str | None = Field(default=None)
  biography: str | None = Field(default=None)
  quote: str | None = Field(default=None)
  user_id: int
