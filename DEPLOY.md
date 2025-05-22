# Deployment Guide - Windows Server 2019

This guide provides step-by-step instructions for deploying the Admin Portal application to Windows Server 2019.

## Prerequisites

### System Requirements
- Windows Server 2019
- At least 4GB RAM
- 20GB available disk space
- Internet connectivity for package downloads

### Required Software
- **Node.js 18.x or later** - [Download from nodejs.org](https://nodejs.org/)
- **SQL Server 2019** - Already installed with your database
- **IIS (Internet Information Services)** - For hosting the application
- **Git** (optional) - For code deployment

## Step 1: Install Node.js

1. Download Node.js LTS version from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer as Administrator
3. Accept all default settings
4. Verify installation by opening Command Prompt and running:
   ```cmd
   node --version
   npm --version
   ```

## Step 2: Install IIS and URL Rewrite Module

1. Open **Server Manager**
2. Click **Add roles and features**
3. Select **Web Server (IIS)** role
4. Include **Management Tools**
5. Install the **URL Rewrite Module**:
   - Download from [Microsoft IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
   - Run installer as Administrator

## Step 3: Deploy Application Code

### Option A: Using Git (Recommended)
```cmd
cd C:\inetpub\wwwroot
git clone https://github.com/RSI-Tech/admin-portal.git
cd admin-portal
```

### Option B: Manual Upload
1. Copy application files to `C:\inetpub\wwwroot\admin-portal\`
2. Ensure all source files are present

## Step 4: Configure Application

1. Navigate to application directory:
   ```cmd
   cd C:\inetpub\wwwroot\admin-portal
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
         "server": "your_sql_server,1433"
       },
       "dev": {
         "name": "Development",
         "username": "your_dev_username", 
         "password": "your_dev_password",
         "database": "admin_portal_dev",
         "server": "your_sql_server,1433"
       }
     }
   }
   ```

4. Build the application:
   ```cmd
   npm run build
   ```

## Step 5: Configure IIS

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
   - **Physical path**: `C:\inetpub\wwwroot\admin-portal`
   - **Port**: `80` (or your preferred port)
   - **Host name**: `admin-portal.yourdomain.com` (optional)

### Configure URL Rewrite Rules
1. Select your site in IIS Manager
2. Double-click **URL Rewrite**
3. Click **Add Rule(s)** → **Reverse Proxy**
4. Enter server name: `localhost:3000`
5. Click **OK**

## Step 6: Setup as Windows Service

### Install PM2 globally
```cmd
npm install -g pm2
npm install -g pm2-windows-service
```

### Configure PM2
1. Create PM2 ecosystem file `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'admin-portal',
       script: 'npm',
       args: 'start',
       cwd: 'C:\\inetpub\\wwwroot\\admin-portal',
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

## Step 7: Configure Firewall

1. Open **Windows Defender Firewall with Advanced Security**
2. Create **Inbound Rule**:
   - **Rule Type**: Port
   - **Protocol**: TCP
   - **Port**: 80, 443, 3000
   - **Action**: Allow the connection
   - **Profile**: All profiles
   - **Name**: Admin Portal

## Step 8: Database Connectivity

1. Ensure SQL Server is running and accessible
2. Test database connection from the server:
   ```cmd
   sqlcmd -S your_server_name -U your_username -P your_password
   ```

3. Verify the application can connect:
   ```cmd
   cd C:\inetpub\wwwroot\admin-portal
   node -e "const db = require('./src/lib/db'); db.connectToDatabase().then(() => console.log('Connected')).catch(console.error)"
   ```

## Step 9: SSL Configuration (Recommended)

1. Obtain SSL certificate for your domain
2. In IIS Manager, select your site
3. Click **Bindings** → **Add**
4. Configure:
   - **Type**: `https`
   - **Port**: `443`
   - **SSL certificate**: Select your certificate

## Step 10: Monitoring and Maintenance

### Application Monitoring
- Use PM2 monitoring: `pm2 monit`
- Check application logs: `pm2 logs admin-portal`
- View IIS logs: `C:\inetpub\logs\LogFiles\`

### Regular Maintenance
1. **Weekly**: Check application and IIS logs
2. **Monthly**: Update Node.js packages: `npm update`
3. **Quarterly**: Review and update SSL certificates

### Backup Strategy
1. **Application Files**: Regular backup of `C:\inetpub\wwwroot\admin-portal\`
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

## Contact

For deployment support, contact:
- **Author**: Faisal Sajjad
- **Company**: RSI
- **Repository**: https://github.com/RSI-Tech/admin-portal