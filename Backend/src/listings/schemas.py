from fastapi import UploadFile
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime

class InvestmentInfo_S(BaseModel):
    roi: Optional[float] = Field(None, ge=0, le=1000, description="ROI в процентах")
    annual_yield: Optional[float] = Field(None, ge=0, le=1000, description="Годовая доходность в процентах")
    payback_years: Optional[float] = Field(None, ge=0, le=1000, description="Срок окупаемости в годах")
    min_investment: Optional[int] = Field(None, ge=0, description="Минимальная инвестиция")
    risk_level: Optional[Literal['low', 'medium', 'high']] = Field(None, ge=0, description="Уровень риска")
    class Config:
        json_schema_exstra = {
            "example": {
                "roi": 15.5,
                "annual_yield": 10.2,
                "payback_years": 5.5,
                "min_investment": 1000000,
                "risk_level": "medium"
            }
        }

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

    infrastructure: Optional[List[int]] = Field(
        default_factory=list, 
        description="Список ID объектов инфраструктуры (школы, парки, метро и т.д.)"
    )

    investment: InvestmentInfo_S = Field(
        default=None,
        description="Информация об инвестициях"
    )

    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Широта")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Долгота")
    
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
                "photos": ["afsdf09sdf90sdf0", "9ds90vsd0vc0x99"],
                "infrastructure": [1, 2, 3, 5],
                "investment": {
                    "roi": 15.0,
                    "annual_yield": 10.0,
                    "payback_years": 7,
                    "min_investment": 500000
                }
            }
        }
        
class FullListing_S(Listing_S):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    photos: List[str] = Field(default_factory=list)
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
                "photos": [],
                "infrastructure": [1, 2, 3],
                "investment": {
                    "roi": 15.0,
                    "annual_yield": 10.0
                },
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
    type: Optional[Literal['sale', 'rent']] = Field(None, description="Тип объявления")
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    price: Optional[int] = Field(None, gt=0)
    rooms: Optional[int] = Field(None, ge=0, le=20)
    area: Optional[int] = Field(None, gt=0, le=1000)
    address: Optional[str] = Field(None, min_length=5, max_length=300)
    status: Optional[Literal['draft', 'moderation', 'active', 'rejected']] = Field(None)
    photos: Optional[List[str]] = Field(None, description="Список ключей фото в S3") 
    infrastructure: Optional[List[int]] = Field(None, description="Список ID объектов инфраструктуры")
    investment: Optional[InvestmentInfo_S] = Field(None, description="Информация об инвестициях")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Широта")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Долгота")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "title": "Новое название",
                "price": 15000000,
                "status": "moderation",
                "photos": ["new_photo1.jpg", "new_photo2.jpg"],
                "infrastructure": [1, 2, 3],
                "investment": {
                    "roi": 15.5,
                    "annual_yield": 10.2
                }
            }
        }

class ModerationLog_S(BaseModel):
    id: int
    listing_id: int
    moderator_id: int
    action: Literal['accept', 'reject']
    previous_status: str
    new_status: str
    created_at: datetime
    reason: Optional[str] = None
    
    class Config:
        from_attributes = True
