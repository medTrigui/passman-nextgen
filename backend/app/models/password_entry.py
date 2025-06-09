import uuid, datetime as dt
from sqlalchemy import String, LargeBinary, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from . import Base


class PasswordEntry(Base):
    __tablename__ = "password_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    site: Mapped[str] = mapped_column(String(255), index=True)
    enc_password: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime, default=dt.datetime.utcnow
    )

