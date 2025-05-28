from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings
import logging

router = APIRouter(prefix="/environment", tags=["environment"])
logger = logging.getLogger(__name__)


class EnvironmentResponse(BaseModel):
    environment: str


class EnvironmentUpdate(BaseModel):
    environment: str


@router.get("/", response_model=EnvironmentResponse)
async def get_environment():
    """Get current environment"""
    return EnvironmentResponse(environment=settings.environment)


@router.post("/", response_model=EnvironmentResponse)
async def set_environment(env_update: EnvironmentUpdate):
    """Switch to a different environment"""
    valid_environments = ["dev", "int", "test", "prod"]
    
    if env_update.environment not in valid_environments:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid environment. Must be one of: {', '.join(valid_environments)}"
        )
    
    # Update the environment
    settings.environment = env_update.environment
    logger.info(f"Switched environment to: {env_update.environment}")
    
    return EnvironmentResponse(environment=settings.environment)