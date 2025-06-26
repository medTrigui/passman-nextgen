import uuid, datetime as dt
from typing import List
from sqlalchemy import String, LargeBinary, DateTime, ForeignKey, JSON
from sqlalchemy.orm import mapped_column, Mapped
from . import Base


class Password(Base):
    __tablename__ = "passwords"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    username: Mapped[str] = mapped_column(String(255))
    encrypted_password: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=True)
    notes: Mapped[str] = mapped_column(String(4096), nullable=True)
    tags: Mapped[List[str]] = mapped_column(JSON, nullable=True, default=list)
    iv: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime, default=dt.datetime.utcnow
    )

