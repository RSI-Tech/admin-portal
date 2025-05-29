#!/usr/bin/env python
"""Diagnostic script to check Python path and module issues"""

import os
import sys

print("=== Python Path Diagnostic ===\n")

print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print(f"\nPython path (sys.path):")
for i, path in enumerate(sys.path):
    print(f"  {i}: {path}")

print("\n=== Checking directory structure ===")
print("Files in current directory:")
for item in os.listdir('.'):
    print(f"  - {item}")

if os.path.exists('app'):
    print("\nFiles in 'app' directory:")
    for item in os.listdir('app'):
        print(f"  - {item}")
    
    if os.path.exists('app/main.py'):
        print("\n✓ app/main.py exists")
    else:
        print("\n✗ app/main.py NOT FOUND")
else:
    print("\n✗ 'app' directory NOT FOUND")

print("\n=== Trying to import app.main ===")
try:
    import app.main
    print("✓ Successfully imported app.main")
    print(f"  Location: {app.main.__file__}")
except ImportError as e:
    print(f"✗ Failed to import app.main: {e}")

print("\n=== Trying to import app ===")
try:
    import app
    print("✓ Successfully imported app")
    print(f"  Location: {app.__file__}")
except ImportError as e:
    print(f"✗ Failed to import app: {e}")

print("\n=== Checking virtual environment ===")
if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
    print("✓ Running in a virtual environment")
    print(f"  Virtual env: {sys.prefix}")
else:
    print("✗ Not running in a virtual environment")

print("\n=== Installed packages ===")
try:
    import pkg_resources
    installed_packages = [d.project_name for d in pkg_resources.working_set]
    key_packages = ['fastapi', 'uvicorn', 'pyodbc', 'pydantic']
    for package in key_packages:
        if package in installed_packages:
            print(f"✓ {package} is installed")
        else:
            print(f"✗ {package} is NOT installed")
except:
    print("Could not check installed packages")