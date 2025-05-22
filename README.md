# Admin Portal

Professional user management system with SQL Server 2019 integration and multi-environment support.

## Features

- **User Management**: Complete CRUD operations for user accounts
- **Interactive Status Toggle**: One-click status switching between Active/Inactive
- **User Migration**: Migrate users between environments with profile preservation
- **User Duplication**: Duplicate existing users with customizable profile assignment
- **Multi-Environment Support**: Switch between dev, integration, test, and production environments
- **Profile Assignment**: Assign and manage user profiles through USER_TO_PROFILE table
- **Field Configuration**: Configurable mandatory/optional fields system
- **Modern UI**: Professional interface built with shadcn/ui components
- **SQL Server Integration**: Direct integration with SQL Server 2019
- **Search & Filtering**: Advanced user search and status filtering
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, SQL Server integration
- **Database**: SQL Server 2019 with multi-environment configuration

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure database connection**
   Create `connection.json` with your SQL Server credentials:
   ```json
   {
     "current_env": "dev",
     "environments": {
       "dev": {
         "name": "Development",
         "username": "your_username",
         "password": "your_password",
         "database": "your_dev_database",
         "server": "localhost,1433",
         "encrypt": false,
         "trustServerCertificate": true
       },
       "int": {
         "name": "Integration", 
         "username": "your_username",
         "password": "your_password",
         "database": "your_int_database",
         "server": "int-server,1433",
         "encrypt": true,
         "trustServerCertificate": false
       },
       "test": {
         "name": "Testing",
         "username": "your_username", 
         "password": "your_password",
         "database": "your_test_database",
         "server": "test-server,1433",
         "encrypt": true,
         "trustServerCertificate": false
       },
       "prod": {
         "name": "Production",
         "database": "your_prod_database",
         "server": "prod-server,1433",
         "integratedSecurity": true,
         "encrypt": true,
         "trustServerCertificate": false
       }
     }
   }
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access application**
   Open [http://localhost:3000](http://localhost:3000)

## Configuration

### Field Configuration
Edit field requirements in `/src/lib/field-config.ts`:
- Move fields between `mandatory` and `optional` arrays
- Changes take effect immediately with hot reload during development

### Environment Management
The application supports multiple environments through the navigation bar environment selector:

- **Development (DEV)** - Green badge
- **Integration (INT)** - Blue badge  
- **Testing (TEST)** - Yellow badge
- **Production (PROD)** - Red badge

Switch environments using the database icon in the navigation header. Each environment connects to its own database as configured in `connection.json`.

### Database Connection Options
Each environment supports multiple authentication and security options:

#### Authentication Methods
- **SQL Server Authentication**: Use `username` and `password` fields
- **Windows Authentication**: Set `integratedSecurity: true` (omit username/password)

#### SSL/TLS Configuration
- **`encrypt`**: Enable/disable connection encryption (true/false)
- **`trustServerCertificate`**: Trust self-signed certificates (true/false)
- **`integratedSecurity`**: Use Windows Authentication instead of SQL authentication (true/false)

#### Examples
```json
// SQL Server Authentication with encryption
{
  "username": "sa",
  "password": "password",
  "encrypt": true,
  "trustServerCertificate": false
}

// Windows Authentication with encryption
{
  "integratedSecurity": true,
  "encrypt": true,
  "trustServerCertificate": false
}
```

**Recommended**: Use `encrypt: true, trustServerCertificate: false` for production environments

### Status Management
Users can toggle status between Active and Inactive directly from the user table:
- Click the toggle switch in the Status column
- Changes are immediately saved to the database
- Visual feedback shows current status (green = active, gray = inactive)

### User Migration
Migrate users between environments while preserving all data and profiles:
- Click the purple migration button (↔️) next to any user
- Select target environment from dropdown
- All user data is copied except USER_KEY (new key auto-generated)
- All associated profiles from USER_TO_PROFILE table are migrated
- Prevents duplicate USER_ID conflicts in target environment
- Transaction-safe operation with automatic rollback on errors
- Success confirmation with new USER_KEY and migrated profile count

### User Duplication
Create copies of existing users with customizable profiles:
- Click the green duplicate button next to any user
- Modify user details as needed
- Select which profiles to copy to the new user
- Original user remains unchanged

## Database Tables

- **USERS**: Main user information table (86+ columns)
- **USER_TO_PROFILE**: User-to-profile relationship mapping

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── environment/   # Environment switching
│   │   └── users/         # User management APIs
│   │       ├── [id]/
│   │       │   ├── migrate/   # User migration endpoint
│   │       │   └── profiles/  # Profile management
│   ├── add-user/          # Add user page
│   ├── duplicate-user/    # User duplication pages
│   └── edit-user/         # Edit user pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── environment-selector.tsx # Environment switcher
│   ├── navigation.tsx    # Main navigation header
│   ├── user-directory.tsx # Main user listing
│   ├── user-form.tsx     # User creation/editing form
│   ├── user-migration.tsx # User migration component
│   └── user-table.tsx    # User data table with actions
└── lib/                   # Utility functions
    ├── db.ts             # Dynamic database connection
    ├── field-config.ts   # Field configuration
    └── utils.ts          # Helper utilities
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite

## Development

The application uses:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components for UI elements
- **SQL Server** via mssql package
- **Native HTML selects** for better reliability

## Author

Faisal Sajjad - RSI