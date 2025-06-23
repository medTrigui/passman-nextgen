from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from .user import User
from .password_entry import Password

__all__ = ["Base", "User", "Password"]
