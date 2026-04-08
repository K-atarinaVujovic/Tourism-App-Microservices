from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

engine = create_engine("postgresql+psycopg2://postgres:root@localhost:5432/stakeholders")

def init_db():
    Base.metadata.create_all(engine, checkfirst=True)