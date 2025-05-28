from pydantic_settings import BaseSettings
from typing import Dict, Any
import json
import os


class Settings(BaseSettings):
    # Environment management
    environment: str = "dev"
    connection_file: str = "../connection.json"
    
    # Windows Authentication for cross-domain
    use_windows_auth: bool = True
    domain: str = "RSI"
    
    # API Settings
    api_title: str = "RSI Admin Portal API"
    api_version: str = "1.0.0"
    api_prefix: str = "/api"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def get_db_config(self) -> Dict[str, Any]:
        """Get database configuration for current environment"""
        connection_path = os.path.join(os.path.dirname(__file__), "..", self.connection_file)
        
        if not os.path.exists(connection_path):
            raise FileNotFoundError(f"Connection file not found: {connection_path}")
            
        with open(connection_path) as f:
            connections = json.load(f)
            
        if self.environment not in connections:
            raise KeyError(f"Environment '{self.environment}' not found in connection file")
            
        return connections[self.environment]


settings = Settings()