from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from src.auth.utils import get_password_hash, authenticate_user, create_access_token, create_refresh_token
from src.auth.dao import UserDAO

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session

from src.auth.schemas import UserAuth_S, UserReg_S

from src.auth.dependencise import check_agreement, get_current_user, verify_refresh_token, get_token
from src.user.model import User


router = APIRouter(
    prefix="/auth",
    tags=["Аунтификация"]
)


@router.post("/register")
async def register(data: UserReg_S, db: AsyncSession = Depends(get_session)):
    if not data.agreement:
        raise HTTPException(400, "No agreement")
    
    user_dao = UserDAO(db)
    is_exist= await user_dao.get_one_or_none(email=data.email)
    
    if is_exist:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    
    hashed_password=get_password_hash(data.password)
    await user_dao.add(email=data.email, hashed_password=hashed_password, consent_given = data.agreement)
    return {"inf":"OK200"}


@router.post("/login")
async def login(response: Response, data: UserAuth_S, db: AsyncSession = Depends(get_session)):
    user_dao = UserDAO(db)
    user: User = await authenticate_user(data.email, data.password, user_dao)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    await user_dao.update(user.id, refresh_token=refresh_token)
    
    response.set_cookie(
        "access_token", 
        access_token,
        max_age=30 * 60, # 30 минут
        httponly=True,   # защита от XSS
        secure=False,    # в разработке False, в проде True
        samesite="lax",  # защита от CSRF
        path="/"
    )
    
    response.set_cookie(
        "refresh_token",
        refresh_token,
        max_age=30*24*60*60,
        httponly=True,
        samesite="lax")
    
    return {"message": "ok"}


@router.post("/refresh")
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_session)):
    refresh_token = request.cookies.get("refresh_token")
    user_dao = UserDAO(db)
    
    new_access_token = await verify_refresh_token(refresh_token, user_dao)
    
    response.set_cookie(
        "access_token",
        new_access_token,
        max_age=30*60,
        httponly=True,
        samesite="lax"
        )
    
    return {"message": "refreshed"}


@router.delete("/logout")
async def logout(response: Response, db: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    user_dao = UserDAO(db)
    await user_dao.update(user.id, refresh_token=None)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")


@router.get("/me")
async def me(user: User = Depends(check_agreement)):
    return user


@router.get("/token_curr_user")
async def token_curr_user(token: str = Depends(get_token)):
    return {"token": token}

