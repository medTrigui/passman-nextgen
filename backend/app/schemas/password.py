from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class PasswordBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    username: str = Field(..., min_length=1, max_length=255)
    url: Optional[str] = Field(None, max_length=1024)
    notes: Optional[str] = Field(None, max_length=4096)
    tags: List[str] = Field(default_factory=list)

class PasswordCreate(PasswordBase):
    password: str = Field(..., min_length=1)

class PasswordUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    username: Optional[str] = Field(None, min_length=1, max_length=255)
    password: Optional[str] = Field(None, min_length=1)
    url: Optional[str] = Field(None, max_length=1024)
    notes: Optional[str] = Field(None, max_length=4096)
    tags: Optional[List[str]] = None

class PasswordResponse(PasswordBase):
    id: str
    password: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 