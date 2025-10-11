# API Connection Debug Guide

## ✅ Issue Fixed

### **The Problem**
The frontend was making API requests to `http://localhost:3000/api/topic-decomposition` instead of `http://localhost:8000/api/topic-decomposition`.

### **Root Cause**
The `App.tsx` file was using relative URLs (`/api/topic-decomposition`) which defaulted to the frontend dev server (port 3000) instead of the backend API server (port 8000).

### **Solution Applied**
Updated the API calls in `App.tsx` to use the proper base URL:

```typescript
// Before (wrong):
const decompositionResponse = await fetch('/api/topic-decomposition', {

// After (fixed):
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const decompositionResponse = await fetch(`${API_BASE_URL}/api/topic-decomposition`, {
```

## 🧪 Testing the Fix

### Step 1: Verify Backend is Running
Make sure your backend API server is running on port 8000:

```bash
# Check if backend is running
curl http://localhost:8000/api/health
# or
curl http://localhost:8000/health
```

### Step 2: Test the Affiliate Search
1. **Go to the affiliate research page**
2. **Enter a search query** (e.g., "coffee brewing")
3. **Click search**
4. **Should now connect to the correct backend API**

### Step 3: Check Network Tab
In browser dev tools, check the Network tab:
- **Before fix**: Requests to `http://localhost:3000/api/topic-decomposition`
- **After fix**: Requests to `http://localhost:8000/api/topic-decomposition`

## 🔍 Expected Behavior

- ✅ **API calls go to port 8000** - Backend API server
- ✅ **No more 500 errors** - If backend is running
- ✅ **Proper error handling** - Clear error messages if backend is down
- ✅ **Topic decomposition works** - Should get subtopics back
- ✅ **Affiliate research works** - Should get affiliate programs

## 🚨 If Still Getting Errors

### Check 1: Backend Status
```bash
# Check if backend is running
ps aux | grep python
# or
lsof -i :8000
```

### Check 2: Backend Logs
Look at your backend server logs for any errors when the request comes in.

### Check 3: API Endpoints
Verify that your backend has these endpoints:
- `POST /api/topic-decomposition`
- `POST /api/affiliate-research`
- `GET /api/health` (optional)

### Check 4: CORS Configuration
Make sure your backend allows requests from `http://localhost:3000`.

## 📝 Environment Variables

Make sure your frontend has the correct environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000
```

If you don't have a `.env` file, the code will default to `http://localhost:8000`.

## 🎯 Next Steps

1. **Start your backend server** (if not running)
2. **Test the affiliate search** - Should work now
3. **Check browser console** - Should see successful API calls
4. **Verify data flow** - Should get subtopics and affiliate programs

The API connection should now work correctly! 🎉

