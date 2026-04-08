from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)

engine = create_engine("postgresql+psycopg2://postgres:root@localhost:5432/stakeholders")

def init_db():
    Base.metadata.create_all(engine, checkfirst=True)