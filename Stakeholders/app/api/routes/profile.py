from typing import Annotated, Any, Optional

from fastapi import APIRouter, Body, Depends, FastAPI, File, HTTPException, Path, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
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

# For endpoints that require the user to be logged in
protected_router = APIRouter(dependencies=[Depends(get_current_user)])

# For making Pydantic exceptions give a clean response
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": exc.errors()[0]["msg"]}
    )

@protected_router.post("/profiles/upload-image", response_model=dict)
async def upload_image(
  file: UploadFile = File(...)
):
  result = await uploader_service.upload_image(file)
  return result

@protected_router.get("/profiles/{user_id}", response_model=ProfileResponse)
async def get_profile(
  user_id: Annotated[int, Path()]
  ) -> Any:
  try:
    response = service.get_by_user_id(user_id)
    return response
  except NotFoundException as e:
    raise HTTPException(status_code=404, detail=str(e))

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
@protected_router.put("/profiles/update", response_model=ProfileResponse)
async def update_profile(
  profile: Annotated[ProfileUpdate, Body()],
  current_user = Depends(get_current_user)
  # user_id: Annotated[int, Body()]
) -> Any:
  try:
    user_id = current_user["user_id"]
    return service.update(user_id, profile)
  except NotFoundException as e:
    raise HTTPException(status_code=404, detail=str(e))

app.include_router(protected_router)