#!/usr/bin/env python3
"""Test pyodbc installation and basic functionality"""

import pyodbc

def test_pyodbc_installation():
    """Test that pyodbc is installed and can list drivers"""
    print("Testing pyodbc installation...")
    
    # Check pyodbc version
    print(f"pyodbc version: {pyodbc.version}")
    
    # List available drivers
    print("\nAvailable ODBC drivers:")
    drivers = pyodbc.drivers()
    if drivers:
        for driver in drivers:
            print(f"  - {driver}")
    else:
        print("  No drivers found. You may need to install ODBC drivers.")
        print("\nTo install SQL Server ODBC driver on Mac:")
        print("  brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release")
        print("  brew update")
        print("  brew install msodbcsql17")
    
    return len(drivers) > 0


if __name__ == "__main__":
    success = test_pyodbc_installation()
    
    if success:
        print("\n✅ pyodbc is installed and drivers are available")
    else:
        print("\n❌ No ODBC drivers found. Please install drivers.")
        print("\nFor more information:")
        print("https://docs.microsoft.com/en-us/sql/connect/odbc/linux-mac/install-microsoft-odbc-driver-sql-server-macos")