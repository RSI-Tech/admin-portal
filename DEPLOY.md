# IIS Static + NSSM Backend Deployment Guide - Windows Server 2019

This guide provides step-by-step instructions for deploying the Admin Portal using the optimal Windows architecture:
- **FastAPI backend** as a Windows Service via NSSM
- **React frontend** served as static files directly by IIS
- **IIS reverse proxy** for API requests to the backend service

This approach leverages each platform's strengths: Windows Service control for Python and IIS's fast static file pipeline with built-in HTTPS, compression, and logging.

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
- **NSSM (Non-Sucking Service Manager)**
- **Git** - For code deployment
- **Chocolatey** - Package manager for Windows

## Step 1: Install Required Software

Open PowerShell as Administrator and run:

```powershell
# Install Chocolatey Package Manager
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required software
choco install python nodejs-lts git urlrewrite nssm -y

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
nssm --version
```

## Step 2: Deploy Application Code

### Clone Repository
```powershell
# Deploy to custom path (recommended)
mkdir E:\admin-portal
cd E:\
git clone https://github.com/RSI-Tech/admin-portal.git admin-portal
cd admin-portal

# Set required permissions
icacls "E:\admin-portal" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

## Step 3: Configure Backend

### Install Python Dependencies
```powershell
cd E:\admin-portal\backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Create Database Configuration
Create `connection.json` in the backend directory:

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

### Setup Backend as Windows Service with NSSM

```powershell
# Install the FastAPI backend as a Windows Service
nssm install AdminPortalBackend "E:\admin-portal\backend\venv\Scripts\python.exe" "-m" "uvicorn" "app.main:app" "--host" "0.0.0.0" "--port" "8000"

# Configure service settings
nssm set AdminPortalBackend AppDirectory "E:\admin-portal\backend"
nssm set AdminPortalBackend AppEnvironmentExtra "PYTHONPATH=E:\admin-portal\backend"
nssm set AdminPortalBackend Start SERVICE_AUTO_START
nssm set AdminPortalBackend DisplayName "Admin Portal Backend"
nssm set AdminPortalBackend Description "FastAPI backend service for Admin Portal"

# Configure logging
nssm set AdminPortalBackend AppStdout "E:\admin-portal\backend\logs\service-output.log"
nssm set AdminPortalBackend AppStderr "E:\admin-portal\backend\logs\service-error.log"

# Create logs directory
mkdir "E:\admin-portal\backend\logs" -Force

# Start the service
nssm start AdminPortalBackend

# Verify service is running
nssm status AdminPortalBackend
Get-Service AdminPortalBackend
```

## Step 4: Configure Frontend

### Build React Application for Sub-Path

First, update the Vite configuration for sub-application deployment:

```powershell
cd E:\admin-portal\frontend

# Create or update vite.config.ts
@'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/admin-portal/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}));
'@ | Out-File -FilePath "vite.config.ts" -Encoding UTF8
```

### Update React Router for Sub-Path

Update your main React app file to use the correct basename:

```typescript
// In your main.tsx or App.tsx
import { BrowserRouter } from "react-router-dom";

root.render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
);
```

### Build the Frontend

```powershell
# Install dependencies and build
npm install
npm run build

# Verify build output
ls dist
```

## Step 5: Deploy Static Files to IIS

### Copy Built Files to IIS Directory

```powershell
# Create IIS sub-application directory
mkdir "C:\inetpub\wwwroot\admin-portal" -Force

# Copy built files to IIS directory
robocopy "E:\admin-portal\frontend\dist" "C:\inetpub\wwwroot\admin-portal" /E /MIR

# Set IIS permissions
icacls "C:\inetpub\wwwroot\admin-portal" /grant "IIS_IUSRS:(OI)(CI)R" /T
```

### Create IIS Sub-Application

```powershell
Import-Module WebAdministration

# Create application pool for admin portal
if (Get-WebAppPool -Name "AdminPortalPool" -ErrorAction SilentlyContinue) {
    Remove-WebAppPool -Name "AdminPortalPool"
}
New-WebAppPool -Name "AdminPortalPool"
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name processModel.identityType -Value ApplicationPoolIdentity
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name recycling.periodicRestart.time -Value "00:00:00"
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name startMode -Value "AlwaysRunning"

# Remove existing application if it exists
if (Get-WebApplication -Name "admin-portal" -Site "Default Web Site" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Name "admin-portal" -Site "Default Web Site"
}

# Create the sub-application
New-WebApplication -Name "admin-portal" -Site "Default Web Site" -PhysicalPath "C:\inetpub\wwwroot\admin-portal" -ApplicationPool "AdminPortalPool"

Write-Host "IIS sub-application created successfully!" -ForegroundColor Green
```

### Configure web.config for SPA and API Proxy

Create web.config in the IIS directory:

```powershell
$webConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>

    <!-- URL Rewrite Rules -->
    <rewrite>
      <rules>
        <!-- API Proxy: Forward /admin-portal/api/* to FastAPI backend -->
        <rule name="APIProxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8000/api/{R:1}" />
        </rule>
        
        <!-- Docs Proxy: Forward /admin-portal/docs to FastAPI docs -->
        <rule name="DocsProxy" stopProcessing="true">
          <match url="^docs$" />
          <action type="Rewrite" url="http://localhost:8000/docs" />
        </rule>
        
        <!-- OpenAPI Proxy: Forward /admin-portal/openapi.json to FastAPI -->
        <rule name="OpenAPIProxy" stopProcessing="true">
          <match url="^openapi\.json$" />
          <action type="Rewrite" url="http://localhost:8000/openapi.json" />
        </rule>
        
        <!-- SPA Fallback: Everything else goes to React app -->
        <rule name="ReactRoutes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/admin-portal/index.html" />
        </rule>
      </rules>
    </rewrite>

    <!-- Static Content Configuration -->
    <staticContent>
      <!-- Vite/React specific MIME types -->
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>

    <!-- HTTP Headers for Performance -->
    <httpProtocol>
      <customHeaders>
        <!-- Cache static assets for 7 days -->
        <add name="Cache-Control" value="public,max-age=604800" />
      </customHeaders>
    </httpProtocol>

    <!-- Default Documents -->
    <defaultDocument>
      <files>
        <add value="index.html" />
      </files>
    </defaultDocument>

    <!-- Error Handling -->
    <httpErrors existingResponse="PassThrough" />

  </system.webServer>
</configuration>
'@

# Write web.config to IIS directory
Set-Content -Path "C:\inetpub\wwwroot\admin-portal\web.config" -Value $webConfig

Write-Host "web.config created successfully!" -ForegroundColor Green
```

## Step 6: Configure Firewall

```powershell
# Allow HTTP/HTTPS traffic
New-NetFirewallRule -DisplayName "Admin Portal HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Admin Portal HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Allow backend service port (for internal communication)
New-NetFirewallRule -DisplayName "Admin Portal Backend" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

## Step 7: Test Deployment

### Test Backend Service
```powershell
# Check service status
Get-Service AdminPortalBackend
nssm status AdminPortalBackend

# Test API directly
Invoke-RestMethod -Uri "http://localhost:8000/docs" -Method Get
```

### Test IIS Sub-Application
```powershell
# Test static file serving
Invoke-WebRequest -Uri "http://localhost/admin-portal/" -UseBasicParsing

# Test API proxy through IIS
Invoke-RestMethod -Uri "http://localhost/admin-portal/api/environment" -Method Get
```

### Access the Application
- **Main Application**: `http://yourserver/admin-portal/`
- **API Documentation**: `http://yourserver/admin-portal/docs`
- **Direct Backend** (internal): `http://localhost:8000/docs`

## Step 8: SSL Configuration (Production)

### Install SSL Certificate
```powershell
# In IIS Manager, select Default Web Site
# Bindings -> Add -> Type: https, Port: 443, SSL certificate: [your certificate]
```

### Force HTTPS Redirect
Add to web.config before existing rules:

```xml
<!-- Force HTTPS Redirect -->
<rule name="ForceHTTPS" stopProcessing="true">
  <match url="(.*)" />
  <conditions>
    <add input="{HTTPS}" pattern="off" ignoreCase="true" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/admin-portal/{R:1}" redirectType="Permanent" />
</rule>
```

## Automated Deployment Script

Save as `deploy-nssm-iis.ps1` and run as Administrator:

```powershell
param(
    [string]$InstallPath = "E:\admin-portal",
    [string]$AppAlias = "admin-portal",
    [string]$IISPath = "C:\inetpub\wwwroot"
)

Write-Host "=== Admin Portal NSSM + IIS Deployment ===" -ForegroundColor Green

# Install required software
choco install python nodejs-lts git urlrewrite nssm -y

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

# Install backend dependencies
cd "$InstallPath\backend"
python -m venv venv
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements.txt

# Build frontend
cd "$InstallPath\frontend"
npm install
npm run build

# Setup NSSM service
nssm remove AdminPortalBackend confirm
nssm install AdminPortalBackend "$InstallPath\backend\venv\Scripts\python.exe" "-m" "uvicorn" "app.main:app" "--host" "0.0.0.0" "--port" "8000"
nssm set AdminPortalBackend AppDirectory "$InstallPath\backend"
nssm set AdminPortalBackend AppEnvironmentExtra "PYTHONPATH=$InstallPath\backend"
nssm set AdminPortalBackend Start SERVICE_AUTO_START

# Create logs directory and configure logging
mkdir "$InstallPath\backend\logs" -Force
nssm set AdminPortalBackend AppStdout "$InstallPath\backend\logs\service-output.log"
nssm set AdminPortalBackend AppStderr "$InstallPath\backend\logs\service-error.log"

# Deploy to IIS
$iisAppPath = "$IISPath\$AppAlias"
mkdir $iisAppPath -Force
robocopy "$InstallPath\frontend\dist" $iisAppPath /E /MIR

# Configure IIS
Import-Module WebAdministration
if (Get-WebAppPool -Name "AdminPortalPool" -ErrorAction SilentlyContinue) {
    Remove-WebAppPool -Name "AdminPortalPool"
}
New-WebAppPool -Name "AdminPortalPool"
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name processModel.identityType -Value ApplicationPoolIdentity
Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name recycling.periodicRestart.time -Value "00:00:00"

if (Get-WebApplication -Name $AppAlias -Site "Default Web Site" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Name $AppAlias -Site "Default Web Site"
}
New-WebApplication -Name $AppAlias -Site "Default Web Site" -PhysicalPath $iisAppPath -ApplicationPool "AdminPortalPool"

# Create web.config
$webConfig = @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="APIProxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8000/api/{R:1}" />
        </rule>
        <rule name="DocsProxy" stopProcessing="true">
          <match url="^docs$" />
          <action type="Rewrite" url="http://localhost:8000/docs" />
        </rule>
        <rule name="OpenAPIProxy" stopProcessing="true">
          <match url="^openapi\.json$" />
          <action type="Rewrite" url="http://localhost:8000/openapi.json" />
        </rule>
        <rule name="ReactRoutes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/admin-portal/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
    <defaultDocument>
      <files>
        <add value="index.html" />
      </files>
    </defaultDocument>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
'@

Set-Content -Path "$iisAppPath\web.config" -Value $webConfig

# Start services
nssm start AdminPortalBackend
iisreset

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Backend Service: AdminPortalBackend" -ForegroundColor Cyan
Write-Host "Application URL: http://localhost/$AppAlias/" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost/$AppAlias/docs" -ForegroundColor Cyan
```

## Service Management

### NSSM Service Commands
```powershell
# Service status
nssm status AdminPortalBackend
Get-Service AdminPortalBackend

# Start/Stop/Restart
nssm start AdminPortalBackend
nssm stop AdminPortalBackend
nssm restart AdminPortalBackend

# View service configuration
nssm get AdminPortalBackend

# View logs
Get-Content "E:\admin-portal\backend\logs\service-output.log" -Tail 20
Get-Content "E:\admin-portal\backend\logs\service-error.log" -Tail 20

# Remove service (if needed)
nssm remove AdminPortalBackend confirm
```

## Troubleshooting

### Backend Service Issues
```powershell
# Check service status
Get-Service AdminPortalBackend
nssm status AdminPortalBackend

# View service logs
Get-Content "E:\admin-portal\backend\logs\service-error.log" -Tail 50

# Test manual startup
cd E:\admin-portal\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Static File Issues
```powershell
# Check IIS application
Get-WebApplication -Name "admin-portal" -Site "Default Web Site"

# Verify files copied correctly
ls "C:\inetpub\wwwroot\admin-portal"

# Re-deploy frontend files
cd E:\admin-portal\frontend
npm run build
robocopy "dist" "C:\inetpub\wwwroot\admin-portal" /E /MIR
```

### API Proxy Issues
```powershell
# Test backend directly
Invoke-RestMethod -Uri "http://localhost:8000/docs" -Method Get

# Test through IIS proxy
Invoke-RestMethod -Uri "http://localhost/admin-portal/api/environment" -Method Get

# Check URL Rewrite module
Get-WindowsFeature -Name Web-Url-Rewrite
```

## Benefits of This Architecture

1. **Performance**: IIS serves static files extremely fast with built-in compression
2. **Reliability**: NSSM provides robust Windows Service management
3. **Security**: IIS handles SSL termination and security headers
4. **Monitoring**: Windows Service logs and IIS logs provide comprehensive monitoring
5. **Scalability**: Easy to add load balancing and caching
6. **Maintenance**: Simple service restart without affecting static file serving

## Final Access

Your application will be accessible at:
- **Main Application**: `https://yourserver/admin-portal/`
- **API Documentation**: `https://yourserver/admin-portal/docs`

## Contact

For deployment support:
- **Author**: Faisal Sajjad
- **Company**: RSI
- **Repository**: https://github.com/RSI-Tech/admin-portal