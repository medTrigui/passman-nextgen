from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PassMan NextGen"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./passman.db"
    
    # JWT
    SECRET_KEY: str = "development-secret-key-change-in-production"  # Change in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:3000",
        "http://0.0.0.0:5173"
    ]
    
    # Security
    ENCRYPTION_KEY: str = "development-encryption-key-change-in-production"  # Change in production!
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
