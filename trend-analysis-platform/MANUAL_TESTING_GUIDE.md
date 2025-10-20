# Manual Testing Guide 🧪

## Quick Test Commands

### 1. **Run Complete Test Suite**
```bash
cd /Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform
python test_complete_integration.py
```

### 2. **Test Database & RLS**
```bash
# Check RLS status
python test_rls_direct.py

# Or run in Supabase SQL Editor:
# SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%dataforseo%';
```

### 3. **Test Backend API**
```bash
# Start backend
python backend/main.py

# Test endpoints (in another terminal)
curl -X GET "http://localhost:8000/api/v1/trend-analysis/dataforseo?subtopics=artificial%20intelligence&location=United%20States&time_range=12m"

curl -X POST "http://localhost:8000/api/v1/keyword-research/dataforseo" \
  -H "Content-Type: application/json" \
  -d '{"seed_keywords": ["AI tools"], "max_difficulty": 50, "max_keywords": 10}'
```

### 4. **Test Frontend**
```bash
# Start frontend
cd frontend
npm start

# Navigate to:
# - http://localhost:3000/trend-analysis-dataforseo
# - http://localhost:3000/idea-burst-dataforseo
```

## 🔍 What to Look For

### ✅ **Success Indicators**

#### Database Tests:
- All DataForSEO tables show "SECURED" status
- API credentials are found and active
- RLS policies are created

#### API Tests:
- Backend starts without errors
- API endpoints respond with 200 status
- DataForSEO API calls work (even if sandbox returns limited data)

#### Frontend Tests:
- All components exist and build successfully
- New pages load without errors
- Charts and tables display properly

### ❌ **Common Issues & Fixes**

#### Database Issues:
- **"No API credentials found"** → Add your DataForSEO key to `api_keys` table
- **"RLS not enabled"** → Run the security migration
- **"Connection failed"** → Check your database URL

#### API Issues:
- **"Backend not running"** → Start with `python backend/main.py`
- **"API call failed"** → Check DataForSEO credentials and network
- **"Authentication required"** → Add JWT token to requests

#### Frontend Issues:
- **"Component not found"** → Check file paths and imports
- **"Build failed"** → Run `npm install` and check for TypeScript errors
- **"Page not loading"** → Check routing and component exports

## 🎯 **Step-by-Step Testing**

### Step 1: Database Security
```sql
-- Run in Supabase SQL Editor
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ SECURED' ELSE '❌ UNRESTRICTED' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%dataforseo%';
```

### Step 2: API Credentials
```sql
-- Run in Supabase SQL Editor
SELECT key_name, provider, base_url, is_active 
FROM api_keys 
WHERE provider = 'dataforseo';
```

### Step 3: Backend Health
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### Step 4: DataForSEO Integration
```bash
# Test trend analysis
curl -X GET "http://localhost:8000/api/v1/trend-analysis/dataforseo?subtopics=AI&location=US&time_range=12m"

# Test keyword research  
curl -X POST "http://localhost:8000/api/v1/keyword-research/dataforseo" \
  -H "Content-Type: application/json" \
  -d '{"seed_keywords": ["machine learning"], "max_difficulty": 50}'
```

### Step 5: Frontend Pages
1. Open `http://localhost:3000/trend-analysis-dataforseo`
2. Open `http://localhost:3000/idea-burst-dataforseo`
3. Check that pages load and display data

## 🚨 **Troubleshooting**

### Backend Won't Start:
```bash
# Check Python dependencies
pip install -r backend/requirements.txt

# Check environment variables
export DATABASE_URL="your_database_url"
export SUPABASE_URL="your_supabase_url"
export SUPABASE_KEY="your_supabase_key"
```

### Frontend Won't Build:
```bash
# Install dependencies
cd frontend
npm install

# Check for TypeScript errors
npm run type-check

# Build manually
npm run build
```

### API Calls Failing:
```bash
# Check DataForSEO credentials
# Verify network connectivity
# Check API rate limits
# Review backend logs
```

## 📊 **Expected Results**

### Database:
- 4 DataForSEO tables created and secured
- RLS policies active on all tables
- API credentials configured

### Backend:
- Server starts on port 8000
- Health endpoint responds
- DataForSEO endpoints work
- Authentication required for data access

### Frontend:
- Builds successfully
- New pages load
- Components render properly
- API integration works

## 🎉 **Success!**

When all tests pass, you'll have:
- ✅ **Secure database** with RLS policies
- ✅ **Working API integration** with DataForSEO
- ✅ **Functional frontend** with new features
- ✅ **Complete end-to-end** data flow

Your DataForSEO integration is ready for production! 🚀
