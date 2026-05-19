# from sqlalchemy import create_engine
# from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
# import os

# class Base(DeclarativeBase):
#     id: Mapped[int] = mapped_column(primary_key=True)

# DATABASE_URL = os.getenv("STAKEHOLDERS_DB_URL", "postgresql+psycopg2://postgres:root@localhost:5432/stakeholders")

# engine = create_engine(DATABASE_URL)

# def init_db():
#     Base.metadata.create_all(engine, checkfirst=True)

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.profile import Profile
import os

DATABASE_URL = os.getenv("STAKEHOLDERS_DB_URL", "mongodb://localhost:27017")

async def init_db():
    client = AsyncIOMotorClient(DATABASE_URL)
    await init_beanie(database=client["stakeholders"], document_models=[Profile]) #type: ignore