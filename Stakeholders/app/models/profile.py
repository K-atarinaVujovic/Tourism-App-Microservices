from typing import Annotated, Self
from beanie import Document, Indexed
from enum import Enum

class Role(str, Enum):
  TOURIST = "tourist"
  AUTHOR = "author"

class Profile(Document):
  # ID is automatically set up by Beanie's Document
  name: str | None = None
  lastname: str | None = None
  imageUrl: str | None = None
  biography: str | None = None
  quote: str | None = None
  role: str | None = "tourist"

  user_id: Annotated[int, Indexed(unique=True)]

  class Settings:
    name = "profiles"  # collection name

  def __repr__(self) -> str:
    return f"Profile:\nname={self.name}\nlastname={self.lastname}\nimageUrl={self.imageUrl}\nbiography={self.biography}\nquote={self.quote}\nrole={self.role}"

  def update_fields(self, name: str | None = None, lastname: str | None = None, imageUrl: str | None = None, biography: str | None = None, quote: str | None = None) -> Self:
    self.name = name if name is not None else self.name
    self.lastname = lastname if lastname is not None else self.lastname
    self.imageUrl = imageUrl if imageUrl is not None else self.imageUrl
    self.biography = biography if biography is not None else self.biography
    self.quote = quote if quote is not None else self.quote
    return self