# Windows Deployment - Python Version Issue

## Problem
You're encountering an error installing pydantic-core because Python 3.14 is too new and doesn't have pre-built wheels. The package is trying to compile from source, which requires Rust.

## Solutions

### Option 1: Use Python 3.12 (Recommended)

1. **Uninstall Python 3.14**
   - Go to Control Panel > Programs > Uninstall a program
   - Find Python 3.14 and uninstall it

2. **Install Python 3.12**
   - Download from: https://www.python.org/downloads/release/python-31211/
   - Choose "Windows installer (64-bit)"
   - During installation, check "Add Python to PATH"

3. **Verify installation**
   ```powershell
   python --version
   # Should show: Python 3.12.x
   ```

4. **Reinstall dependencies**
   ```powershell
   cd C:\path\to\admin-portal\backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Option 2: Use Latest Package Versions (Experimental)

If you must use Python 3.14, try the newer package versions:

```powershell
cd C:\path\to\admin-portal\backend
venv\Scripts\activate
pip install -r requirements-py314.txt
```

### Option 3: Install Visual Studio Build Tools (Not Recommended)

If you want to compile from source:

1. Download Visual Studio 2022 Build Tools
2. Install with C++ build tools
3. Install Rust: https://rustup.rs/
4. Then retry: `pip install -r requirements.txt`

## Verification

After successful installation:

```powershell
# Test imports
python -c "import fastapi; import pyodbc; print('All packages installed successfully!')"

# Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Why This Happens

- Python 3.14 is very new (alpha/beta stage)
- Most packages don't provide pre-built wheels for it yet
- Without wheels, pip tries to compile from source
- Compiling pydantic-core requires Rust and C++ build tools

## Best Practice

For production servers, use stable Python versions:
- **Python 3.12** (recommended - best balance of features and stability)
- Python 3.11 (alternative - mature and well-supported)
- Avoid Python 3.13+ until packages have better support