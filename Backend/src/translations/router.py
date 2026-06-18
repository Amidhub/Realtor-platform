from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.auth.dependencise import get_current_moderator, get_current_user
from src.user.model import User
from src.translations.dao import TranslationDAO
from src.translations.schemas import (
    Translation_S, TranslationResponse_S, TranslationKeyList_S,
    TranslationsResponse_S, TranslationBatch_S
)

router = APIRouter(
    prefix="/translations",
    tags=["Переводы"]
)

@router.get("/keys/all")
async def get_all_keys(
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user)
) -> TranslationKeyList_S: 
    translation_dao = TranslationDAO(db)
    keys = await translation_dao.get_all_keys()
    
    return TranslationKeyList_S( 
        keys=keys,
        count=len(keys)
    )


@router.get("/{locale}")
async def get_translations(
    locale: str,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user)
) -> TranslationsResponse_S:
    translation_dao = TranslationDAO(db)
    translations = await translation_dao.get_all_by_locale(locale)

    return TranslationsResponse_S(
        locale=locale,
        translations=translations
    )

@router.get("/{locale}/{key}")
async def get_translation(
    locale: str,
    key: str,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user)
) -> TranslationResponse_S:
    translation_dao = TranslationDAO(db)
    translation = await translation_dao.get_by_key_and_locale(key, locale)

    if not translation:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail=f"Translation not found for key '{key}' and locale '{locale}'"
        )
    
    return translation


@router.post("/")
async def create_translation(
    data: Translation_S,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_moderator)
) -> TranslationResponse_S:
    translation_dao = TranslationDAO(db)

    existing = await translation_dao.get_by_key_and_locale(data.key, data.locale)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Translation already exists for key '{data.key}' and '{data.locale}'"
        )
    
    translation = await translation_dao.add(
        key=data.key,
        locale=data.locale,
        value=data.value
    )

    return translation


@router.put("/{id}")
async def update_translation(
    id: int,
    value: str,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_moderator)
) -> TranslationResponse_S:
    translation_dao = TranslationDAO(db)

    translation = await translation_dao.get_one_by_id(id)

    if not translation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation not found"
        )
    
    await translation_dao.update(id, value=value)

    updated = await translation_dao.get_one_by_id(id)
    return updated

@router.post("/batch")
async def upsert_translations_batch(
    data: TranslationBatch_S,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_moderator)
):
    translation_dao = TranslationDAO(db)
    await translation_dao.upsert_batch(data.locale, data.translations)

    return {"message": f"Translations for locale '{data.locale}' updated successfully"}

@router.delete("/{locale}/{key}")
async def delete_translation(
    locale: str,
    key: str,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_moderator)
):
    translation_dao = TranslationDAO(db)
    deleted = await translation_dao.delete_by_key(key, locale)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Translation not found for key '{key}' and locale '{locale}'"
        )
    
    return {"message": f"Translation '{key}' deleted succesfully"}
