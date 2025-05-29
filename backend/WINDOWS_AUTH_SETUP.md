# Windows Authentication Setup Guide

## Overview

This backend uses **Windows Authentication** (Integrated Security) to connect to SQL Server. This means it uses the credentials of the Windows user running the application, not username/password in the connection string.

## Configuration

### 1. Environment Variables (.env file)

Create or update your `.env` file:
```env
# Enable Windows Authentication
USE_WINDOWS_AUTH=true

# Environment setting
ENVIRONMENT=dev
```

### 2. Connection Configuration (connection.json)

For Windows Authentication, you only need server and database info:

```json
{
  "dev": {
    "server": "your-server,port",
    "database": "your-database",
    "options": {
      "trustServerCertificate": true,
      "encrypt": true
    }
  }
}
```

**Note:** No `user`, `password`, or `domain` fields are needed for Windows Authentication!

## How It Works

1. When `USE_WINDOWS_AUTH=true`, the connection string includes `Trusted_Connection=yes`
2. SQL Server uses the Windows identity of the process running the Python application
3. No passwords are stored or transmitted

## Running the Application

### Development (Your User Account)
```powershell
# The app will connect as your Windows user
.\run_server.ps1
```

### Production (Service Account)
When running as a Windows Service:
1. The service runs under a specific Windows account
2. That account must have SQL Server permissions
3. No password needed in configuration

## SQL Server Permissions

Grant permissions to the Windows account:
```sql
-- For development (your account)
CREATE LOGIN [DOMAIN\YourUsername] FROM WINDOWS;
CREATE USER [DOMAIN\YourUsername] FOR LOGIN [DOMAIN\YourUsername];
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [DOMAIN\YourUsername];

-- For production (service account)
CREATE LOGIN [DOMAIN\ServiceAccount] FROM WINDOWS;
CREATE USER [DOMAIN\ServiceAccount] FOR LOGIN [DOMAIN\ServiceAccount];
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [DOMAIN\ServiceAccount];
```

## Troubleshooting

### Login Failed Error
If you see: `Login failed for user 'DOMAIN\username'`

1. **Check SQL Server Authentication Mode**
   - SQL Server must allow Windows Authentication
   - In SSMS: Server Properties → Security → Windows Authentication mode

2. **Verify User Permissions**
   ```sql
   -- Check if login exists
   SELECT * FROM sys.server_principals WHERE name = 'DOMAIN\username'
   
   -- Check database access
   USE YourDatabase;
   SELECT * FROM sys.database_principals WHERE name = 'DOMAIN\username'
   ```

3. **Test Connection with SSMS**
   - Open SQL Server Management Studio
   - Connect using Windows Authentication
   - If this works, the Python app should work too

### Different User Context
If the app needs to run as a different user:

**Option 1: Run PowerShell as Different User**
```powershell
# Right-click PowerShell → Run as different user
# Enter service account credentials
cd E:\admin-portal\backend
.\run_server.ps1
```

**Option 2: Use runas Command**
```cmd
runas /user:DOMAIN\ServiceAccount "powershell.exe -File E:\admin-portal\backend\run_server.ps1"
```

**Option 3: Windows Service (Production)**
- Configure the service to run as the appropriate account
- No password needed in config files

## Security Benefits

1. **No passwords in configuration files**
2. **No passwords in source control**
3. **Leverages existing Windows security**
4. **Automatic password rotation** (when AD passwords change)
5. **Single Sign-On (SSO)** capability

## Switching to SQL Authentication

If you must use SQL Authentication instead:
1. Set `USE_WINDOWS_AUTH=false` in `.env`
2. Add `user` and `password` to connection.json
3. Ensure SQL Server allows mixed mode authentication