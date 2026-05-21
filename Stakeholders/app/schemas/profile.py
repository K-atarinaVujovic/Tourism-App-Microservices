from pydantic import BaseModel, ConfigDict, Field
from app.models.profile import Role

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
    id: str  # MongoDB id is a string, not int
    name: str | None = Field(default=None)
    lastname: str | None = Field(default=None)
    imageUrl: str | None = Field(default=None)
    biography: str | None = Field(default=None)
    quote: str | None = Field(default=None)
    user_id: int
    role: Role