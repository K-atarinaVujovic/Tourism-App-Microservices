from typing import Annotated, Any

from fastapi import Body, Depends, FastAPI, HTTPException, Path

from core.exceptions import AlreadyExistsException, NotFoundException
from core.security import get_current_user
from schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from services.profile import ProfileService

app = FastAPI()
service = ProfileService()

@app.get("/profiles/{profile_id}", response_model=ProfileResponse)
async def get_profile(
  profile_id: Annotated[int, Path()]
  ) -> Any:
  try:
    response = service.get(profile_id)
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

