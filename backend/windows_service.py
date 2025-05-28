"""
Windows Service for RSI Admin Portal FastAPI Backend
Run as: python windows_service.py install
Then: net start RSIAdminPortalAPI
"""
import sys
import os
import time
import logging
from pathlib import Path

try:
    import win32serviceutil
    import win32service
    import win32event
    import servicemanager
    import socket
    WINDOWS_SERVICE_AVAILABLE = True
except ImportError:
    WINDOWS_SERVICE_AVAILABLE = False
    print("Warning: pywin32 not available. Windows service functionality disabled.")


class AdminPortalService(win32serviceutil.ServiceFramework):
    """Windows Service for RSI Admin Portal API"""
    
    _svc_name_ = "RSIAdminPortalAPI"
    _svc_display_name_ = "RSI Admin Portal API Service"
    _svc_description_ = "FastAPI backend service for RSI Admin Portal user management system"
    
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        self.is_alive = True
        
        # Set up logging
        self.setup_logging()
        
    def setup_logging(self):
        """Configure logging for the service"""
        log_path = Path(__file__).parent / "logs"
        log_path.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_path / "service.log"),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def SvcStop(self):
        """Stop the service"""
        self.logger.info("Stopping RSI Admin Portal API Service...")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_alive = False
    
    def SvcDoRun(self):
        """Run the service"""
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_, '')
        )
        self.logger.info("Starting RSI Admin Portal API Service...")
        self.main()
    
    def main(self):
        """Main service logic"""
        try:
            # Change to the script directory
            script_dir = Path(__file__).parent
            os.chdir(script_dir)
            
            # Set PYTHONPATH
            if str(script_dir) not in sys.path:
                sys.path.insert(0, str(script_dir))
            
            # Import and run the FastAPI app
            import uvicorn
            from app.main import app
            
            self.logger.info("Starting FastAPI server...")
            
            # Configure uvicorn for production
            config = uvicorn.Config(
                app,
                host="0.0.0.0",
                port=8000,
                log_level="info",
                access_log=True,
                loop="asyncio"
            )
            
            server = uvicorn.Server(config)
            
            # Run the server
            server.run()
            
        except Exception as e:
            self.logger.error(f"Error in service main: {e}")
            servicemanager.LogErrorMsg(f"RSI Admin Portal API Service error: {e}")
        
        # Service cleanup
        self.logger.info("RSI Admin Portal API Service stopped")


def install_service():
    """Install the Windows service"""
    if not WINDOWS_SERVICE_AVAILABLE:
        print("Error: pywin32 not available. Cannot install Windows service.")
        print("Install with: pip install pywin32")
        return False
    
    try:
        win32serviceutil.InstallService(
            AdminPortalService._svc_name_,
            AdminPortalService._svc_display_name_,
            startType=win32service.SERVICE_AUTO_START,
            description=AdminPortalService._svc_description_
        )
        print(f"Service '{AdminPortalService._svc_display_name_}' installed successfully")
        print("Start with: net start RSIAdminPortalAPI")
        return True
    except Exception as e:
        print(f"Failed to install service: {e}")
        return False


def remove_service():
    """Remove the Windows service"""
    if not WINDOWS_SERVICE_AVAILABLE:
        print("Error: pywin32 not available.")
        return False
    
    try:
        win32serviceutil.RemoveService(AdminPortalService._svc_name_)
        print(f"Service '{AdminPortalService._svc_display_name_}' removed successfully")
        return True
    except Exception as e:
        print(f"Failed to remove service: {e}")
        return False


def start_service():
    """Start the Windows service"""
    if not WINDOWS_SERVICE_AVAILABLE:
        print("Error: pywin32 not available.")
        return False
    
    try:
        win32serviceutil.StartService(AdminPortalService._svc_name_)
        print(f"Service '{AdminPortalService._svc_display_name_}' started successfully")
        return True
    except Exception as e:
        print(f"Failed to start service: {e}")
        return False


def stop_service():
    """Stop the Windows service"""
    if not WINDOWS_SERVICE_AVAILABLE:
        print("Error: pywin32 not available.")
        return False
    
    try:
        win32serviceutil.StopService(AdminPortalService._svc_name_)
        print(f"Service '{AdminPortalService._svc_display_name_}' stopped successfully")
        return True
    except Exception as e:
        print(f"Failed to stop service: {e}")
        return False


def main():
    """Main entry point for command line usage"""
    if len(sys.argv) == 1:
        # No arguments - try to run as service
        if WINDOWS_SERVICE_AVAILABLE:
            servicemanager.Initialize()
            servicemanager.PrepareToHostSingle(AdminPortalService)
            servicemanager.StartServiceCtrlDispatcher()
        else:
            print("Usage: python windows_service.py [install|remove|start|stop]")
            print("Note: pywin32 required for Windows service functionality")
    else:
        command = sys.argv[1].lower()
        
        if command == 'install':
            install_service()
        elif command == 'remove':
            remove_service()
        elif command == 'start':
            start_service()
        elif command == 'stop':
            stop_service()
        elif command == 'debug':
            # Run in debug mode (not as service)
            print("Running in debug mode...")
            service = AdminPortalService([])
            service.main()
        else:
            print("Usage: python windows_service.py [install|remove|start|stop|debug]")


if __name__ == '__main__':
    main()