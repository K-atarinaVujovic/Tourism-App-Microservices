from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

# function that gets the token as a string
security = HTTPBearer()
SECRET_KEY = "yada_yada_yada"
ALGORITHM = "HS256"

USER_ID_CLAIM = "sub"
ROLE_CLAIM = "role"

def decode_token(token: str) -> dict:
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return {
      "user_id": payload.get(USER_ID_CLAIM),
      "role": payload.get(ROLE_CLAIM)
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