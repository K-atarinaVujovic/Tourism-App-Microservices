from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

# function that gets the token as a string
security = HTTPBearer()
SECRET_KEY = "super-secret-change-me"
ALGORITHM = "HS256"

USER_ID_CLAIM = "user_id"

def decode_token(token: str) -> dict:
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return {
      "user_id": payload.get(USER_ID_CLAIM)
    }
  except jwt.ExpiredSignatureError:
    raise ValueError("Token expired!")
  except jwt.InvalidTokenError:
    raise ValueError("Token invalid!")
  
# For FastAPI
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
  token = credentials.credentials
  try:
    return decode_token(token)
  except ValueError as e:
    raise HTTPException(status_code=401, detail=str(e))