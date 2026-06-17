from typing import Annotated, List
from pydantic import Field

from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile
from src.listings.dao import ListingDAO

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.auth.dependencies import get_current_user

from src.listings.schemas import FullListing_S, Listing_S, PaginationResponse_S

from src.user.model import User

import uuid

from src.s3.dependencise import get_s3_client
from src.s3.utils import check_size_of_file, check_type_of_file
from src.s3.client import S3Client

router = APIRouter(
    prefix="/listings",
    tags=["Объявления"]
)


@router.post("/add_listing")
async def add_listing(
    data: Listing_S,
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    listing_dao = ListingDAO(db)
    
    listing = await listing_dao.add(
        user_id=user.id,
        type=data.type,
        title=data.title,
        description=data.description,
        price=data.price,
        rooms=data.rooms,
        area=data.area,
        address=data.address,
        status=data.status,
        photos=[]
    )
    
    return {"id": listing.id, "message": "Объявление создано, теперь загрузите фото"}


@router.post("/add_listing_photos/{listing_id}")
async def add_listing_photos(
    listing_id: int,
    uploaded_files: list[UploadFile],
    db: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
    s3_client: S3Client = Depends(get_s3_client),
):
    listing_dao = ListingDAO(db)
    listing = await listing_dao.get_one_by_id(listing_id)
    
    if not listing or listing.user_id != user.id:
        raise HTTPException(404, "Объявление не найдено")
    if not uploaded_files:
        raise HTTPException(400, "Нет файлов")
    
    photos = listing.photos.copy()
    
    for uploaded_file in uploaded_files:
        check_size_of_file(uploaded_file)
        check_type_of_file(uploaded_file) 
        
        photos.append(key:=str(uuid.uuid4()))
        await s3_client.upload_file(uploaded_file, key)
    
    await listing_dao.update(listing_id, photos=photos)
    
    return {"message": "Фото загружены", "photos": photos}


@router.get("/filter_search")
async def filter_search(
                    offset: int = Query(0, ge=0),
                    limit: int|None = Query(None, ge=1, le=100),
                    start_price: float|None = Query(None, ge=0),
                    finish_price: float|None = Query(None, ge=0),
                    rooms: List[int]|None = Query(None),
                    type: str|None = Query(None, pattern="^(sale|rent)$"),
                    sort_by: str|None = Query(None, pattern="^(price|created_at)$"),
                    sort_order: str|None = Query(None, pattern="^(asc|desc)$"),
                    db: AsyncSession = Depends(get_session),
                    user: User = Depends(get_current_user)
                    ) -> PaginationResponse_S:
    if rooms:
        invalid_rooms = [r for r in rooms if not (0 <= r <= 100)]
        if invalid_rooms:
            raise HTTPException(400, f"Invalid room values: {invalid_rooms}. Must be between 0 and 100")
    
    listing_dao = ListingDAO(db)
    
    count_listings = await listing_dao.get_count(start_price, finish_price, rooms, type)
    list_listings = await listing_dao.get_all_by_filters_for_pagination(offset, limit, start_price, finish_price, rooms, type, sort_by, sort_order)
    
    has_more = offset + len(list_listings) < count_listings
    
    return PaginationResponse_S(
        list_listings=[FullListing_S.model_validate(listing, from_attributes=True) for listing in list_listings],
        count_listings=count_listings,
        offset=offset,
        limit=limit,
        has_more=has_more
    )

@router.get("/get_listing")
async def get_listing(
                    listing_id: int = Query(0),
                    db: AsyncSession = Depends(get_session),
                    user: User = Depends(get_current_user)) -> FullListing_S|None:
    listing_dao = ListingDAO(db)
    
    list_listings = await listing_dao.get_one_or_none(id=listing_id)
    
    return list_listings

            
