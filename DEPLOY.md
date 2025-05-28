# Deployment Guide - Windows Server 2019

This guide provides step-by-step instructions for deploying the Admin Portal application to Windows Server 2019.

## Prerequisites

### System Requirements
- Windows Server 2019
- At least 4GB RAM
- 20GB available disk space
- Internet connectivity for package downloads

### Required Software
- **Node.js 18.x or later**
- **SQL Server 2019** - Already installed with your database
- **IIS (Internet Information Services)**
- **Git** - For code deployment
- **Chocolatey** - Package manager for Windows

## Step 0: Install Chocolatey Package Manager

Open PowerShell as Administrator and run:

```powershell

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Verify installation:
```powershell
choco --version
```

## Step 1: Install Required Software with Chocolatey

Run the following PowerShell commands as Administrator:

```powershell
# Install Node.js LTS
choco install nodejs-lts -y

# Install Git
choco install git -y

# Install IIS and Management Tools
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-IIS6ManagementCompatibility, IIS-Metabase, IIS-ManagementConsole, IIS-BasicAuthentication, IIS-WindowsAuthentication, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing -All

# Install URL Rewrite Module for IIS
choco install urlrewrite -y

# Install SQL Server command line tools (optional, for testing)
choco install sqlserver-cmdlineutils -y

# Refresh environment variables
refreshenv
```

Verify installations:
```powershell
node --version
npm --version
git --version
```

## Step 2: Deploy Application Code

### Choose Installation Location
You can install the application in any location with appropriate permissions. Common options:
- **Default IIS path**: `C:\inetpub\wwwroot\admin-portal`
- **Custom path**: `E:\admin-portal` or any drive with sufficient space

**CRITICAL**: Grant IIS_IUSRS permissions (required for ALL installations):
```powershell
# This is REQUIRED - application will not work without it
icacls "E:\admin-portal" /grant "IIS_IUSRS:(OI)(CI)F" /T

# Verify permissions were applied
icacls "E:\admin-portal"
```

### Option A: Using Git (Recommended)
```cmd
# For default path
cd C:\inetpub\wwwroot
git clone https://github.com/RSI-Tech/admin-portal.git
cd admin-portal

# OR for custom path (e.g., E: drive)
mkdir E:\admin-portal
cd E:\
git clone https://github.com/RSI-Tech/admin-portal.git admin-portal
cd admin-portal
```

### Option B: Manual Upload
1. Copy application files to your chosen location (e.g., `E:\admin-portal\`)
2. Ensure all source files are present

## Step 3: Configure Application

1. Navigate to application directory:
   ```cmd
   # Replace with your installation path
   cd E:\admin-portal
   # or cd C:\inetpub\wwwroot\admin-portal
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

3. Create production configuration file `connection.json`:
   ```json
   {
     "current_env": "prod",
     "environments": {
       "prod": {
         "name": "Production",
         "username": "your_prod_username",
         "password": "your_prod_password",
         "database": "admin_portal_prod",
         "server": "your_sql_server,1433",
         "encrypt": true,
         "trustServerCertificate": false
       },
       "dev": {
         "name": "Development",
         "username": "your_dev_username", 
         "password": "your_dev_password",
         "database": "admin_portal_dev",
         "server": "your_sql_server,1433",
         "encrypt": false,
         "trustServerCertificate": true
       }
     }
   }
   ```

   **Security Configuration Options:**
   - **`encrypt: true`** - Enables SSL/TLS encryption (recommended for production)
   - **`encrypt: false`** - Disables encryption (acceptable for local development)
   - **`trustServerCertificate: false`** - Validates SSL certificates (recommended for production)
   - **`trustServerCertificate: true`** - Accepts self-signed certificates (development only)
   - **`integratedSecurity: true`** - Use Windows Authentication instead of username/password

   **For Integrated Security (Windows Authentication):**
   
   **Same Domain (Server and SQL on same domain):**
   ```json
   {
     "current_env": "prod",
     "environments": {
       "prod": {
         "name": "Production",
         "database": "admin_portal_prod",
         "server": "your_sql_server,1433",
         "integratedSecurity": true,
         "encrypt": true,
         "trustServerCertificate": false
       }
     }
   }
   ```
   
   **Cross-Domain (Server and SQL on different domains):**
   ```json
   {
     "current_env": "prod",
     "environments": {
       "prod": {
         "name": "Production",
         "database": "admin_portal_prod",
         "server": "your_sql_server,1433",
         "integratedSecurity": true,
         "domain": "SQLDOMAIN",
         "domainUsername": "sqluser",
         "domainPassword": "sqlpassword",
         "encrypt": true,
         "trustServerCertificate": true
       }
     }
   }
   ```
   
   **Important for Integrated Security:**
   - Remove `username` and `password` fields
   - The IIS Application Pool identity must have SQL Server access
   - Or configure the pool to run under a domain account with SQL permissions
   
   **Common Integrated Security Issues:**
   1. **"Untrusted domain" error**: 
      - Ensure the server is properly joined to the domain
      - Configure IIS App Pool to run as a domain user with SQL access
      - Add `trustServerCertificate: true` to bypass certificate validation
   
   2. **For cross-domain or workgroup scenarios**, use SQL authentication instead:
      ```json
      {
        "name": "Development",
        "username": "sql_user",
        "password": "sql_password",
        "database": "DEVRPEDB",
        "server": "servername,1961",
        "encrypt": true,
        "trustServerCertificate": true
      }
      ```

4. Build the application:
   ```powershell
   # For sub-application deployment, set environment variable first:
   $env:NODE_ENV = "production"
   # OR
   $env:DEPLOY_AS_SUBAPP = "true"
   
   # Then build
   npm run build
   ```
   
   **Note**: For sub-application deployment, the environment variable must be set BEFORE building!

## Step 4: Configure IIS

### Choose Deployment Method

**Option A: As a Sub-Application (Recommended for multiple sites)**
- Access via: `http://yourserver/admin-portal`
- Shares the main site's domain/port

**Option B: As a Separate Site**
- Access via: `http://yourserver:port` or `http://admin-portal.domain.com`
- Requires unique port or host header

### Create Application Pool
1. Open **IIS Manager**
2. Right-click **Application Pools** → **Add Application Pool**
3. Set the following:
   - **Name**: `AdminPortalPool`
   - **.NET CLR Version**: `No Managed Code`
   - **Managed Pipeline Mode**: `Integrated`
4. Click **OK**

### Configure Application Pool Settings
1. Select **AdminPortalPool**
2. Click **Advanced Settings**
3. Set:
   - **Identity**: `ApplicationPoolIdentity` (or domain account for SQL access)
   - **Idle Time-out**: `0` (disable timeout)
   - **Start Mode**: `AlwaysRunning`

### Option A: Deploy as Sub-Application (Recommended)

**Use PowerShell (Run as Administrator):**

```powershell
# Import IIS module
Import-Module WebAdministration

# Remove existing application if it exists
if (Get-WebApplication -Name "admin-portal" -Site "Default Web Site" -ErrorAction SilentlyContinue) {
    Remove-WebApplication -Name "admin-portal" -Site "Default Web Site"
}

# Create the application
New-WebApplication -Name "admin-portal" -Site "Default Web Site" -PhysicalPath "E:\admin-portal" -ApplicationPool "AdminPortalPool"

# Create the web.config with correct URL rewrite rules
$webConfig = @'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ProxyToNode" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:0}" />
        </rule>
      </rules>
    </rewrite>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
'@

# Write web.config to application directory
Set-Content -Path "E:\admin-portal\web.config" -Value $webConfig

# Ensure IIS_IUSRS has permissions (CRITICAL for sub-applications)
icacls "E:\admin-portal" /grant "IIS_IUSRS:(OI)(CI)F" /T

Write-Host "Sub-application created successfully!" -ForegroundColor Green
Write-Host "Access URL: http://yourserver/admin-portal" -ForegroundColor Cyan
```

**Important Notes:**
- The URL rewrite pattern `{R:0}` captures the entire URL (not `{R:1}`)
- `httpErrors existingResponse="PassThrough"` ensures error messages are passed through
- IIS_IUSRS permissions are **required** for the application to work

**Important for Sub-Application Deployment**:
- The application will be accessible at `/admin-portal` path
- All internal links and API calls will automatically work under this path
- Static assets will be served correctly from the sub-path
- No code changes required in the Next.js application

### Option B: Deploy as Separate Site

1. **Create IIS Site**:
   - Right-click **Sites** → **Add Website**
   - Configure:
     - **Site name**: `Admin Portal`
     - **Application pool**: `AdminPortalPool`
     - **Physical path**: Your installation directory (e.g., `E:\admin-portal`)
     - **Port**: `8090` (or your preferred port)
     - **Host name**: `admin-portal.yourdomain.com` (optional)

2. **Configure URL Rewrite for Separate Site**:
   - Select your site in IIS Manager
   - Double-click **URL Rewrite**
   - Click **Add Rule(s)** → **Reverse Proxy**
   - Enter server name: `localhost:3000`
   - Click **OK**

3. **Access the application**: `http://yourserver:8090` or `http://admin-portal.yourdomain.com`

## Step 5: Setup as Windows Service

### Install PM2 globally
```cmd
npm install -g pm2
npm install -g pm2-windows-service
```

### Configure PM2
1. Create PM2 ecosystem file `ecosystem.config.js` in the application root directory:
   ```javascript
   module.exports = {
     apps: [{
       name: 'admin-portal',
       script: 'npm',
       args: 'start',
       cwd: 'E:\\admin-portal', // Update to match your installation path
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         DEPLOY_AS_SUBAPP: 'true'  // Required for sub-application deployment
       }
     }]
   };
   ```
   
   **Note**: Using the Next.js binary directly is more reliable than using `npm` as the script.
   **Important**: Set `DEPLOY_AS_SUBAPP: 'true'` when deploying as a sub-application to fix static asset paths.

2. Install PM2 as Windows Service:
   ```cmd
   pm2-service-install
   ```

3. Start the application:
   ```cmd
   pm2 start ecosystem.config.js
   pm2 save
   ```

## Step 6: Configure Firewall

1. Open **Windows Defender Firewall with Advanced Security**
2. Create **Inbound Rule**:
   - **Rule Type**: Port
   - **Protocol**: TCP
   - **Port**: 80, 443, 3000
   - **Action**: Allow the connection
   - **Profile**: All profiles
   - **Name**: Admin Portal

## Step 7: Database Connectivity

1. Ensure SQL Server is running and accessible
2. Test database connection from the server:
   ```cmd
   sqlcmd -S your_server_name -U your_username -P your_password
   ```

3. Verify the application can connect:
   ```cmd
   # Navigate to your installation directory
   cd E:\admin-portal
   npm run build
   # Test connection after build completes
   ```

## Step 8: SSL Configuration (Recommended)

1. Obtain SSL certificate for your domain
2. In IIS Manager, select your site
3. Click **Bindings** → **Add**
4. Configure:
   - **Type**: `https`
   - **Port**: `443`
   - **SSL certificate**: Select your certificate

## Step 9: Monitoring and Maintenance

### Application Monitoring
- Use PM2 monitoring: `pm2 monit`
- Check application logs: `pm2 logs admin-portal`
- View IIS logs: `C:\inetpub\logs\LogFiles\`

### Regular Maintenance
1. **Weekly**: Check application and IIS logs
2. **Monthly**: Update Node.js packages: `npm update`
3. **Quarterly**: Review and update SSL certificates

### Backup Strategy
1. **Application Files**: Regular backup of your installation directory (e.g., `E:\admin-portal\`)
2. **Configuration**: Backup `connection.json` and IIS configuration
3. **Database**: Regular SQL Server database backups

## Troubleshooting

### Common Issues

**CSS not loading in production:**

If CSS is not loading in production builds:

1. **Verify CSS generation during build:**
   ```bash
   npm run build
   # Check for CSS files
   ls .next/static/css/
   ```

2. **Ensure proper Next.js configuration:**
   - The `next.config.mjs` should include proper `basePath` and `assetPrefix` settings
   - The `output: 'standalone'` option helps with production deployments

3. **Check IIS static file handling:**
   - Ensure IIS can serve files from the `_next` directory
   - The URL rewrite rules should pass through static assets

4. **Clear browser cache:**
   - CSS files are aggressively cached
   - Try hard refresh (Ctrl+F5) or incognito mode

5. **Rebuild the application:**
   ```bash
   # Clean build
   rm -rf .next
   npm run build
   ```

**Application won't start:**
- Check Node.js installation: `node --version`
- Verify PM2 service: `pm2 status`
- Check Windows Event Logs

**PM2 shows status as "stopped":**
1. Clean PM2 installation:
   ```powershell
   pm2 kill
   Remove-Item -Path "$env:USERPROFILE\.pm2" -Recurse -Force -ErrorAction SilentlyContinue
   npm uninstall -g pm2
   npm install -g pm2
   ```
2. Use Next.js binary directly in ecosystem.config.js:
   ```javascript
   script: 'node_modules\\next\\dist\\bin\\next'
   ```
3. Check PM2 logs for errors:
   ```bash
   pm2 logs admin-portal --lines 50
   ```

**Database connection errors:**
- Verify SQL Server connectivity
- Check connection.json configuration
- Test database credentials

**IIS proxy issues / Sub-application not accessible:**
1. **Recreate with PowerShell** (most reliable fix):
   ```powershell
   Remove-WebApplication -Name "admin-portal" -Site "Default Web Site"
   New-WebApplication -Name "admin-portal" -Site "Default Web Site" -PhysicalPath "E:\admin-portal" -ApplicationPool "AdminPortalPool"
   ```
2. **Fix web.config**:
   - Use `{R:0}` not `{R:1}` in rewrite rule
   - URL should be `http://localhost:3000/{R:0}` not `http://localhost:3000/admin-portal/{R:1}`
3. **Check permissions**:
   ```powershell
   icacls "E:\admin-portal" /grant "IIS_IUSRS:(OI)(CI)F" /T
   ```
4. Verify URL Rewrite module: `Get-WindowsFeature -Name Web-Url-Rewrite`
5. Check application pool is running: `Get-WebAppPoolState -Name "AdminPortalPool"`

**Static assets 404 errors (CSS/JS not loading):**
This happens when Next.js doesn't know it's deployed as a sub-application.

**Fix Method 1 - Set environment variable before build:**
```powershell
cd E:\admin-portal
pm2 stop admin-portal
pm2 delete admin-portal

# Set environment variable for the build
$env:DEPLOY_AS_SUBAPP = "true"
# OR for production builds:
$env:NODE_ENV = "production"

# Rebuild with the environment variable set
npm run build

# Start PM2
pm2 start ecosystem.config.js
pm2 save
```

**Fix Method 2 - Update ecosystem.config.js and rebuild:**
1. Ensure ecosystem.config.js includes the environment variable
2. The key is to set the variable BEFORE building
3. Clear browser cache and reload

**Important**: The environment variable must be set during `npm run build`, not just in PM2!

**Port conflicts:**
- Change application port in ecosystem.config.js
- Update IIS proxy configuration
- Check Windows firewall rules

### Log Locations
- **Application Logs**: PM2 logs via `pm2 logs`
- **IIS Logs**: `C:\inetpub\logs\LogFiles\`
- **Windows Event Logs**: Event Viewer → Windows Logs → Application

### PM2 Specific Troubleshooting

**Common PM2 Commands:**
```bash
pm2 status              # Check app status
pm2 logs admin-portal   # View logs
pm2 describe admin-portal # Detailed info
pm2 restart admin-portal # Restart app
pm2 stop admin-portal   # Stop app
pm2 delete admin-portal # Remove from PM2
```

**If PM2 service won't start:**
```powershell
# Run as Administrator
pm2 kill
pm2 resurrect
pm2-service-uninstall
pm2-service-install
```

**Test application without PM2:**
```bash
cd E:\admin-portal
npm start
```
If this works but PM2 doesn't, the issue is with PM2 configuration.

## Performance Optimization

1. **Enable IIS Compression**:
   - Select server in IIS Manager
   - Double-click **Compression**
   - Enable both static and dynamic compression

2. **Configure Output Caching**:
   - Select site in IIS Manager
   - Double-click **Output Caching**
   - Add caching rules for static assets

3. **Optimize PM2 Settings**:
   - Adjust `instances` in ecosystem.config.js based on CPU cores
   - Set appropriate `max_memory_restart` value

## Security Considerations

1. **File Permissions**: Ensure IIS_IUSRS has appropriate access
2. **SQL Server**: Use dedicated database user with minimal permissions
3. **Firewall**: Only open necessary ports
4. **Updates**: Keep Windows Server, IIS, and Node.js updated
5. **SSL**: Always use HTTPS in production
6. **Secrets**: Never commit connection.json to version control

## Automated Deployment Script

Save this PowerShell script as `deploy-admin-portal.ps1` for automated deployment:

```powershell
# Admin Portal Automated Deployment Script
# Run as Administrator

param(
    [string]$InstallPath = "E:\admin-portal",  # Change this to your preferred path
    [string]$GitRepo = "https://github.com/RSI-Tech/admin-portal.git",
    [switch]$AsSubApplication = $false,  # Deploy as IIS sub-application
    [string]$AppAlias = "admin-portal"   # Alias for sub-application
)

Write-Host "=== Admin Portal Automated Deployment ===" -ForegroundColor Green

# Step 1: Install Chocolatey
Write-Host "`nInstalling Chocolatey..." -ForegroundColor Yellow
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Step 2: Install Required Software
Write-Host "`nInstalling required software..." -ForegroundColor Yellow
choco install nodejs-lts git urlrewrite sqlserver-cmdlineutils -y

# Step 3: Enable IIS Features
Write-Host "`nEnabling IIS features..." -ForegroundColor Yellow
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-IIS6ManagementCompatibility, IIS-Metabase, IIS-ManagementConsole, IIS-BasicAuthentication, IIS-WindowsAuthentication, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing -All

# Step 4: Clone Repository
Write-Host "`nCloning repository..." -ForegroundColor Yellow
if (Test-Path $InstallPath) {
    Write-Host "Directory exists. Pulling latest changes..." -ForegroundColor Cyan
    cd $InstallPath
    git pull
} else {
    $parentPath = Split-Path $InstallPath -Parent
    cd $parentPath
    git clone $GitRepo (Split-Path $InstallPath -Leaf)
}

# Step 5: Set Permissions (if custom path)
if ($InstallPath -notlike "*inetpub*") {
    Write-Host "`nSetting permissions for custom path..." -ForegroundColor Yellow
    icacls "$InstallPath" /grant "IIS_IUSRS:(OI)(CI)F" /T
}

# Step 6: Install NPM Dependencies
Write-Host "`nInstalling NPM dependencies..." -ForegroundColor Yellow
cd $InstallPath
npm install

# Step 7: Build Application
Write-Host "`nBuilding application..." -ForegroundColor Yellow
npm run build

# Step 8: Install PM2
Write-Host "`nInstalling PM2..." -ForegroundColor Yellow
npm install -g pm2
npm install -g pm2-windows-service

# Step 9: Create IIS Application Pool
Write-Host "`nConfiguring IIS..." -ForegroundColor Yellow
Import-Module WebAdministration

if (!(Test-Path "IIS:\AppPools\AdminPortalPool")) {
    New-WebAppPool -Name "AdminPortalPool"
    Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name processIdentity.identityType -Value ApplicationPoolIdentity
    Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name recycling.periodicRestart.time -Value 0
    Set-ItemProperty -Path "IIS:\AppPools\AdminPortalPool" -Name startMode -Value "AlwaysRunning"
}

# Step 10: Create IIS Website or Application
if ($AsSubApplication) {
    Write-Host "Creating as sub-application under Default Web Site..." -ForegroundColor Cyan
    
    # Remove existing application if it exists
    if (Get-WebApplication -Name $AppAlias -Site "Default Web Site" -ErrorAction SilentlyContinue) {
        Remove-WebApplication -Name $AppAlias -Site "Default Web Site"
    }
    
    # Create new application
    New-WebApplication -Name $AppAlias -Site "Default Web Site" -PhysicalPath $InstallPath -ApplicationPool "AdminPortalPool"
    
    # Configure URL Rewrite for sub-application
    $webConfigContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ProxyToNode" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:0}" />
        </rule>
      </rules>
    </rewrite>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
"@
} else {
    Write-Host "Creating as separate website..." -ForegroundColor Cyan
    
    if (!(Get-Website -Name "Admin Portal" -ErrorAction SilentlyContinue)) {
        New-Website -Name "Admin Portal" -Port 80 -PhysicalPath $InstallPath -ApplicationPool "AdminPortalPool"
    }
    
    # Configure URL Rewrite for separate site
    $webConfigContent = @'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxy" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
'@
}

# Step 11: Write web.config
$webConfigPath = Join-Path $InstallPath "web.config"
Set-Content -Path $webConfigPath -Value $webConfigContent

# Step 12: Configure Firewall
Write-Host "`nConfiguring firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Admin Portal" -Direction Inbound -Protocol TCP -LocalPort 80,443,3000 -Action Allow -ErrorAction SilentlyContinue

# Step 13: Create ecosystem.config.js
Write-Host "`nCreating PM2 configuration..." -ForegroundColor Yellow
$ecosystemPath = Join-Path $InstallPath "ecosystem.config.js"
$ecosystemContent = @"
module.exports = {
  apps: [{
    name: 'admin-portal',
    script: 'node_modules\\\\next\\\\dist\\\\bin\\\\next',
    args: 'start',
    cwd: '$($InstallPath -replace "\\", "\\\\")',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DEPLOY_AS_SUBAPP: '$($AsSubApplication.ToString().ToLower())'
    }
  }]
};
"@
Set-Content -Path $ecosystemPath -Value $ecosystemContent

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Installation Path: $InstallPath" -ForegroundColor Cyan

if ($AsSubApplication) {
    Write-Host "Access URL: http://localhost/$AppAlias" -ForegroundColor Cyan
} else {
    Write-Host "Access URL: http://localhost" -ForegroundColor Cyan
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create connection.json with your database credentials"
Write-Host "2. Run 'pm2 start ecosystem.config.js' to start the application"
Write-Host "3. Run 'pm2-service-install' to install as Windows service"
Write-Host "4. Configure SSL certificate in IIS for HTTPS"
```

Run the script:
```powershell
# Deploy as a sub-application under Default Web Site (recommended for multiple sites)
.\deploy-admin-portal.ps1 -AsSubApplication

# Deploy as a sub-application with custom alias
.\deploy-admin-portal.ps1 -AsSubApplication -AppAlias "portal"

# Deploy as a separate site (default behavior)
.\deploy-admin-portal.ps1

# Deploy to custom path as sub-application
.\deploy-admin-portal.ps1 -InstallPath "D:\Applications\admin-portal" -AsSubApplication
```

## Contact

For deployment support, contact:
- **Author**: Faisal Sajjad
- **Company**: RSI
- **Repository**: https://github.com/RSI-Tech/admin-portal