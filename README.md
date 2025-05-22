# Admin Portal

Professional user management system with SQL Server 2019 integration and multi-environment support.

## Features

- **User Management**: Complete CRUD operations for user accounts
- **Interactive Status Toggle**: One-click status switching between Active/Inactive
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
         "server": "localhost,1433"
       },
       "int": {
         "name": "Integration", 
         "username": "your_username",
         "password": "your_password",
         "database": "your_int_database",
         "server": "int-server,1433"
       },
       "test": {
         "name": "Testing",
         "username": "your_username", 
         "password": "your_password",
         "database": "your_test_database",
         "server": "test-server,1433"
       },
       "prod": {
         "name": "Production",
         "username": "your_username",
         "password": "your_password", 
         "database": "your_prod_database",
         "server": "prod-server,1433"
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

### Status Management
Users can toggle status between Active and Inactive directly from the user table:
- Click the toggle switch in the Status column
- Changes are immediately saved to the database
- Visual feedback shows current status (green = active, gray = inactive)

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
│   ├── add-user/          # Add user page
│   └── edit-user/         # Edit user pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── environment-selector.tsx # Environment switcher
│   ├── navigation.tsx    # Main navigation header
│   ├── user-directory.tsx # Main user listing
│   ├── user-form.tsx     # User creation/editing form
│   └── user-table.tsx    # User data table with status toggle
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