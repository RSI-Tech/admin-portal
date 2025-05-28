from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import settings
from app.api import users, profiles, environment
from app.core.logging import setup_logging

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    openapi_url=f"{settings.api_prefix}/openapi.json",
    docs_url=f"{settings.api_prefix}/docs",
    redoc_url=f"{settings.api_prefix}/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(profiles.router, prefix=settings.api_prefix)
app.include_router(environment.router, prefix=settings.api_prefix)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "RSI Admin Portal API",
        "version": settings.api_version,
        "environment": settings.environment
    }

@app.on_event("startup")
async def startup_event():
    """Initialize app on startup"""
    logger.info(f"Starting {settings.api_title} v{settings.api_version}")
    logger.info(f"Environment: {settings.environment}")
    
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down application")