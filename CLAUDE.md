# Admin Portal - Project Memory

## Project Overview
Professional user management system for RSI built with Next.js 14, TypeScript, and SQL Server 2019.

## Key Features
- User management with CRUD operations
- Profile assignment system (USER_TO_PROFILE table)
- Configurable mandatory/optional fields
- Professional UI with shadcn/ui components
- SQL Server 2019 integration

## Database Schema
- **USERS table**: 86+ columns with user information
- **USER_TO_PROFILE table**: Maps users to profiles (USER_KEY, PROFILE_ID, UPDATED_DATE, UPDATED_BY)

## Important Files
- `/src/lib/field-config.ts` - Field configuration (mandatory/optional)
- `/src/lib/db.ts` - Database connection
- `/connection.json` - SQL Server credentials (gitignored)

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
- Professional user profiles UI with gradients and animations
- Native dropdown styling for better cross-browser compatibility
- Enhanced table design with alternating rows
- Improved form validation and error states

## Git information
- Author: Faisal Sajjad
- Company: RSI 
- repo: https://github.com/RSI-Tech/admin-portal
- No mention of any AI or claude

