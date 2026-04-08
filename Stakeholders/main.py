from repositories.profile import ProfileRepository
from models.profile import Profile
import core.database as database
from schemas.profile import ProfileCreate, ProfileUpdate
from services.profile import ProfileService

database.init_db()
# repo: ProfileRepository = ProfileRepository()
service: ProfileService = ProfileService()

# CREATE
create_schema = ProfileCreate(
    user_id=2,
    name="John",
    lastname="Doe",
    biography="Some bio"
)
created = service.create(create_schema)
print("Created:", created)

# GET
fetched = service.get(created.id)
print("Fetched by id:", fetched)

# GET BY USER ID
fetched_by_user = service.get_by_user_id(3)
print("Fetched by user_id:", fetched_by_user)

# UPDATE
update_schema = ProfileUpdate(
    name="Jane",
    quote="Some quote"
)
updated = service.update(created.id, update_schema)
print("Updated:", updated)


# profile: Profile = Profile(
#     user_id=1,
#     name="John",
#     lastname="Doe",
#     imageUrl=None,
#     biography=None,
#     quote=None
# )

# up: Profile = Profile(
#   user_id=1,
#   name="Jane",
#   lastname=None,
#   imageUrl="heh/",
#   biography=None,
#   quote=None
# )

# repo.save(profile)
# repo.update(2, up)
# print(repo.get(2))


