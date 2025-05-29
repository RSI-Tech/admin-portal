from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.config import settings
import logging
import json
import os

router = APIRouter(prefix="/environment", tags=["environment"])
logger = logging.getLogger(__name__)


def get_available_environments() -> Dict[str, Dict]:
    """Get all available environments from connection.json"""
    connection_path = os.path.join(os.path.dirname(__file__), "..", "..", settings.connection_file)
    
    if not os.path.exists(connection_path):
        raise FileNotFoundError(f"Connection file not found: {connection_path}")
        
    with open(connection_path) as f:
        connections = json.load(f)
        
    return connections


def get_environment_display_name(env_key: str) -> str:
    """Convert environment key to display name"""
    name_map = {
        "dev": "Development",
        "int": "Integration", 
        "test": "Test",
        "prod": "Production",
        "sbx": "Sandbox"
    }
    return name_map.get(env_key, env_key.title())


class EnvironmentResponse(BaseModel):
    environment: str


class EnvironmentUpdate(BaseModel):
    environment: str


class EnvironmentInfo(BaseModel):
    key: str
    name: str
    server: str
    database: str


class EnvironmentsListResponse(BaseModel):
    environments: List[EnvironmentInfo]


@router.get("/", response_model=EnvironmentResponse)
async def get_environment():
    """Get current environment"""
    return EnvironmentResponse(environment=settings.environment)


@router.get("/list", response_model=EnvironmentsListResponse)
async def get_environments():
    """Get all available environments from connection.json"""
    try:
        connections = get_available_environments()
        
        environments = []
        for env_key, env_config in connections.items():
            environments.append(EnvironmentInfo(
                key=env_key,
                name=get_environment_display_name(env_key),
                server=env_config.get("server", ""),
                database=env_config.get("database", "")
            ))
        
        return EnvironmentsListResponse(environments=environments)
        
    except FileNotFoundError as e:
        logger.error(f"Connection file not found: {e}")
        raise HTTPException(status_code=500, detail="Connection configuration not found")
    except json.JSONDecodeError as e:
        logger.error(f"Invalid connection file format: {e}")
        raise HTTPException(status_code=500, detail="Invalid connection configuration format")
    except Exception as e:
        logger.error(f"Error reading environments: {e}")
        raise HTTPException(status_code=500, detail="Error reading environment configuration")


@router.post("/", response_model=EnvironmentResponse)
async def set_environment(env_update: EnvironmentUpdate):
    """Switch to a different environment"""
    try:
        # Get available environments dynamically
        connections = get_available_environments()
        valid_environments = list(connections.keys())
        
        if env_update.environment not in valid_environments:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid environment. Must be one of: {', '.join(valid_environments)}"
            )
        
        # Update the environment
        settings.environment = env_update.environment
        logger.info(f"Switched environment to: {env_update.environment}")
        
        return EnvironmentResponse(environment=settings.environment)
        
    except FileNotFoundError as e:
        logger.error(f"Connection file not found: {e}")
        raise HTTPException(status_code=500, detail="Connection configuration not found")
    except json.JSONDecodeError as e:
        logger.error(f"Invalid connection file format: {e}")
        raise HTTPException(status_code=500, detail="Invalid connection configuration format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error switching environment: {e}")
        raise HTTPException(status_code=500, detail="Error switching environment")