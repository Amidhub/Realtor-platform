from pydantic import BaseModel, Field
from typing import Literal

class Listing_S(BaseModel):
    type: Literal['sale', 'rent'] = Field(description="Тип объявления")
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    price: int = Field(gt=0)
    rooms: int = Field(ge=0, le=20)
    area: int = Field(gt=0, le=1000)
    address: str = Field(min_length=5, max_length=300)
    status: Literal['draft', 'moderation', 'active', 'rejected'] = Field(default='draft')
    
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
                "status": "draft"
            }
        }