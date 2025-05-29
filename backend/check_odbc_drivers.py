#!/usr/bin/env python
"""Check available ODBC drivers on Windows"""

import pyodbc
import platform

print("=== ODBC Driver Check ===\n")
print(f"Platform: {platform.system()} {platform.release()}")
print(f"Python: {platform.python_version()}")
print(f"pyodbc: {pyodbc.version}\n")

print("Available ODBC Drivers:")
drivers = pyodbc.drivers()

if drivers:
    for i, driver in enumerate(drivers, 1):
        print(f"  {i}. {driver}")
        # Check if it's a SQL Server driver
        if "SQL Server" in driver:
            print(f"     ✓ This is a SQL Server driver")
else:
    print("  ❌ No ODBC drivers found!")
    print("\nTo install SQL Server ODBC Driver:")
    print("  1. Download from: https://go.microsoft.com/fwlink/?linkid=2249004")
    print("  2. Run the installer as Administrator")
    print("  3. Restart this script")

print("\n=== Testing Connection String ===")
print("Expected driver name: 'ODBC Driver 17 for SQL Server'")

if "ODBC Driver 17 for SQL Server" in drivers:
    print("✓ Required driver is installed")
else:
    print("❌ Required driver NOT found")
    print("\nAvailable SQL Server drivers:")
    sql_drivers = [d for d in drivers if "SQL Server" in d]
    if sql_drivers:
        for driver in sql_drivers:
            print(f"  - {driver}")
        print(f"\nYou can use '{sql_drivers[0]}' instead")
    else:
        print("  None found - please install ODBC Driver")