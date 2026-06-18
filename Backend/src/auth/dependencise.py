from fastapi import Request, HTTPException, status, Depends
import jwt
from jwt import PyJWTError, ExpiredSignatureError, InvalidTokenError
from src.config import setting
from datetime import datetime
from src.auth.dao import UserDAO

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.user.model import User
from src.auth.utils import create_access_token

def get_token(request : Request):
    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return token

async def get_current_user(token : str = Depends(get_token), db: AsyncSession = Depends(get_session)) -> User:
    user_dao = UserDAO(db)
    
    try:
        payload = jwt.decode(
            token,
            setting.SECRETE_KEY,
            setting.ALGORITHM
        )
    
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="истёк expair")
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="не является jwt кодом")
    except PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="не является jwt кодом")
    
    user_id : int = int(payload.get("sub"))
    
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="в куке не информация про id")
    
    user = await user_dao.get_one_by_id(user_id)
    
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="нет пользователя с таким id")
    
    return user


async def verify_refresh_token(refresh_token: str, user_dao: UserDAO):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    try:
        payload = jwt.decode(refresh_token, setting.SECRETE_KEY, setting.ALGORITHM)
        user_id = int(payload.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = await user_dao.get_one_by_id(user_id)
    
    if not user or user.refresh_token != refresh_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    new_access_token = create_access_token({"sub": str(user.id)})
    
    return new_access_token


# for moderator
def get_current_moderator(user: User = Depends(get_current_user)):
    if user.role != "moderator":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="недостаточно прав")
    return user

def check_agreement(user: User = Depends(get_current_user)):
    if not user.consent_given:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="нет согласия на сбор персональных данных")
    return user