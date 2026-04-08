from repositories.profile import ProfileRepository
from models.profile import Profile
import database

database.init_db()
repo: ProfileRepository = ProfileRepository()

profile: Profile = Profile(
    user_id=1,
    name="John",
    lastname="Doe",
    imageUrl=None,
    biography=None,
    quote=None
)

up: Profile = Profile(
  user_id=1,
  name="Jane",
  lastname=None,
  imageUrl="heh/",
  biography=None,
  quote=None
)

repo.save(profile)
# repo.update(2, up)
# print(repo.get(2))


