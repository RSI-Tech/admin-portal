#!/usr/bin/env python
"""Check for missing files in the backend directory"""

import os

# List of required files for the backend to work
REQUIRED_FILES = [
    "app/__init__.py",
    "app/main.py",
    "app/config.py",
    "app/database.py",
    "app/api/__init__.py",
    "app/api/users.py",
    "app/api/profiles.py",
    "app/api/environment.py",
    "app/core/__init__.py",
    "app/core/field_config.py",
    "app/core/logging.py",
    "app/schemas/__init__.py",
    "app/schemas/user.py",
]

print("=== Checking Required Files ===\n")

missing_files = []
existing_files = []

for file_path in REQUIRED_FILES:
    if os.path.exists(file_path):
        existing_files.append(file_path)
        print(f"✓ {file_path}")
    else:
        missing_files.append(file_path)
        print(f"✗ {file_path} - MISSING!")

print(f"\n=== Summary ===")
print(f"Existing files: {len(existing_files)}")
print(f"Missing files: {len(missing_files)}")

if missing_files:
    print(f"\n⚠️  {len(missing_files)} files are missing!")
    print("\nTo fix this issue:")
    print("1. Make sure you have the latest code:")
    print("   git pull origin domain")
    print("2. Check if files were properly checked out:")
    print("   git status")
    print("3. If files are still missing, try:")
    print("   git checkout -- .")
else:
    print("\n✅ All required files are present!")