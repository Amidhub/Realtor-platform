from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict
from datetime import datetime

class Translation_S(BaseModel):
    key: str = Field(..., min_length=1, max_length=256, description="Ключ строки")
    locale: str = Field(..., min_length=2, max_length=10, description="Локаль (ru, en, kz)")
    value: str = Field(..., min_length=1, max_length=1000, description="Текст перевода")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "key": "common.save",
                "locale": "ru",
                "value": "Сохранить"
            }
        }


class TranslationResponse_S(BaseModel):
    id: int
    key: str
    locale: str
    value: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "key": "common.save",
                "locale": "ru",
                "value": "Сохранить",
                "created_at": "2024-01-15T10:30:00",
                "updated_at": "2024-01-15T10:30:00"
            }
        }


class TranslationsResponse_S(BaseModel):
    locale: str
    translations: Dict[str, str] # 

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "locale": "ru",
                "translations": {
                    "common.save": "Сохранить",
                    "common.cancel": "Отмена",
                    "common.delete": "Удалить",
                    "common.edit": "Редактировать",
                    "listing.title": "Объявления",
                    "listing.add": "Добавить объявление",
                    "auth.login": "Вход",
                    "auth.logout": "Выход"
                }
            }
        }


class TranslationBatch_S(BaseModel):
    locale: str
    translations: Dict[str, str]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "locale": "ru",
                "translations": {
                    "common.save": "Сохранить",
                    "common.cancel": "Отмена",
                    "common.delete": "Удалить",
                    "common.edit": "Редактировать",
                    "common.add": "Добавить",
                    "common.close": "Закрыть"
                }
            }
        }

class TranslationKeyList_S(BaseModel):
    keys: list[str]
    count: int
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "keys": ["common.save", "common.cancel", "listing.title", "auth.login"],
                "count": 4
            }
        }