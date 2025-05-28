# RSI Admin Portal Migration Plan: Next.js to FastAPI + React

## Executive Summary

This document outlines the migration strategy for converting the RSI Admin Portal from a Next.js 14 full-stack application to a separated architecture with FastAPI backend and React frontend, optimized for Windows Server 2019 deployment with cross-domain database authentication.

## Current Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQL Server 2019
- **UI**: React 18 with Tailwind CSS and shadcn/ui
- **Deployment**: IIS on Windows Server (as sub-application)
- **Authentication**: None (relies on network/IIS security)

### Key Features
1. User management (CRUD operations on 86+ column USERS table)
2. Profile assignment system (USER_TO_PROFILE junction table)
3. Multi-environment support (dev, int, test, prod)
4. Real-time status toggling
5. User duplication and cross-environment migration
6. Configurable mandatory/optional fields

## Target Architecture

### Backend (FastAPI)
- **Location**: `/backend` folder
- **Language**: Python 3.11+
- **Framework**: FastAPI with Pydantic
- **Database**: SQL Server 2019 via pyodbc/pymssql
- **Authentication**: Windows Authentication with NTLM for cross-domain
- **Deployment**: Windows Service or IIS with ASGI

### Frontend (React)
- **Location**: `/frontend` folder
- **Language**: TypeScript
- **Framework**: React 18 (Create React App or Vite)
- **UI**: Keep existing Tailwind CSS and shadcn/ui components
- **Deployment**: IIS static hosting

## Migration Phases

### Phase 1: Project Structure Setup
1. Create new directory structure:
   ```
   admin-portal/
   ├── backend/
   │   ├── app/
   │   │   ├── __init__.py
   │   │   ├── main.py
   │   │   ├── config.py
   │   │   ├── database.py
   │   │   ├── models/
   │   │   ├── schemas/
   │   │   ├── api/
   │   │   └── core/
   │   ├── tests/
   │   ├── requirements.txt
   │   └── .env
   └── frontend/
       ├── src/
       ├── public/
       ├── package.json
       └── tsconfig.json
   ```

### Phase 2: Backend Development (FastAPI)

#### 2.1 Core Setup
```python
# requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
pymssql==2.2.10  # Better cross-domain support than pyodbc
python-multipart==0.0.6
pytest==7.4.3
httpx==0.25.2
```

#### 2.2 Database Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings
from typing import Dict
import json

class Settings(BaseSettings):
    # Environment management
    environment: str = "dev"
    connection_file: str = "connection.json"
    
    # Windows Authentication for cross-domain
    use_windows_auth: bool = True
    domain: str = "RSI"
    
    class Config:
        env_file = ".env"
    
    def get_db_config(self) -> Dict:
        with open(self.connection_file) as f:
            connections = json.load(f)
        return connections[self.environment]

# app/database.py
import pymssql
from contextlib import contextmanager
from app.config import Settings

settings = Settings()

@contextmanager
def get_db():
    config = settings.get_db_config()
    
    if settings.use_windows_auth:
        # Cross-domain Windows Authentication
        conn = pymssql.connect(
            server=config['server'],
            database=config['database'],
            user=f"{settings.domain}\\{config['user']}",
            password=config['password'],
            tds_version='7.4',
            as_dict=True
        )
    else:
        conn = pymssql.connect(
            server=config['server'],
            database=config['database'],
            user=config['user'],
            password=config['password'],
            as_dict=True
        )
    
    try:
        yield conn
    finally:
        conn.close()
```

#### 2.3 API Endpoints Migration

Map all existing Next.js API routes to FastAPI:

```python
# app/api/users.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.schemas.user import User, UserCreate, UserUpdate
from app.database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def get_users(
    search: Optional[str] = None,
    user_type: Optional[str] = None,
    status: Optional[str] = None,
    profile_id: Optional[str] = None
):
    # Implement filtering logic
    pass

@router.get("/{user_key}")
async def get_user(user_key: int):
    # Get single user
    pass

@router.post("/")
async def create_user(user: UserCreate):
    # Create new user with duplicate check
    pass

@router.put("/{user_key}")
async def update_user(user_key: int, user: UserUpdate):
    # Update user with null handling
    pass

@router.patch("/{user_key}/status")
async def update_user_status(user_key: int, status: str):
    # Toggle user status
    pass

@router.post("/{user_key}/migrate")
async def migrate_user(user_key: int, target_env: str):
    # Cross-environment migration
    pass
```

#### 2.4 Profile Management
```python
# app/api/profiles.py
from fastapi import APIRouter, HTTPException
from typing import List
from app.database import get_db

router = APIRouter(prefix="/api/profiles", tags=["profiles"])

@router.get("/")
async def get_profiles():
    # Get distinct profiles with counts
    pass

@router.get("/users/{user_key}")
async def get_user_profiles(user_key: int):
    # Get user's assigned profiles
    pass

@router.put("/users/{user_key}")
async def update_user_profiles(user_key: int, profile_ids: List[str]):
    # Update with transaction support
    pass
```

#### 2.5 Environment Management
```python
# app/api/environment.py
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api/environment", tags=["environment"])

@router.get("/")
async def get_environment():
    return {"environment": settings.environment}

@router.post("/")
async def set_environment(env: str):
    if env not in ["dev", "int", "test", "prod"]:
        raise HTTPException(400, "Invalid environment")
    settings.environment = env
    return {"environment": env}
```

### Phase 3: Frontend Migration (React)

#### 3.1 Project Setup
```bash
# Using Vite for better performance
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios react-router-dom react-hook-form zod
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
```

#### 3.2 Move Existing Components
1. Copy all components from `src/components/` to `frontend/src/components/`
2. Copy `src/app/globals.css` to `frontend/src/index.css`
3. Copy `tailwind.config.ts` and `postcss.config.js`
4. Update import paths to remove Next.js specific imports

#### 3.3 Router Setup
```typescript
// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';
import DuplicateUserPage from './pages/DuplicateUserPage';

function App() {
  return (
    <Router basename="/admin-portal">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-user" element={<AddUserPage />} />
          <Route path="/edit-user/:id" element={<EditUserPage />} />
          <Route path="/duplicate-user/:id" element={<DuplicateUserPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
```

#### 3.4 API Client Update
```typescript
// frontend/src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle authentication errors
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Phase 4: Windows Server 2019 Deployment

#### 4.1 Backend Deployment Options

**Option A: Windows Service (Recommended)**
```python
# backend/windows_service.py
import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sys
import os
import uvicorn
from app.main import app

class AdminPortalService(win32serviceutil.ServiceFramework):
    _svc_name_ = "RSIAdminPortalAPI"
    _svc_display_name_ = "RSI Admin Portal API Service"
    
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
    
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
    
    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        self.main()
    
    def main(self):
        uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(AdminPortalService)
```

**Option B: IIS with wfastcgi**
```xml
<!-- backend/web.config -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="PythonHandler" path="*" verb="*" modules="FastCgiModule"
           scriptProcessor="C:\Python311\python.exe|C:\Python311\Scripts\wfastcgi.py"
           resourceType="Unspecified" requireAccess="Script" />
    </handlers>
    <security>
      <authentication>
        <windowsAuthentication enabled="true" />
        <anonymousAuthentication enabled="false" />
      </authentication>
    </security>
  </system.webServer>
  <appSettings>
    <add key="WSGI_HANDLER" value="app.main.app" />
    <add key="PYTHONPATH" value="C:\inetpub\wwwroot\admin-portal\backend" />
  </appSettings>
</configuration>
```

#### 4.2 Frontend IIS Configuration
```xml
<!-- frontend/web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
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
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

### Phase 5: Testing Strategy

#### 5.1 Backend Tests
```python
# backend/tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_users():
    response = client.get("/api/users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_user():
    user_data = {
        "USER_ID": "TEST001",
        "FIRST_NAME": "Test",
        "LAST_NAME": "User",
        "STATUS": "Active",
        "UPDATED_BY": "SYSTEM"
    }
    response = client.post("/api/users", json=user_data)
    assert response.status_code == 201

def test_update_user_status():
    response = client.patch("/api/users/1/status", json={"status": "Inactive"})
    assert response.status_code == 200
```

#### 5.2 Frontend Tests
```typescript
// frontend/src/__tests__/UserForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserForm } from '../components/UserForm';
import api from '../lib/api';

jest.mock('../lib/api');

test('submits form with valid data', async () => {
  const mockSubmit = jest.fn();
  render(<UserForm onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByLabelText('User ID'), { target: { value: 'TEST001' } });
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
  fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'User' } });
  
  fireEvent.click(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Phase 6: Migration Steps

#### 6.1 Pre-Migration
1. Create full backup of existing application and database
2. Document all environment-specific configurations
3. Set up development environment on Windows Server 2019
4. Test cross-domain authentication setup

#### 6.2 Backend Migration
1. Set up Python environment and install dependencies
2. Create FastAPI application structure
3. Migrate database models and schemas
4. Implement all API endpoints with tests
5. Configure Windows Authentication
6. Set up logging and monitoring
7. Deploy as Windows Service or IIS application

#### 6.3 Frontend Migration
1. Create React application with TypeScript
2. Copy and adapt all components
3. Update routing from Next.js to React Router
4. Update API calls to use new backend
5. Test all functionality
6. Build production bundle
7. Deploy to IIS

#### 6.4 Cutover Process
1. Deploy backend to production server
2. Deploy frontend to IIS
3. Update DNS/routing as needed
4. Test all functionality in production
5. Monitor for issues
6. Keep old application available for rollback

### Phase 7: Post-Migration

#### 7.1 Monitoring and Logging
```python
# backend/app/core/logging.py
import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging():
    log_dir = "C:/logs/admin-portal"
    os.makedirs(log_dir, exist_ok=True)
    
    handler = RotatingFileHandler(
        f"{log_dir}/api.log",
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    
    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
```

#### 7.2 Performance Optimization
1. Implement connection pooling for database
2. Add Redis caching for frequently accessed data
3. Use CDN for static assets
4. Enable gzip compression in IIS
5. Implement API rate limiting

#### 7.3 Security Hardening
1. Enable HTTPS with proper certificates
2. Implement CORS properly
3. Add request validation and sanitization
4. Set up API key authentication if needed
5. Regular security audits

## Risk Mitigation

### Technical Risks
1. **Cross-domain authentication issues**
   - Mitigation: Test thoroughly in dev environment
   - Fallback: Implement service account authentication

2. **Performance degradation**
   - Mitigation: Load testing before cutover
   - Fallback: Scale backend horizontally

3. **Data integrity during migration**
   - Mitigation: Implement comprehensive transaction handling
   - Fallback: Database backup and restore procedures

### Operational Risks
1. **User training**
   - Mitigation: UI remains identical
   - Documentation: Update any user guides

2. **Deployment complexity**
   - Mitigation: Automated deployment scripts
   - Fallback: Manual deployment procedures

## Timeline Estimate

- **Phase 1**: 1 week - Project setup
- **Phase 2**: 3 weeks - Backend development
- **Phase 3**: 2 weeks - Frontend migration
- **Phase 4**: 1 week - Deployment setup
- **Phase 5**: 1 week - Testing
- **Phase 6**: 1 week - Migration execution
- **Phase 7**: Ongoing - Post-migration optimization

**Total**: 9 weeks for complete migration

## Success Criteria

1. All existing functionality works identically
2. No performance degradation (response times ≤ current)
3. Successful cross-domain authentication
4. All tests passing (>90% coverage)
5. Zero data loss during migration
6. Minimal downtime during cutover (<1 hour)

## Conclusion

This migration plan provides a structured approach to converting the RSI Admin Portal from Next.js to a FastAPI + React architecture. The separated backend/frontend architecture will provide better scalability, easier maintenance, and align with Windows Server deployment best practices while maintaining all current functionality and user experience.