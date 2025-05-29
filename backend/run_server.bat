@echo off
REM Windows batch script to run the FastAPI server

echo Starting Admin Portal Backend...
echo.

REM Save current directory
set BACKEND_DIR=%CD%

REM Set the Python path to include the backend directory
set PYTHONPATH=%BACKEND_DIR%
echo PYTHONPATH set to: %PYTHONPATH%
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Show current directory and Python info
echo Current directory: %CD%
python --version
echo.

REM Run diagnostics first
echo Running diagnostics...
python diagnose.py
echo.
echo Press any key to continue with server startup...
pause > nul

REM Run the server
echo Running FastAPI server on http://localhost:8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause