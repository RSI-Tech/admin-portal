from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pyodbc
import json
from datetime import datetime

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://yourserver"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    with open('connection.json', 'r') as f:
        config = json.load(f)
        env = config['environments'][config['current_env']]
    
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={env['server']};"
        f"DATABASE={env['database']};"
        f"UID={env['username']};"
        f"PWD={env['password']};"
        f"TrustServerCertificate=yes;"
    )
    return pyodbc.connect(conn_str)

# Pydantic models
class User(BaseModel):
    USER_KEY: int
    USER_ID: str
    FIRST_NAME: str
    LAST_NAME: str
    EMAIL_ADDRESS: Optional[str] = None
    STATUS: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

class Environment(BaseModel):
    current: str
    name: str
    available: List[str]

# API Endpoints
@app.get("/api/users", response_model=List[User])
async def get_users():
    """Get all users"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT USER_KEY, USER_ID, FIRST_NAME, LAST_NAME, EMAIL_ADDRESS, STATUS
        FROM USERS
        ORDER BY USER_ID
    """)
    
    users = []
    for row in cursor.fetchall():
        users.append({
            "USER_KEY": row.USER_KEY,
            "USER_ID": row.USER_ID,
            "FIRST_NAME": row.FIRST_NAME,
            "LAST_NAME": row.LAST_NAME,
            "EMAIL_ADDRESS": row.EMAIL_ADDRESS,
            "STATUS": row.STATUS
        })
    
    conn.close()
    return users

@app.get("/api/users/{user_key}")
async def get_user(user_key: int):
    """Get single user by key"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM USERS WHERE USER_KEY = ?
    """, user_key)
    
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert row to dictionary
    columns = [column[0] for column in cursor.description]
    user = dict(zip(columns, row))
    
    conn.close()
    return user

@app.patch("/api/users/{user_key}/status")
async def update_user_status(user_key: int, status_update: StatusUpdate):
    """Update user status"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE USERS 
        SET STATUS = ?, UPDATED_DATE = GETDATE()
        WHERE USER_KEY = ?
    """, status_update.status, user_key)
    
    conn.commit()
    conn.close()
    
    return {"message": "Status updated successfully"}

@app.get("/api/environment", response_model=Environment)
async def get_environment():
    """Get current environment info"""
    with open('connection.json', 'r') as f:
        config = json.load(f)
    
    return {
        "current": config['current_env'],
        "name": config['environments'][config['current_env']]['name'],
        "available": list(config['environments'].keys())
    }

@app.post("/api/environment")
async def switch_environment(env: dict):
    """Switch to different environment"""
    new_env = env.get('environment')
    
    with open('connection.json', 'r') as f:
        config = json.load(f)
    
    if new_env not in config['environments']:
        raise HTTPException(status_code=400, detail="Invalid environment")
    
    config['current_env'] = new_env
    
    with open('connection.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    return {"message": "Environment switched successfully"}

@app.get("/api/profiles")
async def get_profiles():
    """Get available profiles"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT DISTINCT PROFILE_ID FROM USER_TO_PROFILE ORDER BY PROFILE_ID")
    profiles = [row[0] for row in cursor.fetchall()]
    
    conn.close()
    return {"profiles": profiles}

# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000