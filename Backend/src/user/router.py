from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from src.listings.dao import ListingDAO

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.auth.dependencise import check_agreement, get_current_user

from src.user.model import User, Role as UserRole
from src.dao.base import BaseRepository
from src.user.dao import UserDAO

router = APIRouter(
    prefix="/user",
    tags=["Пользователь"]
)

@router.patch("/users/{user_id}/role")
async def change_user_role(
    user_id: int,
    new_role: UserRole,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(check_agreement),
):
    if user.role != "moderator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только модератор может изменять роли пользователей"
        )
    
    if user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя изменить роль самому себе"
        )
    

    
    user_dao = UserDAO(db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    old_role = user.role
    await user_dao.update(id=user_id, role=new_role)
    
    return {
        "message": f"Роль пользователя {user.email} успешно изменена",
        "user_id": user_id,
        "old_role": old_role,
        "new_role": new_role
    }
    
    
@router.patch("/users/{user_id}/change_agreement")
async def change_user_role(
    user_id: int,
    agreement: bool,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user)
):
    user_dao = UserDAO(db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    await user_dao.update(id=user_id, consent_given=agreement, consent_date=None, consent_version=None)
    
    return {
        "inf": f"Согласие пользователя {user.email} успешно изменена на {agreement}",
    }
