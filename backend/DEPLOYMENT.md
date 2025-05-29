# Cross-Platform Deployment Guide

This guide explains how to develop the Admin Portal backend on macOS and deploy it to Windows Server 2019.

## Development on macOS

### 1. Install ODBC Drivers

```bash
# Run the provided installation script
./install_odbc_mac.sh

# Verify installation
python test_pyodbc.py
```

If the script fails, install manually:
```bash
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew update
ACCEPT_EULA=Y brew install msodbcsql17
```

### 2. Configure Database Connection

Create `connection.json` with your SQL Server details:
```json
{
  "dev": {
    "server": "your-sql-server.domain.com",
    "database": "AdminPortal_Dev",
    "user": "your_username",
    "password": "your_password",
    "options": {
      "trustServerCertificate": true
    }
  }
}
```

### 3. Development Workflow

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
```

## Deployment to Windows Server 2019

### 1. Prepare the Code

On your Mac:
```bash
# Ensure all changes are committed
git add .
git commit -m "Update backend for deployment"
git push origin main
```

### 2. On Windows Server

1. **Clone/Pull the repository:**
   ```powershell
   git clone git@github.com:RSI-Tech/admin-portal.git
   # or if already cloned
   cd admin-portal
   git pull origin main
   ```

2. **Navigate to backend:**
   ```powershell
   cd backend
   ```

3. **Create virtual environment:**
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Configure production settings:**
   - Copy your production `connection.json`
   - Create `.env` file:
     ```env
     ENVIRONMENT=prod
     USE_WINDOWS_AUTH=true
     DOMAIN=RSI
     ```

### 3. Running the Backend

#### For Testing:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### For Production (using NSSM):

1. **Download NSSM** (Non-Sucking Service Manager):
   - Download from https://nssm.cc/download
   - Extract to a folder (e.g., `C:\nssm`)

2. **Install as Windows Service:**
   ```powershell
   # Navigate to NSSM directory
   cd C:\nssm\win64

   # Install the service
   .\nssm install RSIAdminPortalAPI "C:\path\to\python.exe" "-m uvicorn app.main:app --host 0.0.0.0 --port 8000"

   # Set the working directory
   .\nssm set RSIAdminPortalAPI AppDirectory "C:\path\to\admin-portal\backend"

   # Set environment variables
   .\nssm set RSIAdminPortalAPI AppEnvironmentExtra "PYTHONPATH=C:\path\to\admin-portal\backend"

   # Start the service
   .\nssm start RSIAdminPortalAPI
   ```

3. **Manage the service:**
   ```powershell
   # Check status
   .\nssm status RSIAdminPortalAPI

   # Stop service
   .\nssm stop RSIAdminPortalAPI

   # Remove service
   .\nssm remove RSIAdminPortalAPI confirm
   ```

#### Alternative: Using Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: "When the computer starts"
4. Set action: Start a program
5. Program: `C:\path\to\python.exe`
6. Arguments: `-m uvicorn app.main:app --host 0.0.0.0 --port 8000`
7. Start in: `C:\path\to\admin-portal\backend`

## Troubleshooting

### ODBC Driver Issues

**On macOS:**
- Ensure you have the correct architecture (ARM64 for M1/M2 Macs)
- Check driver list: `odbcinst -q -d`

**On Windows:**
- ODBC Driver 17 is usually pre-installed
- Check in ODBC Data Source Administrator (64-bit)

### Connection Issues

1. **Test connection from command line:**
   ```python
   import pyodbc
   conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=server;DATABASE=db;UID=user;PWD=pass"
   conn = pyodbc.connect(conn_str)
   print("Connected!")
   ```

2. **Common fixes:**
   - Enable TCP/IP in SQL Server Configuration Manager
   - Allow SQL Server port (1433) in Windows Firewall
   - Enable Mixed Mode Authentication if using SQL auth

### Permission Issues

For Windows Authentication across domains:
1. Ensure service account has SQL Server access
2. Configure domain trust relationships
3. Use fully qualified domain names in connection string

## Best Practices

1. **Version Control:**
   - Always test on development before deploying
   - Tag releases: `git tag v1.0.0`

2. **Configuration:**
   - Never commit `connection.json` or `.env` files
   - Use different credentials for each environment

3. **Monitoring:**
   - Check Windows Event Viewer for service logs
   - Monitor `logs/` directory for application logs

4. **Updates:**
   - Stop the service before updating
   - Back up database before major updates
   - Test rollback procedures

## Quick Reference

### Development (macOS)
```bash
cd admin-portal/backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Production (Windows)
```powershell
cd C:\admin-portal\backend
venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Service Commands (Windows)
```powershell
# Using Windows Services
net start RSIAdminPortalAPI
net stop RSIAdminPortalAPI

# Using NSSM
nssm start RSIAdminPortalAPI
nssm stop RSIAdminPortalAPI
nssm restart RSIAdminPortalAPI
```