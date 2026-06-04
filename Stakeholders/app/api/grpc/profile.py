from proto.profile_pb2_grpc import ProfileServiceServicer
from proto.profile_pb2 import ProfileResponse, Role as ProtoRole #type: ignore
from app.schemas.profile import ProfileCreate as ProfileCreateSchema
from app.schemas.profile import ProfileUpdate as ProfileUpdateSchema
from app.schemas.profile import Role

ROLE_MAP = {
    Role.TOURIST: ProtoRole.TOURIST,
    Role.AUTHOR: ProtoRole.AUTHOR,
}

ROLE_REVERSE_MAP = {
    ProtoRole.TOURIST: Role.TOURIST,
    ProtoRole.AUTHOR: Role.AUTHOR,
}

class ProfileServicer(ProfileServiceServicer):
  def __init__(self, profile_service):
    self.profile_service = profile_service

  def __get_profile_response_from_result(self, result):
    return ProfileResponse(
        id=result.id,
        name=result.name,
        lastname=result.lastname,
        imageUrl=result.imageUrl,
        biography=result.biography,
        quote=result.quote,
        user_id=result.user_id,
        role=ROLE_MAP.get(result.role, ProtoRole.TOURIST), # first param what we are mapping, second param default value
        balance=result.balance,
    )

  def __get_profile_update_from_request(self, request):
    return ProfileUpdateSchema(
      name=request.name,
      lastname=request.lastname if request.HasField("lastname") else None,
      imageUrl=request.imageUrl if request.HasField("imageUrl") else None,
      biography=request.biography if request.HasField("biography") else None,
      quote=request.quote if request.HasField("quote") else None,
      balance=request.balance if request.HasField("balance") else None,
    )
  
  def __get_profile_create_from_request(self, request):
    return ProfileCreateSchema(
      user_id=request.user_id,
      name=request.name,
      lastname=request.lastname if request.HasField("lastname") else None,
      imageUrl=request.imageUrl if request.HasField("imageUrl") else None,
      biography=request.biography if request.HasField("biography") else None,
      quote=request.quote if request.HasField("quote") else None,
      role=ROLE_REVERSE_MAP.get(request.role, Role.TOURIST),
      balance=request.balance if request.HasField("balance") else None,
    )

  async def CreateProfile(self, request, context):
    profile_create = self.__get_profile_create_from_request(request)
    result = await self.profile_service.create(profile_create)
    return self.__get_profile_response_from_result(result)

  async def GetProfile(self, request, context):
    user_id = request.user_id
    result = await self.profile_service.get_by_user_id(user_id)
    return self.__get_profile_response_from_result(result)
    

  def UpdateProfile(self, request, context):
    user_id = request.user_id
    profile_update = self.__get_profile_update_from_request(request)
    result = self.profile_service.update(user_id, profile_update)
    return self.__get_profile_response_from_result(result)

  def UploadImage(self, request, context):
    result = self.upload_service.upload_image_bytes(request.file_data, request.filename)
    return ImageUploadResponse(imageUrl = result["imageUrl"])

  # Gets balance by user id
  def GetBalance(self, request, context):
    user_id = request.user_id
    result = self.profile_service.getBalance(user_id)
    return self.__get_balance_response_from_result(result)

  # Update balance by id
  def UpdateBalance(self, request, context):
    user_id = request.user_id
    balance = request.balance
    result = self.profile_service.update_balance(user_id, balance)
    return self.__get_balance_response_from_result(result)