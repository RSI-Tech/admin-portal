#!/usr/bin/env python
"""Debug script to test user update functionality"""

import json
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.schemas.user import UserUpdate
from pydantic import ValidationError

def test_user_update():
    """Test updating a user to see what might be causing the error"""
    
    print("=== Testing User Update ===\n")
    
    # Test data that might be sent from frontend
    test_data = {
        "USER_ID": "test.user",
        "FIRST_NAME": "Test",
        "LAST_NAME": "User", 
        "STATUS": "Active",
        "UPDATED_BY": "SYSTEM",
        "EMAIL_ADDRESS": "test@example.com"
    }
    
    print("1. Testing Pydantic validation...")
    try:
        user_update = UserUpdate(**test_data)
        print("✓ Pydantic validation passed")
        print(f"   Validated data: {user_update.dict()}")
    except ValidationError as e:
        print("✗ Pydantic validation failed:")
        print(f"   {e}")
        return
    
    print("\n2. Testing database connection...")
    try:
        with next(get_db()) as conn:
            cursor = conn.cursor()
            print("✓ Database connection successful")
            
            # Test a simple query first
            cursor.execute("SELECT TOP 1 USER_KEY, USER_ID FROM USERS")
            result = cursor.fetchone()
            print(f"   Sample user: USER_KEY={result[0]}, USER_ID={result[1]}")
            
    except Exception as e:
        print("✗ Database connection failed:")
        print(f"   {e}")
        return
    
    print("\n3. Testing user update query...")
    try:
        with next(get_db()) as conn:
            cursor = conn.cursor()
            
            # Get the first user to test with
            cursor.execute("SELECT TOP 1 USER_KEY FROM USERS")
            user_key = cursor.fetchone()[0]
            print(f"   Testing with USER_KEY: {user_key}")
            
            # Build update query like the API does
            update_data = {k: v for k, v in test_data.items() if v is not None}
            set_clauses = [f"{field} = ?" for field in update_data.keys()]
            set_clauses.append("UPDATED_DATE = GETDATE()")
            
            query = f"""
            UPDATE USERS
            SET {', '.join(set_clauses)}
            WHERE USER_KEY = ?
            """
            
            values = list(update_data.values()) + [user_key]
            
            print(f"   Query: {query}")
            print(f"   Values: {values}")
            
            # Execute the query (but rollback to not actually change data)
            cursor.execute(query, values)
            print(f"   ✓ Query executed successfully, {cursor.rowcount} row(s) affected")
            
            # Rollback to not actually update the data
            conn.rollback()
            print("   ✓ Changes rolled back (test mode)")
            
    except Exception as e:
        print("✗ Update query failed:")
        print(f"   Error: {e}")
        print(f"   Type: {type(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_user_update()