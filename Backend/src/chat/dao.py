from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_, func
from typing import List

from src.chat.models import Conversation, Message


class ChatDAO:
    
    @staticmethod
    async def get_or_create_conversation(
        db: AsyncSession,
        listing_id: int,
        owner_id: int,
        buyer_id: int
    ) -> Conversation:
        query = select(Conversation).where(
            and_(
                Conversation.listing_id == listing_id,
                Conversation.owner_id == owner_id,
                Conversation.buyer_id == buyer_id
            )
        )
        result = await db.execute(query)
        conversation = result.scalar_one_or_none()
        
        if conversation:
            return conversation
        
        conversation = Conversation(
            listing_id=listing_id,
            owner_id=owner_id,
            buyer_id=buyer_id
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        return conversation
    
    @staticmethod
    async def get_user_conversations(
        db: AsyncSession,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Conversation]:
        query = (
            select(Conversation)
            .where(
                or_(
                    Conversation.owner_id == user_id,
                    Conversation.buyer_id == user_id
                )
            )
            .order_by(Conversation.latest_message_time.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def check_conversation_access(
        db: AsyncSession,
        conversation_id: int,
        user_id: int
    ) -> bool:
        query = select(Conversation).where(
            and_(
                Conversation.id == conversation_id,
                or_(
                    Conversation.owner_id == user_id,
                    Conversation.buyer_id == user_id
                )
            )
        )
        result = await db.execute(query)
        return result.scalar_one_or_none() is not None
    
    @staticmethod
    async def save_message(
        db: AsyncSession,
        conversation_id: int,
        sender_id: int,
        text: str
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            message=text
        )
        db.add(message)
        
        await db.execute(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(
                latest_message=text,
                latest_message_time=func.now()
            )
        )
        
        await db.commit()
        await db.refresh(message)
        return message
    
    @staticmethod
    async def get_conversation_messages(
        db: AsyncSession,
        conversation_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Message]:
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def mark_messages_as_read(
        db: AsyncSession,
        conversation_id: int,
        user_id: int
    ):
        await db.execute(
            update(Message)
            .where(
                and_(
                    Message.conversation_id == conversation_id,
                    Message.sender_id != user_id,
                    Message.is_read == False
                )
            )
            .values(is_read=True)
        )
        await db.commit()
    
    @staticmethod
    async def get_unread_count(
        db: AsyncSession,
        user_id: int
    ) -> int:
        conversations = await ChatDAO.get_user_conversations(db, user_id)
        conv_ids = [c.id for c in conversations]
        
        if not conv_ids:
            return 0
        
        query = select(func.count()).where(
            and_(
                Message.conversation_id.in_(conv_ids),
                Message.sender_id != user_id,
                Message.is_read == False
            )
        )
        result = await db.execute(query)
        return result.scalar()

    @staticmethod
    async def get_unread_count_for_conversation(
        db: AsyncSession,
        conversation_id: int,
        user_id: int
    ) -> int:
        query = select(func.count()).where(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_read == False
            )
        )
        result = await db.execute(query)
        return result.scalar() or 0