# Admin Portal

Professional user management system with SQL Server 2019 integration.

## Features

- **User Management**: Add, edit, and list users with configurable required/optional fields
- **Profile Management**: Assign and manage user profiles with real-time updates
- **Professional UI**: Clean, responsive interface built with Next.js and shadcn/ui
- **Database Integration**: Direct SQL Server 2019 connectivity with transaction safety
- **Field Configuration**: Easily modify required vs optional fields in TypeScript config

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, SQL Server integration
- **Database**: SQL Server 2019 (admin_portal database)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure database connection**
   Create `connection.json` with your SQL Server credentials:
   ```json
   {
     "username": "your_username",
     "password": "your_password", 
     "database": "admin_portal",
     "server": "localhost,1433"
   }
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access application**
   Open [http://localhost:3000](http://localhost:3000)

## Configuration

Edit field requirements in `/src/lib/field-config.ts`:
- Move fields between `mandatory` and `optional` arrays
- Changes take effect immediately with hot reload

## Database Tables

- **USERS**: Main user information table
- **USER_TO_PROFILE**: User-to-profile relationship mapping

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint