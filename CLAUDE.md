# Admin Portal - Project Memory

## Project Overview
Professional user management system for RSI built with Next.js 14, TypeScript, and SQL Server 2019.

## Key Features
- User management with CRUD operations
- Interactive status toggle functionality (Active/Inactive)
- Multi-environment support (dev, int, test, prod)
- Profile assignment system (USER_TO_PROFILE table)
- Configurable mandatory/optional fields
- Professional UI with shadcn/ui components
- SQL Server 2019 integration

## Database Schema
- **USERS table**: 86+ columns with user information
- **USER_TO_PROFILE table**: Maps users to profiles (USER_KEY, PROFILE_ID, UPDATED_DATE, UPDATED_BY)

## Important Files
- `/src/lib/field-config.ts` - Field configuration (mandatory/optional)
- `/src/lib/db.ts` - Dynamic database connection with environment support
- `/src/components/environment-selector.tsx` - Environment switching UI
- `/src/app/api/environment/` - Environment management API
- `/connection.json` - Multi-environment SQL Server configuration (gitignored)

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Field Configuration
Edit `/src/lib/field-config.ts` to move fields between mandatory/optional arrays. Changes take effect immediately with hot reload.

## Known Issues Fixed
- Replaced shadcn Select components with native HTML selects for better reliability
- Fixed NULL value handling in database updates
- Enhanced profile management with transaction safety

## Git Repository
- Remote: git@github.com:RSI-Tech/admin-portal.git
- Author: Faisal @ RSI

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components (partial use)
- SQL Server 2019 via mssql package
- Native HTML selects for dropdowns

## UI Design Principles
- Clean, professional interface
- Consistent spacing and typography
- Blue primary color scheme
- Native form elements for reliability
- Responsive design

## Recent Enhancements
- Interactive status toggle switches for Active/Inactive user management
- Multi-environment database switching with visual indicators
- Professional user profiles UI with gradients and animations
- Native dropdown styling for better cross-browser compatibility
- Enhanced table design with alternating rows and USER_KEY column
- Dynamic database connections that update when environments change
- Environment selector in navigation with color-coded badges
- Improved form validation and error states

## Git information
- Author: Faisal Sajjad
- Company: RSI 
- repo: https://github.com/RSI-Tech/admin-portal
- No mention of any AI or claude

## Environment Management
- Supports multiple environments: dev, int, test, prod
- Environment switching via navigation header selector
- Color-coded environment badges (green=dev, blue=int, yellow=test, red=prod)
- Dynamic database connections that update automatically
- Each environment has isolated database configuration
- Configurable SSL/TLS encryption and certificate validation per environment

## Status Management
- Toggle user status between Active/Inactive with single click
- Real-time database updates via API endpoints
- Visual feedback with green/gray toggle switches
- Optimistic UI updates with error handling