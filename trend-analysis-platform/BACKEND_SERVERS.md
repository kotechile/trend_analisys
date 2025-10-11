# Backend Servers Guide

## ✅ MAIN SERVER (Use This One)

**File:** `backend/minimal_main.py`  
**Command:** `python3 backend/minimal_main.py`  
**URL:** http://localhost:8000  
**Docs:** http://localhost:8000/docs  

This is the **primary backend server** for the TrendTap application. It provides all necessary endpoints including:
- Content ideas management (`/api/content-ideas/*`)
- Research topics (`/api/research-topics/*`) 
- Trend analysis (`/api/trend-analysis/*`)
- AHREFS integration (`/api/ahrefs/*`)
- And more...

## ⚠️ DEPRECATED SERVERS (Don't Use These)

### `supabase_backend_server.py`
- **Status:** DEPRECATED
- **Reason:** Only provides topic decomposition and affiliate research endpoints
- **Missing:** Content ideas API endpoints

### `real_backend_server.py` 
- **Status:** DEPRECATED
- **Reason:** Limited functionality
- **Missing:** Most API endpoints

## Quick Start

1. **Start the main backend:**
   ```bash
   cd trend-analysis-platform
   python3 backend/minimal_main.py
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Troubleshooting

If you get "address already in use" error:
```bash
# Kill any process on port 8000
lsof -ti:8000 | xargs kill -9

# Then start the main server
python3 backend/minimal_main.py
```

