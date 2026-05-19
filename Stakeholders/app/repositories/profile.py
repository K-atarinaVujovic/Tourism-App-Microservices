from beanie import PydanticObjectId
from app.models.profile import Profile

class ProfileRepository:
  async def save(self, profile: Profile) -> Profile:
    try:
      await profile.insert()
      return profile
    except Exception as e:
      raise RuntimeError(f"Failed to save profile: {e}")

  async def update(self, updated_profile: Profile) -> Profile:
    try:
      await updated_profile.save()
      return updated_profile
    except Exception as e:
      raise RuntimeError(f"Failed to update profile: {e}")

  async def get(self, profile_id: str) -> Profile | None:
    try:
      return await Profile.get(profile_id)
    except Exception as e:
      raise RuntimeError(f"Failed to get profile: {e}")

  async def get_by_user_id(self, user_id: int) -> Profile | None:
    try:
      return await Profile.find_one(Profile.user_id == user_id)
    except Exception as e:
      raise RuntimeError(f"Failed to get profile by user_id: {e}")