from typing import List

from src.dao.base import BaseRepository
from src.listings.models import Listing
from sqlalchemy import select, and_, func
class ListingDAO(BaseRepository):
    model=Listing
    
    async def get_count(self,
                        start_price: int|None, finish_price: int|None,
                        rooms: List[int]|None, type: str|None):
        conditions = []
        
        if start_price is not None:
            conditions.append(self.model.price >= start_price)
        if finish_price is not None:
            conditions.append(self.model.price <= finish_price)
        if rooms is not None:
            conditions.append(self.model.rooms.in_(rooms))
        if type is not None:
            conditions.append(self.model.type == type)
            
        query = select(func.count()).select_from(self.model)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        result = await self.session.execute(query)
        return result.scalar()    
    
    async def get_all_by_filters_for_pagination(self, offset: int|None, limit: int|None,
                                                start_price: int|None, finish_price: int|None,
                                                rooms: List[int]|None, type: str|None,
                                                sort_by: str|None, sort_order: str = "asc"):
        conditions = []
        
        if start_price is not None:
            conditions.append(self.model.price >= start_price)
        if finish_price is not None:
            conditions.append(self.model.price <= finish_price)
        if rooms is not None:
            conditions.append(self.model.rooms.in_(rooms))
        if type is not None:
            conditions.append(self.model.type == type)
        
        query = select(self.model)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        if sort_by is not None:
            match sort_by, sort_order:
                case "price", "asc":
                    query = query.order_by(self.model.price.asc())
                case "price", "desc":
                    query = query.order_by(self.model.price.desc())
                case "created_at", "asc":
                    query = query.order_by(self.model.created_at.asc())
                case "created_at", "desc":
                    query = query.order_by(self.model.created_at.desc())
    
        if offset is not None:
            query = query.offset(offset)
        
        if limit is not None:
            query = query.limit(limit)
            
        result = await self.session.execute(query)
        return result.scalars().all()
        