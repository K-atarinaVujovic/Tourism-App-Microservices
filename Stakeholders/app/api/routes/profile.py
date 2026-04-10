from typing import Annotated, Any, Optional

from fastapi import Body, Depends, FastAPI, File, HTTPException, Path, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles

from app.core.exceptions import AlreadyExistsException, NotFoundException
from app.core.security import get_current_user, decode_token
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from app.services.profile import ProfileService
from app.services.upload import Uploader


app = FastAPI()
service = ProfileService()
uploader_service = Uploader()

security = HTTPBearer(auto_error=False)

# For serving images
app.mount("/images", StaticFiles(directory="images"), name="images")

@app.post("/profiles/upload-image", response_model=dict)
async def upload_image(
  file: UploadFile = File(...)
):
  result = await uploader_service.upload_image(file)
  return result

@app.get("/profiles/{user_id}", response_model=ProfileResponse)
async def get_profile(
  user_id: Annotated[int, Path()]
  ) -> Any:
  try:
    response = service.get_by_user_id(user_id)
    return response
  except NotFoundException as e:
    raise HTTPException(status_code=404, detail=str(e))

# Should only authorize Auth service to be able to call this later !
@app.post("/profiles/create", response_model=ProfileResponse)
async def create_profile(
  profile: Annotated[ProfileCreate, Body()]
) -> Any:
  try:
    response = service.create(profile)
    return response
  except AlreadyExistsException as e:
    raise HTTPException(status_code=409, detail=str(e))

# Currently requires a jwt to be sent with a user_id
@app.put("/profiles/update", response_model=ProfileResponse)
async def update_profile(
  profile: Annotated[ProfileUpdate, Body()],
  current_user = Depends(get_current_user)
) -> Any:
  try:
    user_id = current_user["user_id"]
    return service.update(user_id, profile)
  except NotFoundException as e:
    raise HTTPException(status_code=404, detail=str(e))

