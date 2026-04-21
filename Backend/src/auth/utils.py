from passlib.context import CryptContext
from pydantic import EmailStr
from src.auth.dao import UserDAO
from datetime import datetime, timedelta
import jwt
from src.config import setting


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        setting.SECRETE_KEY,
        setting.ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        setting.SECRETE_KEY,
        setting.ALGORITHM
    )
    return encoded_jwt

async def authenticate_user(email: EmailStr, password: str, user_dao: UserDAO):
    user = await user_dao.get_one_or_none(email=email)
    if not user and not verify_password(password, user.hashed_password):
        None
    return user
