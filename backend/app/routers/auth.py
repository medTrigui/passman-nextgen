from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from sqlalchemy import select, or_
import logging
from sqlalchemy.exc import SQLAlchemyError

from ..core.config import settings
from ..database import get_db
from ..models import User
from ..schemas.auth import Token, UserCreate, UserResponse

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/register", response_model=UserResponse)
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    Args:
        request: FastAPI request object for logging
        user_data: User registration data
        db: Database session
    """
    try:
        logger.info(f"Starting registration process for username: {user_data.username}")
        
        # Log request details for debugging
        logger.debug(f"Registration request from IP: {request.client.host}")
        logger.debug(f"Registration data - Username: {user_data.username}, Email: {user_data.email}")
        
        # Check if user exists
        query = select(User).where(
            or_(User.username == user_data.username, User.email == user_data.email)
        )
        logger.debug(f"Executing user existence check query: {query}")
        
        existing_user = await db.execute(query)
        existing_user = existing_user.scalar_one_or_none()
        
        if existing_user:
            logger.warning(f"Registration failed: User already exists - Username: {user_data.username}")
            # Check which field conflicts
            if existing_user.username == user_data.username:
                detail = "Username already registered"
            elif existing_user.email == user_data.email:
                detail = "Email already registered"
            else:
                detail = "Username or email already registered"
                
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail
            )
        
        # Create new user
        logger.debug("Creating new user record")
        try:
            hashed_password = pwd_context.hash(user_data.password)
        except Exception as e:
            logger.error(f"Password hashing failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing password"
            )
        
        db_user = User(
            id=str(uuid4()),
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        try:
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)
            logger.info(f"Successfully registered new user: {user_data.username}")
        except SQLAlchemyError as e:
            logger.error(f"Database error during user creation: {str(e)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error occurred during registration"
            )
        
        return UserResponse.model_validate(db_user)
        
    except HTTPException:
        # Re-raise HTTP exceptions as they're already properly formatted
        raise
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    """
    Login user and return access token.
    
    Args:
        request: FastAPI request object for logging
        form_data: OAuth2 form data with username and password
        db: Database session
    """
    try:
        logger.info(f"Login attempt for username: {form_data.username}")
        logger.debug(f"Login request from IP: {request.client.host}")
        
        # Authenticate user
        user = await db.execute(
            select(User).where(User.username == form_data.username)
        )
        user = user.scalar_one_or_none()
        
        if not user:
            logger.warning(f"Login failed: User not found - {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not pwd_context.verify(form_data.password, user.hashed_password):
            logger.warning(f"Login failed: Invalid password for user - {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token({"sub": user.id})
        logger.info(f"Login successful for user: {form_data.username}")
        return Token(access_token=access_token, token_type="bearer")
        
    except HTTPException:
        # Re-raise HTTP exceptions as they're already properly formatted
        raise
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        ) 