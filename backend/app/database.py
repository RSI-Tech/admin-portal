import pymssql
from contextlib import contextmanager
from typing import Generator, Dict, Any
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Manages database connections with environment switching support"""
    
    def __init__(self):
        self._connection_cache = {}
        
    def _create_connection(self, config: Dict[str, Any]) -> pymssql.Connection:
        """Create a new database connection"""
        connection_params = {
            "server": config["server"],
            "database": config["database"],
            "charset": "utf8",
            "as_dict": True,
            "autocommit": False
        }
        
        if settings.use_windows_auth:
            # Cross-domain Windows Authentication
            if "domain" in config and config["domain"]:
                connection_params["user"] = f"{config['domain']}\\{config['user']}"
            else:
                connection_params["user"] = f"{settings.domain}\\{config['user']}"
            connection_params["password"] = config["password"]
        else:
            # SQL Server Authentication
            connection_params["user"] = config["user"]
            connection_params["password"] = config["password"]
        
        # Add optional parameters
        if "options" in config:
            if "trustServerCertificate" in config["options"]:
                connection_params["tds_version"] = "7.4"
                
        logger.info(f"Connecting to database: {config['server']}/{config['database']}")
        return pymssql.connect(**connection_params)
    
    @contextmanager
    def get_db(self) -> Generator[pymssql.Connection, None, None]:
        """Get database connection context manager"""
        config = settings.get_db_config()
        conn = None
        
        try:
            conn = self._create_connection(config)
            yield conn
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {str(e)}")
            raise
        finally:
            if conn:
                conn.close()
                
    @contextmanager
    def transaction(self) -> Generator[pymssql.Connection, None, None]:
        """Get database connection with explicit transaction management"""
        with self.get_db() as conn:
            try:
                yield conn
                conn.commit()
            except Exception:
                conn.rollback()
                raise


# Global database instance
db = DatabaseConnection()


def get_db():
    """Dependency for FastAPI routes"""
    with db.get_db() as conn:
        yield conn