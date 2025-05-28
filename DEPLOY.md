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

**Important**: If using a custom path, ensure the IIS_IUSRS group has read/write permissions:
```powershell
# Example: Grant permissions to E:\admin-portal
icacls "E:\admin-portal" /grant "IIS_IUSRS:(OI)(CI)F" /T
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
   ```cmd
   npm run build
   ```

## Step 4: Configure IIS

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
   - **Identity**: `ApplicationPoolIdentity`
   - **Idle Time-out**: `0` (disable timeout)
   - **Start Mode**: `AlwaysRunning`

### Create IIS Site
1. Right-click **Sites** → **Add Website**
2. Configure:
   - **Site name**: `Admin Portal`
   - **Application pool**: `AdminPortalPool`
   - **Physical path**: Your installation directory (e.g., `E:\admin-portal`)
   - **Port**: `80` (or your preferred port)
   - **Host name**: `admin-portal.yourdomain.com` (optional)

### Configure URL Rewrite Rules
1. Select your site in IIS Manager
2. Double-click **URL Rewrite**
3. Click **Add Rule(s)** → **Reverse Proxy**
4. Enter server name: `localhost:3000`
5. Click **OK**

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
         PORT: 3000
       }
     }]
   };
   ```

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

**Application won't start:**
- Check Node.js installation: `node --version`
- Verify PM2 service: `pm2 status`
- Check Windows Event Logs

**Database connection errors:**
- Verify SQL Server connectivity
- Check connection.json configuration
- Test database credentials

**IIS proxy issues:**
- Verify URL Rewrite module installation
- Check application pool status
- Review IIS error logs

**Port conflicts:**
- Change application port in ecosystem.config.js
- Update IIS proxy configuration
- Check Windows firewall rules

### Log Locations
- **Application Logs**: PM2 logs via `pm2 logs`
- **IIS Logs**: `C:\inetpub\logs\LogFiles\`
- **Windows Event Logs**: Event Viewer → Windows Logs → Application

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
    [string]$GitRepo = "https://github.com/RSI-Tech/admin-portal.git"
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

# Step 10: Create IIS Website
if (!(Get-Website -Name "Admin Portal" -ErrorAction SilentlyContinue)) {
    New-Website -Name "Admin Portal" -Port 80 -PhysicalPath $InstallPath -ApplicationPool "AdminPortalPool"
}

# Step 11: Configure URL Rewrite
$webConfigPath = Join-Path $InstallPath "web.config"
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
    script: 'npm',
    args: 'start',
    cwd: '$($InstallPath -replace "\\", "\\\\")',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
"@
Set-Content -Path $ecosystemPath -Value $ecosystemContent

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Installation Path: $InstallPath" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create connection.json with your database credentials"
Write-Host "2. Run 'pm2 start ecosystem.config.js' to start the application"
Write-Host "3. Run 'pm2-service-install' to install as Windows service"
Write-Host "4. Configure SSL certificate in IIS for HTTPS"
```

Run the script:
```powershell
# Run as Administrator with default path (E:\admin-portal)
.\deploy-admin-portal.ps1

# Or specify a custom installation path
.\deploy-admin-portal.ps1 -InstallPath "D:\Applications\admin-portal"

# Or use the default IIS path
.\deploy-admin-portal.ps1 -InstallPath "C:\inetpub\wwwroot\admin-portal"
```

## Contact

For deployment support, contact:
- **Author**: Faisal Sajjad
- **Company**: RSI
- **Repository**: https://github.com/RSI-Tech/admin-portal