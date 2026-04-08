
from sqlalchemy import create_engine, select
from models.profile import Profile
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from core.database import engine

class ProfileRepository:
  def save(self, profile: Profile) -> Profile:
    try:
      with Session(engine) as session:
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile
    except SQLAlchemyError as e:
      raise RuntimeError(f"Failed to save profile: {e}")

  def update(self, updated_profile: Profile) -> Profile:
    try:
      with Session(engine) as session:
        merged = session.merge(updated_profile)
        session.commit()
        session.refresh(merged)
        return merged
    except SQLAlchemyError as e:
      raise RuntimeError(f"Failed to update profile: {e}")

  def get(self, profile_id: int) -> Profile | None:
    try:
      with Session(engine) as session:
        return session.get(Profile, profile_id)
    except SQLAlchemyError as e:
      raise RuntimeError(f"Failed to get profile: {e}")

  def get_by_user_id(self, user_id: int) -> Profile | None:
    try:
      with Session(engine) as session:
        return session.execute(select(Profile).filter_by(user_id=user_id)).scalar_one_or_none()
    except SQLAlchemyError as e:
      raise RuntimeError(f"Failed to get profile by user_id: {e}")