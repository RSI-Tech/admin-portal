# IIS Sub-Application Deployment Guide - Windows Server 2019

This guide provides step-by-step instructions for deploying the Admin Portal (FastAPI backend + React frontend) as a sub-application under IIS Default Website.

## Prerequisites

### System Requirements
- Windows Server 2019
- At least 4GB RAM
- 20GB available disk space
- Internet connectivity for package downloads

### Required Software
- **Python 3.12** - For FastAPI backend
- **Node.js 18.x or later** - For React frontend build
- **SQL Server 2019** - Already installed with your database
- **IIS (Internet Information Services)**
- **Git** - For code deployment
- **Chocolatey** - Package manager for Windows

## Step 1: Install Required Software

Open PowerShell as Administrator and run:

```powershell
# Install Chocolatey Package Manager
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required software
choco install python nodejs-lts git urlrewrite sqlserver-cmdlineutils -y

# Enable IIS and required features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-IIS6ManagementCompatibility, IIS-Metabase, IIS-ManagementConsole, IIS-BasicAuthentication, IIS-WindowsAuthentication, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing -All

# Refresh environment variables
refreshenv
```

Verify installations:
```powershell
python --version
node --version
npm --version
git --version
```

## Step 2: Deploy Application Code

### Choose Installation Location
Common options:
- **Default IIS path**: `C:\inetpub\wwwroot\admin-portal`
- **Custom path**: `E:\admin-portal` (recommended for production)

### Clone Repository
```powershell
# For custom path (recommended)
mkdir E:\admin-portal
cd E:\
git clone https://github.com/RSI-Tech/admin-portal.git admin-portal
cd admin-portal

# Set required permissions (CRITICAL)
icacls "E:\admin-portal" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

## Step 3: Configure Application

### Install Dependencies and Build

```powershell
cd E:\admin-portal

# Install Python backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install and build React frontend
cd frontend
npm install
npm run build
cd ..
```

### Create Database Configuration
Create `connection.json` in the application root:

```json
{
  "current_env": "prod",
  "environments": {
    "prod": {
      "name": "Production",
      "username": "your_prod_username",
      "password": "your_prod_password",
      "database": "your_database_name",
      "server": "your_sql_server,1433",
      "encrypt": true,
      "trustServerCertificate": false
    }
  }
}
```

**For Windows Authentication (recommended):**
```json
{
  "current_env": "prod",
  "environments": {
    "prod": {
      "name": "Production",
      "database": "your_database_name",
      "server": "your_sql_server,1433",
      "integratedSecurity": true,
      "encrypt": true,
      "trustServerCertificate": true
    }
  }
}
```

## Step 4: Configure IIS Sub-Application

### Create Application Pool
```powershell
Import-Module WebAdministration

# Remove existing application pool if it exists
if (Get-WebAppPool -Name "AdminPortalPool" -ErrorAction SilentlyContinue) {
    Remove-WebAppPool -Name "AdminPortalPool"
}

# Create application pool
New-WebAppPool -Name "AdminPortalPool"

# Configure application pool settings
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name processModel.identityType -Value ApplicationPoolIdentity
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name recycling.periodicRestart.time -Value "00:00:00"
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name startMode -Value "AlwaysRunning"

# Verify settings
Write-Host "Application pool created successfully!" -ForegroundColor Green
Get-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" | Select-Object name, startMode, processModel, recycling
```

### Create Sub-Application
```powershell
# Remove existing application if it exists
if (Get-WebApplication -Name "admin-portal" -Site "Default Web Site" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Name "admin-portal" -Site "Default Web Site"
}

# Create the sub-application
New-WebApplication -Name "admin-portal" -Site "Default Web Site" -PhysicalPath "E:\admin-portal" -ApplicationPool "AdminPortalPool"

# Create web.config with URL rewrite rules
$webConfig = @'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Rewrite _next to .next for static file serving -->
        <rule name="RewriteNextDirectory" stopProcessing="false">
          <match url="^_next/(.*)" />
          <action type="Rewrite" url=".next/{R:1}" />
        </rule>
        <!-- Serve static files directly from file system -->
        <rule name="StaticFiles" stopProcessing="true">
          <match url="^\.next/static/.*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
          </conditions>
          <action type="None" />
        </rule>
        <!-- Proxy API requests to FastAPI backend -->
        <rule name="APIProxy" stopProcessing="true">
          <match url="^(api|docs|openapi\.json)" />
          <action type="Rewrite" url="http://localhost:8000/{R:0}" />
        </rule>
        <!-- Serve React app for all other requests -->
        <rule name="ReactApp" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://localhost:3000/{R:0}" />
        </rule>
      </rules>
    </rewrite>
    <httpErrors existingResponse="PassThrough" />
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
    </staticContent>
  </system.webServer>
</configuration>
'@

# Write web.config
Set-Content -Path "E:\admin-portal\web.config" -Value $webConfig

Write-Host "Sub-application created successfully!" -ForegroundColor Green
Write-Host "Access URL: http://yourserver/admin-portal" -ForegroundColor Cyan
```

## Step 5: Setup Windows Service with PM2

### Install PM2
```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

### Create PM2 Configuration
Create `ecosystem.config.js` in the application root:

```javascript
module.exports = {
  apps: [
    {
      name: 'admin-portal-backend',
      script: 'python',
      args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
      cwd: 'E:\\admin-portal\\backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PYTHONPATH: 'E:\\admin-portal\\backend'
      }
    },
    {
      name: 'admin-portal-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      cwd: 'E:\\admin-portal\\frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};
```

### Start the Service
```powershell
# Install PM2 as Windows Service
pm2-service-install

# Start the application
pm2 start ecosystem.config.js
pm2 save
```

## Step 6: Configure Firewall

```powershell
New-NetFirewallRule -DisplayName "Admin Portal" -Direction Inbound -Protocol TCP -LocalPort 80,443,3000 -Action Allow
```

## Step 7: Test Deployment

1. **Test FastAPI Backend**:
   ```powershell
   cd E:\admin-portal\backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   Access: `http://localhost:8000/docs`

2. **Test React Frontend**:
   ```powershell
   cd E:\admin-portal\frontend
   npx serve -s dist -l 3000
   ```
   Access: `http://localhost:3000`

3. **Test IIS Sub-Application**:
   Access: `http://yourserver/admin-portal`

4. **Verify PM2 Service**:
   ```powershell
   pm2 status
   pm2 logs admin-portal-backend
   pm2 logs admin-portal-frontend
   ```

## Automated Deployment Script

Save as `deploy-sub-app.ps1` and run as Administrator:

```powershell
param(
    [string]$InstallPath = "E:\admin-portal",
    [string]$AppAlias = "admin-portal"
)

Write-Host "=== Admin Portal Sub-Application Deployment ===" -ForegroundColor Green

# Install Chocolatey if not exists
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install required software
choco install python nodejs-lts git urlrewrite -y

# Enable IIS features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing -All

# Clone repository
if (Test-Path $InstallPath) {
    cd $InstallPath
    git pull
} else {
    $parentPath = Split-Path $InstallPath -Parent
    cd $parentPath
    git clone https://github.com/RSI-Tech/admin-portal.git (Split-Path $InstallPath -Leaf)
}

# Set permissions
icacls "$InstallPath" /grant "IIS_IUSRS:(OI)(CI)F" /T

# Install dependencies and build
cd $InstallPath

# Install Python backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install and build React frontend
cd frontend
npm install
npm run build
cd ..

# Install PM2
npm install -g pm2 pm2-windows-service

# Configure IIS
Import-Module WebAdministration

# Create application pool
if (Get-WebAppPool -Name "AdminPortalPool" -ErrorAction SilentlyContinue) {
    Remove-WebAppPool -Name "AdminPortalPool"
}
New-WebAppPool -Name "AdminPortalPool"
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name processModel.identityType -Value ApplicationPoolIdentity
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name recycling.periodicRestart.time -Value "00:00:00"
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name startMode -Value "AlwaysRunning"

# Remove existing application if it exists
if (Get-WebApplication -Name $AppAlias -Site "Default Web Site" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Name $AppAlias -Site "Default Web Site"
}

# Create sub-application
New-WebApplication -Name $AppAlias -Site "Default Web Site" -PhysicalPath $InstallPath -ApplicationPool "AdminPortalPool"

# Create web.config
$webConfigContent = @'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="RewriteNextDirectory" stopProcessing="false">
          <match url="^_next/(.*)" />
          <action type="Rewrite" url=".next/{R:1}" />
        </rule>
        <rule name="StaticFiles" stopProcessing="true">
          <match url="^\.next/static/.*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
          </conditions>
          <action type="None" />
        </rule>
        <rule name="ProxyToNode" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://localhost:3000/{R:0}" />
        </rule>
      </rules>
    </rewrite>
    <httpErrors existingResponse="PassThrough" />
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
    </staticContent>
  </system.webServer>
</configuration>
'@

Set-Content -Path (Join-Path $InstallPath "web.config") -Value $webConfigContent

# Create PM2 ecosystem config
$ecosystemContent = @"
module.exports = {
  apps: [
    {
      name: 'admin-portal-backend',
      script: 'python',
      args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
      cwd: '$($InstallPath -replace "\\", "\\\\")\\\\backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PYTHONPATH: '$($InstallPath -replace "\\", "\\\\")\\\\backend'
      }
    },
    {
      name: 'admin-portal-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      cwd: '$($InstallPath -replace "\\", "\\\\")\\\\frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};
"@

Set-Content -Path (Join-Path $InstallPath "ecosystem.config.js") -Value $ecosystemContent

# Configure firewall
New-NetFirewallRule -DisplayName "Admin Portal" -Direction Inbound -Protocol TCP -LocalPort 80,443,3000 -Action Allow -ErrorAction SilentlyContinue

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Access URL: http://localhost/$AppAlias" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create connection.json with your database credentials"
Write-Host "2. Run 'pm2 start ecosystem.config.js' to start the application"
Write-Host "3. Run 'pm2-service-install' to install as Windows service"
```

## Usage

```powershell
# Quick deployment
.\deploy-sub-app.ps1

# Custom path and alias
.\deploy-sub-app.ps1 -InstallPath "D:\Apps\admin-portal" -AppAlias "portal"
```

## Troubleshooting

### Static Assets Not Loading
If CSS/JS files return 404 errors:

1. **Rebuild with environment variable**:
   ```powershell
   cd E:\admin-portal
   pm2 stop admin-portal
   $env:DEPLOY_AS_SUBAPP = "true"
   npm run build
   pm2 start ecosystem.config.js
   ```

2. **Clear browser cache** and try again

### Application Won't Start
1. **Check PM2 status**: `pm2 status`
2. **View backend logs**: `pm2 logs admin-portal-backend`
3. **View frontend logs**: `pm2 logs admin-portal-frontend`
4. **Test backend without PM2**: 
   ```powershell
   cd E:\admin-portal\backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
5. **Test frontend without PM2**:
   ```powershell
   cd E:\admin-portal\frontend
   npx serve -s dist -l 3000
   ```

### IIS Sub-Application Not Accessible
1. **Verify application pool is running**:
   ```powershell
   Get-WebAppPoolState -Name "AdminPortalPool"
   ```

2. **Check permissions**:
   ```powershell
   icacls "E:\admin-portal" /grant "IIS_IUSRS:(OI)(CI)F" /T
   ```

3. **Recreate sub-application**:
   ```powershell
   Remove-WebApplication -Name "admin-portal" -Site "Default Web Site"
   New-WebApplication -Name "admin-portal" -Site "Default Web Site" -PhysicalPath "E:\admin-portal" -ApplicationPool "AdminPortalPool"
   ```

### Database Connection Issues
1. **Test SQL connection**:
   ```powershell
   sqlcmd -S your_server -U your_username -P your_password
   ```

2. **Verify connection.json** configuration
3. **Check application pool identity** has SQL Server access

## Final Access

Your application will be accessible at:
**http://yourserver/admin-portal**

## Contact

For deployment support:
- **Author**: Faisal Sajjad
- **Company**: RSI
- **Repository**: https://github.com/RSI-Tech/admin-portal