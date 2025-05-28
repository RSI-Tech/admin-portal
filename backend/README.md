# RSI Admin Portal - Backend (FastAPI)

## Setup

1. Install Python 3.11+
2. Create virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment:
   - Copy `.env.example` to `.env` (if exists)
   - Ensure `connection.json` is present with database configs

5. Run development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Testing

```bash
pytest
```

## Deployment

See main migration.md for Windows Server deployment options.