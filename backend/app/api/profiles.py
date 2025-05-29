from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
import pyodbc
import logging
from datetime import datetime
from app.database import get_db, row_to_dict, db as database_instance

router = APIRouter(prefix="/profiles", tags=["profiles"])
logger = logging.getLogger(__name__)


class Profile(BaseModel):
    PROFILE_ID: str
    USER_COUNT: int


class UserProfile(BaseModel):
    PROFILE_ID: str
    UPDATED_DATE: datetime
    UPDATED_BY: str


class UserProfileUpdate(BaseModel):
    profile_ids: List[str]
    updated_by: str = "SYSTEM"


@router.get("/", response_model=List[Profile])
async def get_profiles(conn: pyodbc.Connection = Depends(get_db)):
    """Get all distinct profiles with user counts"""
    try:
        cursor = conn.cursor()
        
        query = """
        SELECT 
            PROFILE_ID,
            COUNT(DISTINCT USER_KEY) as USER_COUNT
        FROM USER_TO_PROFILE
        GROUP BY PROFILE_ID
        ORDER BY PROFILE_ID
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Convert rows to dictionaries
        profiles = [row_to_dict(cursor, row) for row in rows]
        
        return profiles
        
    except Exception as e:
        logger.error(f"Error fetching profiles: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching profiles")


@router.get("/users/{user_key}", response_model=List[UserProfile])
async def get_user_profiles(
    user_key: int,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Get profiles assigned to a specific user"""
    try:
        cursor = conn.cursor()
        
        query = """
        SELECT PROFILE_ID, UPDATED_DATE, UPDATED_BY
        FROM USER_TO_PROFILE
        WHERE USER_KEY = %s
        ORDER BY PROFILE_ID
        """
        
        cursor.execute(query, (user_key,))
        rows = cursor.fetchall()
        
        # Convert rows to dictionaries
        profiles = [row_to_dict(cursor, row) for row in rows]
        
        return profiles
        
    except Exception as e:
        logger.error(f"Error fetching user profiles for {user_key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching user profiles")


@router.put("/users/{user_key}", response_model=Dict[str, Any])
async def update_user_profiles(
    user_key: int,
    profile_update: UserProfileUpdate
):
    """Update profiles for a specific user (with transaction)"""
    try:
        with database_instance.transaction() as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute("SELECT USER_KEY FROM USERS WHERE USER_KEY = ?", (user_key,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="User not found")
            
            # Delete existing profiles
            cursor.execute("DELETE FROM USER_TO_PROFILE WHERE USER_KEY = ?", (user_key,))
            
            # Insert new profiles
            if profile_update.profile_ids:
                for profile_id in profile_update.profile_ids:
                    cursor.execute("""
                        INSERT INTO USER_TO_PROFILE (USER_KEY, PROFILE_ID, UPDATED_DATE, UPDATED_BY)
                        VALUES (?, ?, GETDATE(), ?)
                    """, (user_key, profile_id, profile_update.updated_by))
            
            return {
                "message": f"Updated {len(profile_update.profile_ids)} profiles for user {user_key}",
                "profile_ids": profile_update.profile_ids
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profiles for {user_key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user profiles")


@router.delete("/users/{user_key}/{profile_id}", status_code=204)
async def remove_user_profile(
    user_key: int,
    profile_id: str,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Remove a specific profile from a user"""
    try:
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM USER_TO_PROFILE 
            WHERE USER_KEY = ? AND PROFILE_ID = ?
        """, (user_key, profile_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404, 
                detail="User profile assignment not found"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing profile {profile_id} from user {user_key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error removing user profile")