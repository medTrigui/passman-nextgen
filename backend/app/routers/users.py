from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import User
from .auth import get_current_user, pwd_context

router = APIRouter(prefix="/users", tags=["users"])

class UserProfile(BaseModel):
    username: str
    email: EmailStr

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get the current user's profile."""
    return UserProfile(
        username=current_user.username,
        email=current_user.email
    )

@router.put("/me", response_model=UserProfile)
async def update_current_user_profile(
    profile: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the current user's profile."""
    # Check if username or email already exists
    if profile.username or profile.email:
        existing_user = await db.execute(
            select(User).where(
                (User.username == profile.username) | (User.email == profile.email)
            )
        )
        existing_user = existing_user.scalar_one_or_none()
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already taken"
            )

    # Verify current password if updating password
    if profile.new_password:
        if not profile.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to set new password"
            )
        if not pwd_context.verify(profile.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        current_user.hashed_password = pwd_context.hash(profile.new_password)

    # Update fields
    if profile.username:
        current_user.username = profile.username
    if profile.email:
        current_user.email = profile.email

    await db.commit()
    await db.refresh(current_user)

    return UserProfile(
        username=current_user.username,
        email=current_user.email
    )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete the current user's account."""
    await db.delete(current_user)
    await db.commit()
    return None 