import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from fastapi import HTTPException, status

from .core.config import settings
from .models import Base, User, Password  # Import models to register them

# Configure logging
logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database manager for handling connections and sessions."""
    
    def __init__(self):
        self.engine = None
        self.async_session = None
        self._initialized = False
    
    def initialize(self):
        """Initialize the database engine and session factory."""
        if self._initialized:
            return
        
        logger.info(f"Initializing database with URL: {settings.DATABASE_URL}")
        
        # Create async engine with proper SQLite configuration
        self.engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            # SQLite specific settings
            connect_args={
                "check_same_thread": False,
                "timeout": 20,
            } if "sqlite" in settings.DATABASE_URL else {},
            # Connection pool settings
            pool_size=5 if "sqlite" not in settings.DATABASE_URL else 1,
            max_overflow=10 if "sqlite" not in settings.DATABASE_URL else 0,
        )
        
        # Create async session factory
        self.async_session = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=True,
            autocommit=False
        )
        
        self._initialized = True
        logger.info("Database engine initialized successfully")
    
    async def create_tables(self):
        """Create all database tables."""
        if not self._initialized:
            self.initialize()
        
        try:
            async with self.engine.begin() as conn:
                # Create all tables
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            raise
    
    async def verify_connection(self):
        """Verify database connection."""
        if not self._initialized:
            self.initialize()
        
        try:
            async with self.engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database connection verified successfully")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    async def close(self):
        """Close database connections."""
        if self.engine:
            await self.engine.dispose()
            logger.info("Database connections closed")


# Global database manager instance
db_manager = DatabaseManager()

async def init_db():
    """Initialize database and create tables."""
    try:
        db_manager.initialize()
        await db_manager.verify_connection()
        await db_manager.create_tables()
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    if not db_manager._initialized:
        db_manager.initialize()
    
    async with db_manager.async_session() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"Database error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database operation failed"
            )
        except Exception as e:
            await session.rollback()
            logger.error(f"Unexpected error in database session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred"
            )
        finally:
            await session.close()

async def close_db():
    """Close database connections."""
    await db_manager.close()
