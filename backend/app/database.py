import pyodbc
from contextlib import contextmanager
from typing import Generator, Dict, Any, Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Manages database connections with environment switching support"""
    
    def __init__(self):
        self._connection_cache = {}
        self._driver_name = self._detect_sql_driver()
        
    def _detect_sql_driver(self) -> Optional[str]:
        """Detect available SQL Server ODBC driver"""
        drivers = pyodbc.drivers()
        
        # Preferred drivers in order
        preferred_drivers = [
            "ODBC Driver 18 for SQL Server",
            "ODBC Driver 17 for SQL Server",
            "ODBC Driver 13 for SQL Server",
            "SQL Server Native Client 11.0",
            "SQL Server"
        ]
        
        for driver in preferred_drivers:
            if driver in drivers:
                logger.info(f"Using ODBC driver: {driver}")
                return driver
                
        # If no preferred driver found, try any SQL Server driver
        for driver in drivers:
            if "SQL Server" in driver:
                logger.warning(f"Using fallback driver: {driver}")
                return driver
                
        logger.error("No SQL Server ODBC driver found!")
        logger.error(f"Available drivers: {drivers}")
        return None
        
    def _create_connection_string(self, config: Dict[str, Any]) -> str:
        """Create ODBC connection string"""
        if not self._driver_name:
            raise RuntimeError("No SQL Server ODBC driver found. Please install ODBC Driver 17 for SQL Server.")
            
        # Base connection parameters
        conn_str_parts = [
            f"DRIVER={{{self._driver_name}}}",
            f"SERVER={config['server']}",
            f"DATABASE={config['database']}"
        ]
        
        # Authentication
        if settings.use_windows_auth:
            # Windows Authentication
            if "domain" in config and config["domain"]:
                conn_str_parts.append(f"UID={config['domain']}\\{config['user']}")
            else:
                conn_str_parts.append(f"UID={settings.domain}\\{config['user']}")
            conn_str_parts.append(f"PWD={config['password']}")
        else:
            # SQL Server Authentication
            conn_str_parts.append(f"UID={config['user']}")
            conn_str_parts.append(f"PWD={config['password']}")
        
        # Additional options
        if "options" in config:
            if config["options"].get("trustServerCertificate", False):
                conn_str_parts.append("TrustServerCertificate=yes")
            if config["options"].get("encrypt", False):
                conn_str_parts.append("Encrypt=yes")
                
        return ";".join(conn_str_parts)
        
    def _create_connection(self, config: Dict[str, Any]) -> pyodbc.Connection:
        """Create a new database connection"""
        connection_string = self._create_connection_string(config)
        
        logger.info(f"Connecting to database: {config['server']}/{config['database']}")
        logger.debug(f"Using driver: {self._driver_name}")
        
        try:
            # Create connection with row factory for dict-like access
            conn = pyodbc.connect(connection_string, timeout=30)
            
            # Configure connection for better compatibility
            conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
            conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
            conn.setencoding(encoding='utf-8')
            
            return conn
        except pyodbc.Error as e:
            logger.error(f"Failed to connect: {e}")
            if "IM002" in str(e):
                logger.error("ODBC Driver not found. Please install 'ODBC Driver 17 for SQL Server'")
                logger.error("Download from: https://go.microsoft.com/fwlink/?linkid=2249004")
            raise
    
    @contextmanager
    def get_db(self) -> Generator[pyodbc.Connection, None, None]:
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
    def transaction(self) -> Generator[pyodbc.Connection, None, None]:
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


def row_to_dict(cursor, row):
    """Convert pyodbc row to dictionary"""
    if row is None:
        return None
    columns = [column[0] for column in cursor.description]
    return dict(zip(columns, row))