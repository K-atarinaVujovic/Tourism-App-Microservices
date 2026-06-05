from proto.profile_pb2_grpc import ProfileServiceServicer
from proto.profile_pb2 import ProfileResponse, Role as ProtoRole, ImageUploadResponse, BalanceResponse as ProtoBalanceResponse #type: ignore
from app.schemas.profile import ProfileCreate as ProfileCreateSchema
from app.schemas.profile import ProfileUpdate as ProfileUpdateSchema
from app.schemas.profile import Role, BalanceResponse as BalanceResponseSchema

ROLE_MAP = {
    Role.TOURIST: ProtoRole.TOURIST,
    Role.AUTHOR: ProtoRole.AUTHOR,
}

ROLE_REVERSE_MAP = {
    ProtoRole.TOURIST: Role.TOURIST,
    ProtoRole.AUTHOR: Role.AUTHOR,
}

class ProfileServicer(ProfileServiceServicer):
  def __init__(self, profile_service, upload_service):
    self.profile_service = profile_service
    self.upload_service = upload_service

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
        balance=result.balance
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

  def __get_profile_update_from_request(self, request):
    return ProfileUpdateSchema(
      name=request.name if request.HasField("name") else None,
      lastname=request.lastname if request.HasField("lastname") else None,
      imageUrl=request.imageUrl if request.HasField("imageUrl") else None,
      biography=request.biography if request.HasField("biography") else None,
      quote=request.quote if request.HasField("quote") else None,
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

  async def UpdateProfile(self, request, context):
    user_id = request.user_id
    profile_update = self.__get_profile_update_from_request(request)
    result = await self.profile_service.update(user_id, profile_update)
    return self.__get_profile_response_from_result(result)

  async def UploadImage(self, request, context):
    result = self.upload_service.upload_image_bytes(request.file_data, request.filename)
    return ImageUploadResponse(imageUrl = result["imageUrl"])

  # Gets balance by user id
  async def GetBalance(self, request, context):
    user_id = request.user_id
    result = await self.profile_service.get_balance(user_id)
    return ProtoBalanceResponse(balance=result.balance)

  # Update balance by id
  async def UpdateBalance(self, request, context):
    user_id = request.user_id
    balance = request.balance
    result = await self.profile_service.update_balance(user_id, BalanceResponseSchema(balance=balance))
    return ProtoBalanceResponse(balance=result.balance)