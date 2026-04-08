from models.profile import Profile
from repositories.profile import ProfileRepository
from schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from core.exceptions import NotFoundException, AlreadyExistsException

class ProfileService:
  repo: ProfileRepository = ProfileRepository()

  def create(self, profile: ProfileCreate) -> ProfileResponse:
    if self.repo.get_by_user_id(profile.user_id) is not None:
      raise AlreadyExistsException("Profile already exists for this user")
    new_profile = Profile(
      user_id=profile.user_id,
      name=profile.name,
      lastname=profile.lastname,
      imageUrl=profile.imageUrl,
      biography=profile.biography,
      quote=profile.quote
    )
    return ProfileResponse.model_validate(self.repo.save(new_profile))

  def update(self, profile_id: int, updated_profile_schema: ProfileUpdate) -> ProfileResponse:
    profile = self.repo.get(profile_id)
    if profile is None:
      raise NotFoundException("No profile to update")
    profile.update(
      name=updated_profile_schema.name,
      lastname=updated_profile_schema.lastname,
      imageUrl=updated_profile_schema.imageUrl,
      biography=updated_profile_schema.biography,
      quote=updated_profile_schema.quote
    )
    return ProfileResponse.model_validate(self.repo.update(profile))

  def get(self, profile_id: int) -> ProfileResponse:
    profile = self.repo.get(profile_id)
    if profile is None:
      raise NotFoundException("Profile not found")

    return ProfileResponse.model_validate(profile)
  
  def get_by_user_id(self, user_id: int) -> ProfileResponse:
    profile = self.repo.get_by_user_id(user_id)
    if profile is None:
      raise NotFoundException("Profile not found")

    return ProfileResponse.model_validate(profile)