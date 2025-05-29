# RSI Admin Portal - Backend (FastAPI)

## Cross-Platform Development & Deployment

This backend supports development on macOS/Linux and deployment on Windows Server 2019.

## Prerequisites

### For macOS Development
1. **Python 3.12** (recommended version)
   - Install via Homebrew: `brew install python@3.12`
   - Or download from https://www.python.org/downloads/
2. **Microsoft ODBC Driver 17 for SQL Server**
   - Install using the provided script: `./install_odbc_mac.sh`
   - Or manually via Homebrew

### For Windows Server 2019 Deployment
1. **Python 3.12** from https://www.python.org/downloads/
   - Download Python 3.12.x (not 3.13 or 3.14)
   - Check "Add Python to PATH" during installation
   - Verify: `python --version`

2. **Microsoft ODBC Driver 17 for SQL Server**
   - Usually pre-installed on Windows Server
   - If not, download from Microsoft

### Development Setup

1. **Create virtual environment:**
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```cmd
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   - Create `.env` file in backend directory:
     ```env
     ENVIRONMENT=dev
     CONNECTION_FILE=../connection.json
     USE_WINDOWS_AUTH=true
     DOMAIN=RSI
     ```
   - Ensure `connection.json` exists with database configurations

4. **Run development server:**
   ```cmd
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Production Deployment on Windows Server 2019

### Option 1: Windows Service (Recommended)

1. **Note: pywin32 is NOT required** - We use standard Python for cross-platform compatibility

2. **Install as Windows Service:**
   ```cmd
   python windows_service.py install
   python windows_service.py start
   ```

3. **Service Management:**
   ```cmd
   # Start service
   net start RSIAdminPortalAPI
   
   # Stop service
   net stop RSIAdminPortalAPI
   
   # Remove service
   python windows_service.py remove
   ```

### Option 2: IIS with wfastcgi

1. **Install wfastcgi:**
   ```cmd
   pip install wfastcgi
   wfastcgi-enable
   ```

2. **Configure IIS:**
   - Create application in IIS Manager
   - Set application pool to "No Managed Code"
   - Copy `web.config` to application root
   - Update paths in web.config for your environment

### Option 3: PM2 (Alternative)

1. **Install Node.js and PM2:**
   ```cmd
   npm install -g pm2
   ```

2. **Create ecosystem file:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'admin-portal-api',
       script: 'uvicorn',
       args: 'app.main:app --host 0.0.0.0 --port 8000',
       interpreter: 'python',
       cwd: './backend',
       env: {
         PYTHONPATH: '.'
       }
     }]
   }
   ```

3. **Start with PM2:**
   ```cmd
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Configuration

### Database Connection (connection.json)
```json
{
  "dev": {
    "server": "localhost\\SQLEXPRESS",
    "database": "AdminPortal",
    "user": "sa",
    "password": "your_password",
    "domain": "RSI",
    "options": {
      "trustServerCertificate": true
    }
  },
  "prod": {
    "server": "prod-sql-server",
    "database": "AdminPortal_Prod",
    "user": "api_user",
    "password": "secure_password",
    "domain": "RSI"
  }
}
```

### Windows Authentication
For cross-domain authentication, ensure:
- Service account has proper SQL Server permissions
- Domain trust relationships are configured
- SQL Server allows Windows Authentication

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## Testing

```cmd
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api.py
```

## Monitoring & Logging

### Logs Location
- **Development**: Console output
- **Production**: `logs/api.log` (with rotation)
- **Windows Service**: Windows Event Log

### Health Check
```cmd
curl http://localhost:8000/
```

## Troubleshooting

### Common Issues

1. **Port 8000 already in use:**
   ```cmd
   netstat -ano | findstr :8000
   taskkill /PID <process_id> /F
   ```

2. **SQL Server connection issues:**
   - Verify SQL Server is running
   - Check firewall settings (port 1433)
   - Test with SQL Server Management Studio

3. **Permission errors:**
   - Run PowerShell as Administrator
   - Check file permissions on application directory

4. **Import errors:**
   ```cmd
   set PYTHONPATH=%CD%
   uvicorn app.main:app
   ```

### Environment Variables
```cmd
# Set environment for session
set ENVIRONMENT=prod
set CONNECTION_FILE=connection.json

# Or use .env file (recommended)
```

## Security Considerations

- Use HTTPS in production (configure reverse proxy)
- Secure `connection.json` with proper file permissions
- Use service accounts with minimal required permissions
- Enable request rate limiting for production
- Configure proper CORS settings

## Performance Tuning

### For Production:
```cmd
# Multiple workers
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000

# With Gunicorn (if available on Windows)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Backup & Maintenance

- Regular database backups
- Log rotation (configured automatically)
- Monitor disk space in logs directory
- Update dependencies regularly: `pip install -r requirements.txt --upgrade`