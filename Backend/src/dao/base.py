from typing import Optional, List, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class BaseRepository():
    
    model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_all(self, **kwargs) -> List[Any]:
        query = select(self.model).filter_by(**kwargs)
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def get_one_or_none(self, **kwargs) -> Optional[Any]:
        query = select(self.model).filter_by(**kwargs)
        result = await self.session.execute(query)
        return result.scalars().one_or_none()
    
    async def get_one_by_id(self, id: int) -> Optional[Any]:
        query = select(self.model).filter_by(id=id)
        result = await self.session.execute(query)
        return result.scalars().one_or_none()
    
    async def add(self, **data) -> Any:
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance
    
    async def update(self, id: int, **data) -> Optional[Any]:
        instance = await self.get_one_by_id(id)
        if instance:
            for key, value in data.items():
                setattr(instance, key, value)
            await self.session.commit()
            await self.session.refresh(instance)
        return instance
    
    async def delete(self, id: int) -> bool:
        instance = await self.get_by_id(id)
        if instance:
            await self.session.delete(instance)
            await self.session.commit()
            return True
        return False
