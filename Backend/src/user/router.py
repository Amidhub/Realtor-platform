from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from src.listings.dao import ListingDAO

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.auth.dependencise import get_current_user

from src.user.model import User, Role as UserRole

router = APIRouter(
    prefix="/user",
    tags=["Пользователь"]
)

@router.patch("/users/{user_id}/role")
async def change_user_role(
    user_id: int,
    new_role: UserRole,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Изменяет роль пользователя (только для модераторов)
    """
    # Проверка прав: только модератор может менять роли
    if current_user.role != "moderator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только модератор может изменять роли пользователей"
        )
    
    # Нельзя изменить роль самому себе (опционально)
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя изменить роль самому себе"
        )
    
    # Ищем пользователя в базе данных
    from src.dao.base import BaseRepository
    
    class UserDAO(BaseRepository):
        model = User
    
    user_dao = UserDAO(db)
    user = await user_dao.get_one_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Сохраняем старую роль для ответа
    old_role = user.role
    
    # Обновляем роль
    await user_dao.update(id=user_id, role=new_role)
    
    return {
        "message": f"Роль пользователя {user.email} успешно изменена",
        "user_id": user_id,
        "old_role": old_role,
        "new_role": new_role
    }