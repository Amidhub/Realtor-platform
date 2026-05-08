import datetime
import enum
from typing import Annotated

from src.database import Base
from sqlalchemy import JSON, text, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column


created_at = Annotated[datetime.datetime, mapped_column(
        server_default=text("TIMEZONE('utc', now())")
    )]
updated_at = Annotated[datetime.datetime, mapped_column(
        server_default=text("TIMEZONE('utc', now())"),
        onupdate=datetime.datetime.utcnow,
    )]
intpk = Annotated[int, mapped_column(primary_key=True)]
str256 = Annotated[str, mapped_column(String(256))]

class Type(enum.Enum):
    sale = "sale"
    rent = "rent"

class Status(enum.Enum):
    draft = "draft"
    moderation = "moderation"
    active = "active"
    rejected = "rejected"
    
class Listing(Base):
    __tablename__ = "listings"
    
    id: Mapped[intpk]
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[Type] = mapped_column(String(20), nullable=False)
    title: Mapped[str256] = mapped_column(nullable=False)
    description: Mapped[str]
    price: Mapped[int] = mapped_column(nullable=False)
    rooms: Mapped[int] = mapped_column(nullable=False)
    area: Mapped[int]
    address: Mapped[str256]
    status: Mapped[Status] = mapped_column(String(20), default="draft")
    photos: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=True)
    created_at: Mapped[created_at]
    updated_at: Mapped[updated_at]
