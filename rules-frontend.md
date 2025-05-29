---
description: Rules for working with the React frontend in the /frontend folder
globs: frontend/**/*
alwaysApply: true
---
This project should use modern, concise, and best practices for building React 18+ with TypeScript

# Primary Libraries

- React 18.3.1 with TypeScript
- React Router 7.1.1 for routing
- Tailwind CSS 3.4.17 for styling (v3, not v4)
- Axios 1.7.9 for API calls
- Lucide React 0.468.0 for icons
- Vite 6.0.6 for build tooling
- shadcn/ui components (already installed)

# Project Context

This is a user management portal migrated from Next.js to React + FastAPI:
- All styling and UI must remain exactly as in the Next.js version
- Components use shadcn/ui (already configured)
- API calls go to FastAPI backend at /api/*
- Multi-environment support (dev, int, test, prod)

# Rules

## General
- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums, use const objects instead
- Use functional components with hooks
- No class components

## File Structure
- Use lowercase with dashes for directories (e.g., components/user-form)
- Component files use PascalCase (e.g., UserForm.tsx)
- Keep components focused and single-purpose
- Co-locate related files (component, styles, tests)

## Routing
- Use React Router v7 with createBrowserRouter
- Base path is /admin-portal
- Implement lazy loading for route components
- Handle 404 and error states

## Styling
- Use Tailwind CSS v3 (not v4) for all styling
- Follow existing design patterns from Next.js version
- Maintain consistent spacing and typography
- Use shadcn/ui components where applicable
- No additional UI libraries without approval

## API Integration
- Use Axios for all API calls
- Centralize API configuration in api.ts
- Handle loading and error states properly
- Type all API responses with TypeScript interfaces
- Use proper error handling with try/catch

## State Management
- Use React hooks for local state
- Context API for global state if needed
- No external state management libraries initially

## Forms
- Use controlled components
- Implement proper validation
- Show error messages clearly
- Handle submit states (loading, success, error)

## Code Quality
- Use Prettier for formatting
- Follow ESLint rules
- Write self-documenting code
- Add comments only when necessary
- Keep functions under 50 lines

## Performance
- Implement code splitting with lazy()
- Optimize re-renders with memo/useMemo/useCallback
- Lazy load images where appropriate
- Minimize bundle size

## Testing
- Write unit tests for utilities
- Test API integration
- Ensure components render correctly
- Mock API calls in tests

## Accessibility
- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

## Security
- Sanitize user inputs
- Don't store sensitive data in localStorage
- Use HTTPS for all API calls
- Implement proper CORS handling