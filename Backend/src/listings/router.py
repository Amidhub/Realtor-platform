from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from src.listings.dao import ListingDAO

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.auth.dependencise import get_current_user

from src.listings.schemas import Listing_S

from src.user.model import User


router = APIRouter(
    prefix="/listings",
    tags=["Объявления"]
)


@router.post("/add")
async def register(data: Listing_S, db: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    listing_dao = ListingDAO(db)
    await listing_dao.add(
        user_id=user.id,
        type=data.type,
        title=data.title,
        description=data.description,
        price=data.price,
        rooms=data.rooms,
        area=data.area,
        address=data.address,
        status=data.status
    )    
    return {"inf":"OK200"}

