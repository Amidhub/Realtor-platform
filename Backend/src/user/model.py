import datetime
import enum
from typing import Annotated

from src.database import Base
from sqlalchemy import Boolean, Integer, JSON, Column, String, text
from sqlalchemy.orm import Mapped, mapped_column


created_at = Annotated[datetime.datetime, mapped_column(
        server_default=text("TIMEZONE('utc', now())")
    )]
intpk = Annotated[int, mapped_column(primary_key=True)]
str512 = Annotated[str, mapped_column(String(512))]

class Role(enum.Enum):
    user = "user"
    moderator = "moderator"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[intpk]
    email: Mapped[str] = mapped_column(nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    refresh_token: Mapped[str512] = mapped_column(nullable=True)
    role: Mapped[Role] = mapped_column(String(20), default="user")
    created_at: Mapped[created_at]
    
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_date: Mapped[created_at] = mapped_column(nullable=True)
    consent_version: Mapped[str] = mapped_column(String(20), nullable=True)