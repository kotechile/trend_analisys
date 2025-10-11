# Affiliate Search Debug Solution

## Problem Identified

The affiliate search functionality in the frontend is not working because:

1. **Backend server not running**: The main backend server (port 8000) is not starting due to missing dependencies or configuration issues
2. **Port conflicts**: Port 8000 is being used by Docker, preventing the backend from starting
3. **API endpoint mismatches**: Some frontend components are calling different endpoints

## Root Cause Analysis

### 1. Backend Server Issues
- The main backend server requires FastAPI and other dependencies that aren't properly installed
- Port 8000 is occupied by Docker, preventing the server from starting
- Missing environment variables or configuration files

### 2. Frontend API Calls
- Multiple frontend components are calling different endpoints:
  - `http://localhost:8000/api/affiliate-research/search` (main endpoint)
  - `http://localhost:8001/api/affiliate-research/search` (alternative endpoint)
  - `http://localhost:8000/api/affiliate/research` (different endpoint structure)

### 3. Network Connectivity
- Frontend is making requests to non-responsive endpoints
- No error handling for failed requests
- CORS issues potentially blocking requests

## Solutions Implemented

### 1. Mock Server (Immediate Fix)
Created a simple mock server that works without external dependencies:

```bash
# Start the mock server
python simple_mock_server.py 8001
```

**Features:**
- Uses only Python standard library
- Provides realistic mock data
- Handles CORS properly
- Responds to affiliate search requests

### 2. Debug Tools
Created comprehensive debugging tools:

- `debug_affiliate_search.html` - Interactive debugging interface
- Tests multiple endpoints and configurations
- Provides detailed error information
- Network request debugging

### 3. Frontend Configuration Fixes

#### Option A: Use Mock Server (Quick Fix)
Update frontend components to use the mock server:

```javascript
// Change API base URL to use mock server
const API_BASE_URL = 'http://localhost:8001';
```

#### Option B: Fix Backend Server (Proper Fix)
1. Install missing dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Use a different port:
```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
```

3. Update frontend configuration to use the correct port.

## Testing the Solution

### 1. Test Mock Server
```bash
# Start mock server
python simple_mock_server.py 8001

# Test the endpoint
curl -X POST http://localhost:8001/api/affiliate-research/search \
  -H "Content-Type: application/json" \
  -d '{"search_term": "fishing gear", "niche": "outdoor recreation"}'
```

### 2. Test Frontend Integration
1. Open `debug_affiliate_search.html` in browser
2. Click "Test Affiliate Search" button
3. Verify the response contains affiliate programs

### 3. Update Frontend Components
Update the following files to use the working endpoint:

- `frontend/src/pages/AffiliateResearchUpdated.tsx`
- `frontend/src/App.tsx`
- `frontend/src/App.working.tsx`

Change the API URL from `http://localhost:8000` to `http://localhost:8001`.

## Long-term Solutions

### 1. Fix Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
```

### 2. Environment Configuration
Create proper `.env` file with required environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=redis://localhost:6379
```

### 3. Docker Configuration
If using Docker, ensure proper port mapping and service configuration.

## Verification Steps

1. **Mock Server Test**: Verify mock server responds correctly
2. **Frontend Integration**: Test affiliate search in frontend
3. **Error Handling**: Ensure proper error messages are displayed
4. **Network Debugging**: Use browser dev tools to verify requests

## Files Created/Modified

1. `simple_mock_server.py` - Mock server for testing
2. `debug_affiliate_search.html` - Debugging interface
3. `test_affiliate_server.py` - FastAPI-based test server
4. `AFFILIATE_SEARCH_DEBUG_SOLUTION.md` - This documentation

## Next Steps

1. **Immediate**: Use the mock server to test frontend functionality
2. **Short-term**: Fix backend dependencies and configuration
3. **Long-term**: Implement proper error handling and monitoring

The affiliate search should now work with the mock server, and you can gradually migrate to the full backend implementation.

