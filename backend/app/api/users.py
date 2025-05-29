from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
import pyodbc
import logging
from app.database import get_db, row_to_dict
from app.schemas.user import (
    User, UserCreate, UserUpdate, UserList, 
    UserStatusUpdate, UserFilter
)
from app.core.field_config import get_field_defaults

router = APIRouter(prefix="/users", tags=["users"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=UserList)
async def get_users(
    search: Optional[str] = Query(None, description="Search term for user fields"),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    profile_id: Optional[str] = Query(None, description="Filter by profile ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    conn: pyodbc.Connection = Depends(get_db)
):
    """Get all users with optional filtering"""
    try:
        cursor = conn.cursor()
        
        # Build base query
        base_query = """
        SELECT u.*
        FROM USERS u
        WHERE 1=1
        """
        params = []
        
        # Add search filter
        if search:
            search_term = f"%{search}%"
            base_query += """ AND (
                u.USER_ID LIKE ? OR
                u.FIRST_NAME LIKE ? OR
                u.LAST_NAME LIKE ? OR
                u.EMAIL_ADDRESS LIKE ? OR
                u.EMPLOYEE_ID LIKE ?
            )"""
            # Add search_term 5 times for each LIKE clause
            params.extend([search_term] * 5)
        
        # Add user type filter
        if user_type:
            base_query += " AND u.USER_TYPE = ?"
            params.append(user_type)
        
        # Add status filter
        if status:
            base_query += " AND u.STATUS = ?"
            params.append(status)
        
        # Add profile filter
        if profile_id:
            base_query += """
                AND EXISTS (
                    SELECT 1 FROM USER_TO_PROFILE up 
                    WHERE up.USER_KEY = u.USER_KEY 
                    AND up.PROFILE_ID = ?
                )
            """
            params.append(profile_id)
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM ({base_query}) as filtered"
        cursor.execute(count_query, params)
        result = cursor.fetchone()
        total = result[0] if result else 0
        
        # Add pagination
        base_query += " ORDER BY u.USER_KEY DESC"
        base_query += " OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        params.extend([skip, limit])
        
        # Execute main query
        cursor.execute(base_query, params)
        rows = cursor.fetchall()
        
        # Convert rows to dictionaries
        users = [row_to_dict(cursor, row) for row in rows]
        
        return UserList(users=users, total=total)
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching users")


@router.get("/{user_key}", response_model=User)
async def get_user(
    user_key: int,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Get a single user by USER_KEY"""
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM USERS WHERE USER_KEY = ?", (user_key,))
        row = cursor.fetchone()
        user = row_to_dict(cursor, row)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user {user_key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching user")


@router.post("/", response_model=User, status_code=201)
async def create_user(
    user_data: UserCreate,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Create a new user"""
    try:
        cursor = conn.cursor()
        
        # Check for duplicate USER_ID
        cursor.execute("SELECT USER_KEY FROM USERS WHERE USER_ID = ?", (user_data.USER_ID,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail=f"User with USER_ID '{user_data.USER_ID}' already exists"
            )
        
        # Prepare data with defaults
        data = user_data.dict()
        defaults = get_field_defaults()
        
        # Apply defaults for None values
        for field, default_value in defaults.items():
            if field in data and data[field] is None:
                data[field] = default_value
        
        # Build insert query
        fields = [k for k, v in data.items() if v is not None]
        values = [data[k] for k in fields]
        
        # Add system fields
        fields.extend(["UPDATED_DATE", "EFFECTIVE_BEGIN_DT"])
        values.extend(["GETDATE()", "GETDATE()"])
        
        placeholders = ["?" if i < len(data) else f"{v}" for i, v in enumerate(values)]
        
        query = f"""
        INSERT INTO USERS ({', '.join(fields)})
        OUTPUT INSERTED.*
        VALUES ({', '.join(placeholders)})
        """
        
        cursor.execute(query, values[:len(data)])
        row = cursor.fetchone()
        new_user = row_to_dict(cursor, row)
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating user")


@router.put("/{user_key}", response_model=User)
async def update_user(
    user_key: int,
    user_data: UserUpdate,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Update an existing user"""
    try:
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT USER_KEY FROM USERS WHERE USER_KEY = ?", (user_key,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Build update query with only provided fields
        update_data = {k: v for k, v in user_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Apply defaults for specific fields
        defaults = get_field_defaults()
        for field, default_value in defaults.items():
            if field in update_data and update_data[field] is None:
                update_data[field] = default_value
        
        # Build SET clause
        set_clauses = [f"{field} = ?" for field in update_data.keys()]
        set_clauses.append("UPDATED_DATE = GETDATE()")
        
        query = f"""
        UPDATE USERS
        SET {', '.join(set_clauses)}
        OUTPUT INSERTED.*
        WHERE USER_KEY = ?
        """
        
        values = list(update_data.values()) + [user_key]
        cursor.execute(query, values)
        
        row = cursor.fetchone()
        updated_user = row_to_dict(cursor, row)
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user")


@router.patch("/{user_key}/status", response_model=Dict[str, Any])
async def update_user_status(
    user_key: int,
    status_update: UserStatusUpdate,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Update user status (Active/Inactive toggle)"""
    try:
        cursor = conn.cursor()
        
        # Update status
        cursor.execute("""
            UPDATE USERS
            SET STATUS = ?, UPDATED_DATE = GETDATE()
            WHERE USER_KEY = ?
        """, (status_update.status, user_key))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": f"User status updated to {status_update.status}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user status for {user_key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user status")


@router.post("/{user_key}/migrate", response_model=Dict[str, Any])
async def migrate_user(
    user_key: int,
    target_env: str,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Migrate user to another environment"""
    # This is a placeholder - actual implementation would need
    # connections to multiple environments
    raise HTTPException(
        status_code=501,
        detail="User migration between environments not yet implemented"
    )


@router.delete("/{user_key}", status_code=204)
async def delete_user(
    user_key: int,
    conn: pyodbc.Connection = Depends(get_db)
):
    """Delete a user (soft delete by setting status to Inactive)"""
    try:
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE USERS
            SET STATUS = 'Inactive', UPDATED_DATE = GETDATE()
            WHERE USER_KEY = ?
        """, (user_key,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user {user_key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting user")