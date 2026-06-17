# app/chat/models.py
import datetime
from sqlalchemy import Boolean, text, ForeignKey, String, Text, UniqueConstraint, Index, BigInteger, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base


class Conversation(Base):
    __tablename__ = "conversations"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    latest_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    latest_message_time: Mapped[datetime.datetime] = mapped_column(
        server_default=text("TIMEZONE('utc', now())"),
        onupdate=text("TIMEZONE('utc', now())")
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=text("TIMEZONE('utc', now())")
    )
    
    __table_args__ = (
        UniqueConstraint('listing_id', 'owner_id', 'buyer_id', name='uq_conversation'),
        Index('idx_conv_owner_time', 'owner_id', 'latest_message_time'),
        Index('idx_conv_buyer_time', 'buyer_id', 'latest_message_time'),
    )


class Message(Base):
    __tablename__ = "messages"
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"))
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=text("TIMEZONE('utc', now())")
    )

    __table_args__ = (
        Index('idx_msg_conversation_time', 'conversation_id', 'created_at'),
        Index('idx_msg_conversation_read', 'conversation_id', 'is_read'),
    )
