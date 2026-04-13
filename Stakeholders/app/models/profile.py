from typing import Self

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Profile(Base):
  __tablename__ = "profiles"

  name: Mapped[str | None]
  lastname: Mapped[str | None]
  imageUrl: Mapped[str | None]
  biography: Mapped[str | None]
  quote: Mapped[str | None]
  role: Mapped[str | None]

  user_id: Mapped[int] = mapped_column(nullable=False, unique=True)

  def __init__(self, user_id: int, name: str, lastname: str | None = None, imageUrl: str | None = None, biography: str | None = None, quote: str | None = None, role: str | None = 'tourist'):
    self.user_id = user_id
    self.name = name
    self.lastname = lastname
    self.imageUrl = imageUrl
    self.biography = biography
    self.quote = quote
    self.role = role

  def __repr__(self) -> str:
    return f"Profile:\nname={self.name}\nlastname={self.lastname}\nimageUrl={self.imageUrl}\nbiography={self.biography}\nquote={self.quote}\nrole={self.role}"

  def update(self, name: str | None = None, lastname: str | None = None, imageUrl: str | None = None, biography: str | None = None, quote: str | None = None) -> Self:
    self.name = name if name is not None else self.name
    self.lastname = lastname if lastname is not None else self.lastname
    self.imageUrl = imageUrl if imageUrl is not None else self.imageUrl
    self.biography = biography if biography is not None else self.biography
    self.quote = quote if quote is not None else self.quote

    return self
