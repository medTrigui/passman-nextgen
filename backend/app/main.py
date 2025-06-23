from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routers import auth, passwords

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(passwords.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to PassMan NextGen API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

