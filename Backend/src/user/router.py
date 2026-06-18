import datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencise import check_agreement, get_current_user
from src.database import get_session
from src.user.dao import UserDAO
from src.user.model import Role as UserRole
from src.user.model import User


router = APIRouter(
    prefix="/user",
    tags=["Пользователь"],
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
            detail="Только модератор может изменять роли пользователей",
        )

    if user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя изменить роль самому себе",
        )

    user_dao = UserDAO(db)

    target_user = await user_dao.get_one_or_none(id=user_id)

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    old_role = target_user.role

    await user_dao.update(id=user_id, role=new_role)

    return {
        "message": f"Роль пользователя {target_user.email} успешно изменена",
        "user_id": user_id,
        "old_role": old_role,
        "new_role": new_role,
    }


@router.patch("/me/change_agreement")
async def change_my_agreement(
    agreement: bool,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    user_dao = UserDAO(db)

    await user_dao.update(
        id=user.id,
        consent_given=agreement,
        consent_date=datetime.datetime.utcnow() if agreement else None,
        consent_version="1.0" if agreement else None,
    )

    return {"message": "Согласие обновлено"}


@router.delete("/delete")
async def delete(
    response: Response,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    user_id = user.id

    await db.execute(
        text("""
            DELETE FROM messages
            WHERE sender_id = :user_id
            OR conversation_id IN (
                SELECT id
                FROM conversations
                WHERE owner_id = :user_id
                   OR buyer_id = :user_id
                   OR listing_id IN (
                       SELECT id
                       FROM listings
                       WHERE user_id = :user_id
                   )
            )
        """),
        {"user_id": user_id},
    )

    await db.execute(
        text("""
            DELETE FROM moderation_logs
            WHERE moderator_id = :user_id
            OR listing_id IN (
                SELECT id
                FROM listings
                WHERE user_id = :user_id
            )
        """),
        {"user_id": user_id},
    )

    await db.execute(
        text("""
            DELETE FROM conversations
            WHERE owner_id = :user_id
               OR buyer_id = :user_id
               OR listing_id IN (
                   SELECT id
                   FROM listings
                   WHERE user_id = :user_id
               )
        """),
        {"user_id": user_id},
    )

    await db.execute(
        text("""
            DELETE FROM listings
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    )

    await db.execute(
        text("""
            DELETE FROM users
            WHERE id = :user_id
        """),
        {"user_id": user_id},
    )

    await db.commit()

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return {"inf": "OK"}