# Quick Start Guide - Backend

## Windows Server Setup

### 1. Navigate to backend directory
```cmd
cd E:\admin-portal\backend
```

### 2. Set Python Path (Important!)
```cmd
set PYTHONPATH=%CD%
```

### 3. Activate virtual environment (if using one)
```cmd
venv\Scripts\activate
```

### 4. Run the server

**Option A: Using the batch file (Recommended)**
```cmd
run_server.bat
```

**Option B: Using Python directly**
```cmd
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option C: Using the Python script**
```cmd
python run_server.py
```

## Troubleshooting

### "Could not import module app.main"
This means Python can't find the app module. Solutions:

1. **Ensure you're in the backend directory:**
   ```cmd
   cd E:\admin-portal\backend
   ```

2. **Set PYTHONPATH:**
   ```cmd
   set PYTHONPATH=E:\admin-portal\backend
   ```

3. **Check directory structure:**
   ```
   backend/
   ├── app/
   │   ├── __init__.py
   │   ├── main.py
   │   └── ...
   ├── requirements.txt
   └── run_server.bat
   ```

### "No module named 'fastapi'"
Install dependencies:
```cmd
pip install -r requirements.txt
```

### Port 8000 already in use
Find and kill the process:
```cmd
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

## Verify Installation

1. **Check API docs:** http://localhost:8000/docs
2. **Check health endpoint:** http://localhost:8000/
3. **Check API response:** http://localhost:8000/api/environment

## Development Tips

- The `--reload` flag enables hot reloading
- Logs appear in the console
- Press Ctrl+C to stop the server
- Check `logs/` directory for detailed logs