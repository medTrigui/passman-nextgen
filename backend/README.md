# PassMan NextGen Backend

A secure password manager backend built with FastAPI, SQLAlchemy, and SQLite.

## Features

- **Secure Authentication**: JWT-based authentication with password hashing
- **Encrypted Storage**: All passwords are encrypted before storage
- **RESTful API**: Clean and documented API endpoints
- **Database Migrations**: Alembic for database schema management
- **Comprehensive Logging**: Structured logging with rotation
- **Environment Configuration**: Flexible configuration via environment variables

## Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package installer)

### Installation & Setup

1. **Clone and navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Optional: Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**:
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

5. **Start the server**:
   ```bash
   # Simple startup (recommended)
   python start.py
   
   # Or directly with uvicorn
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

The API will be available at `http://localhost:8000` with documentation at `http://localhost:8000/docs`.

## Configuration

Configuration can be done via environment variables or a `.env` file:

### Database
- `DATABASE_URL`: Full database URL (default: auto-generated SQLite path)
- `DATABASE_DIR`: Directory for SQLite database (default: `data`)
- `DATABASE_NAME`: SQLite database filename (default: `passman.db`)

### Server
- `HOST`: Server host (default: `0.0.0.0`)
- `PORT`: Server port (default: `8000`)
- `DEBUG`: Enable debug mode (default: `false`)

### Security
- `SECRET_KEY`: JWT secret key (CHANGE IN PRODUCTION!)
- `ENCRYPTION_KEY`: Encryption key for passwords (CHANGE IN PRODUCTION!)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT expiration time (default: `30`)

### CORS
- `BACKEND_CORS_ORIGINS`: Comma-separated list of allowed origins

### Logging
- `LOG_LEVEL`: Logging level (default: `INFO`)
- `LOG_FILE`: Log file path (default: `passman.log`)

## Development

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

### Development Mode

Enable debug mode for development:
```bash
export DEBUG=true
python start.py
```

This enables:
- Auto-reload on code changes
- Detailed error messages
- API documentation at `/docs`
- Additional debug endpoints

### Testing

Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

Run tests:
```bash
pytest
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Passwords
- `GET /api/v1/passwords/` - List user passwords
- `POST /api/v1/passwords/` - Create new password
- `GET /api/v1/passwords/{id}` - Get specific password
- `PUT /api/v1/passwords/{id}` - Update password
- `DELETE /api/v1/passwords/{id}` - Delete password

### Users
- `GET /api/v1/users/me` - Get current user info
- `PUT /api/v1/users/me` - Update user info

### Health & Info
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /info` - Application information

## File Structure

```
backend/
├── app/
│   ├── core/
│   │   └── config.py          # Configuration management
│   ├── models/
│   │   ├── __init__.py        # Database base model
│   │   ├── user.py           # User model
│   │   └── password_entry.py  # Password model
│   ├── routers/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── passwords.py      # Password management
│   │   ├── users.py          # User management
│   │   └── unsafe.py         # Debug endpoints
│   ├── schemas/
│   │   ├── auth.py           # Authentication schemas
│   │   └── password.py       # Password schemas
│   ├── utils/
│   │   └── crypto.py         # Encryption utilities
│   ├── database.py           # Database configuration
│   └── main.py              # FastAPI application
├── alembic/                  # Database migrations
├── data/                     # SQLite database directory
├── requirements.txt          # Python dependencies
├── requirements-dev.txt      # Development dependencies
├── start.py                 # Startup script
├── .env.example             # Environment configuration template
└── README.md               # This file
```

## Security Notes

⚠️ **Important**: Change the default secret keys before production deployment!

The default configuration includes development keys that should be changed:
- `SECRET_KEY`: Used for JWT token signing
- `ENCRYPTION_KEY`: Used for password encryption

Generate secure keys:
```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Troubleshooting

### Database Issues
- Ensure the `data` directory is writable
- Check database file permissions
- Verify migration status: `alembic current`

### Import Errors
- Verify Python version (3.9+)
- Install dependencies: `pip install -r requirements.txt`
- Check Python path configuration

### Connection Issues
- Verify host/port configuration
- Check firewall settings
- Ensure no port conflicts

## License

This project is licensed under the MIT License. 