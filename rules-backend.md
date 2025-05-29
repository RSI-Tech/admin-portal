---
description: Rules for working with the FastAPI backend in the /backend folder
globs: backend/**/*.py
alwaysApply: true
---
This project should use modern, concise, and best practices for building Python 3.12 applications with FastAPI and SQL Server.

# Primary Libraries

- Python 3.12 (required version for stability and compatibility)
- FastAPI 0.104.1
- Pydantic 2.5.0 with pydantic-settings 2.1.0
- pyodbc 5.0.1 (for cross-platform SQL Server connectivity)
- uvicorn 0.24.0 with standard extras
- pytest 7.4.3 for testing

# Database

- SQL Server 2019 via pyodbc
- Multi-environment support (dev, int, test, prod)
- Windows Authentication support
- Connection configuration via connection.json

# Project Structure

```
backend/
├── app/
│   ├── api/         # API endpoints
│   ├── core/        # Core configuration
│   ├── schemas/     # Pydantic models
│   ├── config.py    # Settings management
│   ├── database.py  # Database connection
│   └── main.py      # FastAPI app
├── tests/           # Test files
├── logs/            # Application logs
└── requirements.txt # Dependencies
```

# Rules

## General
- Use Python 3.12 specifically (not 3.13 or 3.14) for compatibility
- Use lowercase with underscores for directories and files (e.g., api/user_routes.py)
- Prefer async functions for all I/O operations
- Use type hints for all function signatures
- Handle exceptions properly with try/except blocks
- Log errors appropriately using Python's logging module

## FastAPI Best Practices
- Use dependency injection for database connections
- Implement proper request/response models with Pydantic
- Use appropriate HTTP status codes
- Include comprehensive API documentation
- Use routers to organize endpoints
- Implement proper CORS configuration for production

## Database
- Use pyodbc for SQL Server connectivity (cross-platform)
- Use parameterized queries with ? placeholders (not %s)
- Convert pyodbc rows to dictionaries using row_to_dict helper
- Implement connection pooling for production
- Handle transactions properly with commit/rollback
- Never hardcode credentials - use connection.json

## Pydantic Models
- Use Pydantic v2 models for input validation and response schemas
- Define clear field types and constraints
- Use Field() for additional validation
- Implement proper serialization for datetime fields
- Create separate models for Create, Update, and Response operations

## Error Handling
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors with context
- Don't expose internal implementation details
- Use HTTPException from FastAPI

## Testing
- Write unit tests for all endpoints
- Use pytest fixtures for test data
- Mock database connections in tests
- Test both success and error cases
- Maintain test coverage above 80%

## Security
- Validate all inputs with Pydantic
- Use parameterized queries to prevent SQL injection
- Implement proper authentication (future)
- Don't log sensitive information
- Secure connection.json with proper file permissions

## Code Style
- Follow PEP 8 guidelines
- Use meaningful variable and function names
- Add docstrings to all functions and classes
- Keep functions focused and single-purpose
- Maximum line length of 100 characters

## Deployment
- Support development on macOS/Linux
- Deploy to Windows Server 2019
- Use virtual environments
- Document all dependencies in requirements.txt
- Provide clear deployment instructions