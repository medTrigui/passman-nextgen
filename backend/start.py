#!/usr/bin/env python3
"""
Startup script for PassMan NextGen backend.
This script replaces the need for Poetry to run the application.
"""

import sys
import os
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 9):
        print("Error: Python 3.9 or higher is required.")
        sys.exit(1)

def install_dependencies():
    """Install required dependencies if they're missing."""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print("Error: requirements.txt not found!")
        sys.exit(1)
    
    print("Installing dependencies...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        sys.exit(1)

def check_dependencies():
    """Check if required dependencies are installed."""
    required_modules = ["fastapi", "uvicorn", "sqlalchemy", "pydantic", "pydantic_settings"]
    missing_modules = []
    
    for module in required_modules:
        try:
            __import__(module)
        except ImportError:
            missing_modules.append(module)
    
    if missing_modules:
        print(f"Missing required modules: {', '.join(missing_modules)}")
        print("Installing dependencies...")
        install_dependencies()

def main():
    """Main entry point."""
    print("PassMan NextGen Backend Startup")
    print("=" * 40)
    
    # Check Python version
    check_python_version()
    
    # Check and install dependencies if needed
    check_dependencies()
    
    # Now import and run the application
    try:
        import uvicorn
        from app.core.config import settings
        
        print(f"\nStarting {settings.PROJECT_NAME} v{settings.VERSION}")
        print(f"Server will run on http://{settings.HOST}:{settings.PORT}")
        print(f"Debug mode: {settings.DEBUG}")
        print(f"Environment: {'Development' if settings.is_development else 'Production'}")
        
        if settings.DEBUG:
            print(f"API documentation: http://{settings.HOST}:{settings.PORT}/docs")
        
        print("-" * 50)
        
        # Run the server
        uvicorn.run(
            "app.main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            workers=settings.WORKERS if not settings.DEBUG else 1,
            log_level=settings.LOG_LEVEL.lower(),
            access_log=True,
        )
        
    except ImportError as e:
        print(f"Error importing required modules: {e}")
        print("Dependencies may not be properly installed.")
        print("Try running: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting the application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 