@echo off
REM Windows batch script to run the FastAPI server

echo Starting Admin Portal Backend...
echo.

REM Set the Python path to include the backend directory
set PYTHONPATH=%CD%

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Run the server
echo Running FastAPI server on http://localhost:8000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause