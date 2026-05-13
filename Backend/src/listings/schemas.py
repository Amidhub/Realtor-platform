from fastapi import UploadFile
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime

class Listing_S(BaseModel):
    type: Literal['sale', 'rent'] = Field(description="Тип объявления")
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=10, max_length=5000)

    price: int = Field(gt=0, le=1_000_000_000)
    rooms: int = Field(ge=0, le=20)
    area: float = Field(gt=0, le=5000)
    address: str = Field(min_length=5, max_length=300)
    status: Literal['draft', 'moderation', 'active', 'rejected'] = Field(default='draft')
    photos: List[str] = Field(default_factory=list, description="Список ключей фото в S3")

    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "sale",
                "title": "Квартира в центре",
                "description": "Светлая квартира с ремонтом",
                "price": 10000000,
                "rooms": 2,
                "area": 65,
                "address": "ул. Пушкина, 10",
                "status": "draft",
                "photos": ["afsdf09sdf90sdf0", "9ds90vsd0vc0x99"]
            }
        }
        
class FullListing_S(Listing_S):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 123,
                "type": "sale",
                "title": "Квартира в центре",
                "description": "Светлая квартира с ремонтом",
                "price": 10000000,
                "rooms": 2,
                "area": 65.5,
                "address": "ул. Пушкина, 10",
                "status": "active",
                "created_at": "2024-01-15T10:30:00",
                "updated_at": "2024-01-15T10:30:00"
            }
        }

class PaginationResponse_S(BaseModel):
    list_listings: list[FullListing_S]
    count_listings: int
    offset: int|None
    limit: int|None
    has_more: bool

class ListingUpdate_S(BaseModel):
    """Схема для обновления объявления (все поля опциональны)"""
    type: Optional[Literal['sale', 'rent']] = Field(None, description="Тип объявления")
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    price: Optional[int] = Field(None, gt=0)
    rooms: Optional[int] = Field(None, ge=0, le=20)
    area: Optional[int] = Field(None, gt=0, le=1000)
    address: Optional[str] = Field(None, min_length=5, max_length=300)
    status: Optional[Literal['draft', 'moderation', 'active', 'rejected']] = Field(None)
