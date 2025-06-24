from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from ..core.config import settings
from ..database import get_db
from ..models import User, Password
from ..schemas.password import PasswordCreate, PasswordResponse, PasswordUpdate
from ..utils.crypto import encrypt_password, decrypt_password
from .auth import get_current_user

router = APIRouter(prefix="/passwords", tags=["passwords"])

@router.post("", response_model=PasswordResponse)
async def create_password(
    password_data: PasswordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Encrypt the password
    encrypted_password, iv = encrypt_password(
        password_data.password,
        settings.ENCRYPTION_KEY
    )
    
    # Create password entry
    db_password = Password(
        id=str(uuid4()),
        user_id=current_user.id,
        title=password_data.title,
        username=password_data.username,
        encrypted_password=encrypted_password,
        url=password_data.url,
        notes=password_data.notes,
        tags=password_data.tags,
        iv=iv
    )
    
    db.add(db_password)
    await db.commit()
    await db.refresh(db_password)
    
    # Return response with decrypted password
    response = PasswordResponse.model_validate(db_password)
    response.password = password_data.password
    return response

@router.get("", response_model=List[PasswordResponse])
async def get_passwords(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Password).where(Password.user_id == current_user.id)
    )
    passwords = result.scalars().all()
    
    # Decrypt passwords for response
    responses = []
    for password in passwords:
        response = PasswordResponse.model_validate(password)
        response.password = decrypt_password(
            password.encrypted_password,
            password.iv,
            settings.ENCRYPTION_KEY
        )
        responses.append(response)
    
    return responses

@router.get("/{password_id}", response_model=PasswordResponse)
async def get_password(
    password_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    password = await db.get(Password, password_id)
    if not password or password.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password not found"
        )
    
    # Decrypt password for response
    response = PasswordResponse.model_validate(password)
    response.password = decrypt_password(
        password.encrypted_password,
        password.iv,
        settings.ENCRYPTION_KEY
    )
    return response

@router.put("/{password_id}", response_model=PasswordResponse)
async def update_password(
    password_id: str,
    password_data: PasswordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    password = await db.get(Password, password_id)
    if not password or password.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password not found"
        )
    
    # Update fields
    if password_data.title is not None:
        password.title = password_data.title
    if password_data.username is not None:
        password.username = password_data.username
    if password_data.password is not None:
        encrypted_password, iv = encrypt_password(
            password_data.password,
            settings.ENCRYPTION_KEY
        )
        password.encrypted_password = encrypted_password
        password.iv = iv
    if password_data.url is not None:
        password.url = password_data.url
    if password_data.notes is not None:
        password.notes = password_data.notes
    if password_data.tags is not None:
        password.tags = password_data.tags
    
    await db.commit()
    await db.refresh(password)
    
    # Return response with decrypted password
    response = PasswordResponse.model_validate(password)
    response.password = decrypt_password(
        password.encrypted_password,
        password.iv,
        settings.ENCRYPTION_KEY
    )
    return response

@router.delete("/{password_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_password(
    password_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    password = await db.get(Password, password_id)
    if not password or password.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Password not found"
        )
    
    await db.delete(password)
    await db.commit() 