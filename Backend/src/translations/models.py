import datetime
from typing import Annotated
from src.database import Base
from sqlalchemy import String, text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

created_at = Annotated[datetime.datetime, mapped_column(
    server_default=text("TIMEZONE('utc', now())")
)]
updated_at = Annotated[datetime.datetime, mapped_column(
    server_default=text("TIMEZONE('utc', now())"),
    onupdate=datetime.datetime.utcnow
)]
intpk = Annotated[int, mapped_column(primary_key=True)]
str256 = Annotated[str, mapped_column(String(256))]
str10 = Annotated[str, mapped_column(String(10))]
str1000 = Annotated[str, mapped_column(String(100))]

class Translation(Base):
    __tablename__ = "translations"

    id: Mapped[intpk]
    key: Mapped[str256] = mapped_column(nullable=False, index=True)
    locale: Mapped[str10] = mapped_column(nullable=False, index=True)
    value: Mapped[str1000] = mapped_column(nullable=False)
    created_at: Mapped[created_at]
    updated_at: Mapped[updated_at]

    __table_args__ = (
        UniqueConstraint('key', 'locale', name='uq_translations_key_locale'),
    )