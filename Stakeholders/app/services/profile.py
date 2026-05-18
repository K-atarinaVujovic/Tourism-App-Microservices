from app.models.profile import Profile
from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from app.core.exceptions import NotFoundException, AlreadyExistsException

class ProfileService:
  repo: ProfileRepository = ProfileRepository()

  async def create(self, profile: ProfileCreate) -> ProfileResponse:
    if await self.repo.get_by_user_id(profile.user_id) is not None:
      raise AlreadyExistsException("Profile already exists for this user")
    new_profile = Profile(
      user_id=profile.user_id,
      name=profile.name,
      lastname=profile.lastname,
      imageUrl=profile.imageUrl,
      biography=profile.biography,
      quote=profile.quote,
      role=profile.role
    )
    saved = await self.repo.save(new_profile)
    data = saved.model_dump() # because uhhh getting id from doc db or something idk
    data["id"] = str(saved.id)
    return ProfileResponse.model_validate(data)

  async def update(self, user_id: int, updated_profile_schema: ProfileUpdate) -> ProfileResponse:
    profile = await self.repo.get_by_user_id(user_id)
    if profile is None:
      raise NotFoundException("No profile to update")
    profile.update_fields(
      name=updated_profile_schema.name,
      lastname=updated_profile_schema.lastname,
      imageUrl=updated_profile_schema.imageUrl,
      biography=updated_profile_schema.biography,
      quote=updated_profile_schema.quote
    )
    updated = await self.repo.update(profile)
    data = updated.model_dump()
    data["id"] = str(updated.id)
    return ProfileResponse.model_validate(data)

  async def get(self, profile_id: str) -> ProfileResponse:
    profile = await self.repo.get(profile_id)
    if profile is None:
      raise NotFoundException("Profile not found")
    data = profile.model_dump()
    data["id"] = str(profile.id)
    return ProfileResponse.model_validate(data)

  async def get_by_user_id(self, user_id: int) -> ProfileResponse:
    profile = await self.repo.get_by_user_id(user_id)
    if profile is None:
      raise NotFoundException("Profile not found")
    data = profile.model_dump()
    data["id"] = str(profile.id)
    return ProfileResponse.model_validate(data)