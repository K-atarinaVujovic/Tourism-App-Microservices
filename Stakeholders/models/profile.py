from typing import Self

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Profile(Base):
  __tablename__ = "profiles"

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str | None]
  lastname: Mapped[str | None]
  imageUrl: Mapped[str | None]
  biography: Mapped[str | None]
  quote: Mapped[str | None]

  user_id: Mapped[int] = mapped_column(nullable=False, unique=True)

  def __init__(self, user_id: int, name: str, lastname: str | None = None, imageUrl: str | None = None, biography: str | None = None, quote: str | None = None):
    self.user_id = user_id
    self.name = name
    self.lastname = lastname
    self.imageUrl = imageUrl
    self.biography = biography
    self.quote = quote

  def __repr__(self) -> str:
    return f"Profile:\nname={self.name}\nlastname={self.lastname}\nimageUrl={self.imageUrl}\nbiography={self.biography}\nquote={self.quote}"

  def update(self, updated_profile: Self) -> Self:
    self.name = updated_profile.name if updated_profile.name is not None else self.name
    self.lastname = updated_profile.lastname if updated_profile.lastname is not None else self.lastname
    self.imageUrl = updated_profile.imageUrl if updated_profile.imageUrl is not None else self.imageUrl
    self.biography = updated_profile.biography if updated_profile.biography is not None else self.biography
    self.quote = updated_profile.quote if updated_profile.quote is not None else self.quote
    
    return self
