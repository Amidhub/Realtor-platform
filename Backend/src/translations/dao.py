from src.dao.base import BaseRepository
from src.translations.models import Translation
from sqlalchemy import select
from typing import Dict, List, Optional

class TranslationDAO(BaseRepository):
    model = Translation

    async def get_by_key_and_locale(self, key: str, locale: str) -> Translation | None:
        result = await self.session.execute(
            select(self.model).where(
                self.model.key == key,
                self.model.locale == locale
            )
        )
        return result.scalar_one_or_none()
    
    async def get_all_by_locale(self, locale: str) -> Dict[str, str]:
        result = await self.session.execute(
            select(self.model).where(self.model.locale == locale)
        )
        translations = result.scalars().all()
        return {t.key: t.value for t in translations}
    
    async def upsert(self, key: str, locale: str, value: str) -> Translation:
        existing = await self.get_by_key_and_locale(key, locale)

        if existing:
            await self.update(existing.id, value=value)
            return existing
        else:
            return await self.add(key=key, locale=locale, value=value)
        
    async def upsert_batch(self, locale: str, translations: Dict[str, str]) -> List[Translation]:
        results = []
        for key, value in translations.items():
            translation = await self.upsert(key, locale, value)
            results.append(translation)
        return results
    
    async def delete_by_key(self, key: str, locale: str) -> bool:
        translation = await self.get_by_key_and_locale(key, locale)
        if translation:
            await self.delete(translation.id)
            return True
        return False
    
    async def get_all_keys(self) -> List[str]:
        result = await self.session.execute(
            select(self.model.key).distinct()
        )
        return list(result.scalars().all())