# DataForSEO API Troubleshooting Guide 🔧

## Issues Found and Fixed

### 1. **Wrong API Endpoints** ❌ → ✅
**Problem**: Code was using `/dataforseo_labs/google/trends/explore/live`
**Solution**: Changed to `/keywords_data/google_trends/explore/live` (matches your working curl example)

### 2. **Incorrect Request Format** ❌ → ✅
**Problem**: Request data didn't match DataForSEO API specification
**Solution**: Updated to match your working curl example format:
```json
[{
    "location_name": "United States",
    "date_from": "2019-01-01",
    "date_to": "2020-01-01",
    "type": "youtube",
    "category_code": 3,
    "keywords": ["rugby", "cricket"]
}]
```

### 3. **Authentication Issues** ❌ → ✅
**Problem**: Basic auth implementation may not have been correct
**Solution**: Ensured proper base64 encoding of `login:password` format

### 4. **URL Construction** ❌ → ✅
**Problem**: URL construction had issues with leading slashes
**Solution**: Fixed URL construction to handle endpoints properly

## Files Updated

### 1. `functional_dataforseo_router.py`
- ✅ Fixed API endpoint: `/keywords_data/google_trends/explore/live`
- ✅ Updated request format to match your working example
- ✅ Improved authentication handling
- ✅ Added better logging for debugging

### 2. `api_integration.py`
- ✅ Fixed API endpoint: `/keywords_data/google_trends/explore/live`
- ✅ Updated request format to match DataForSEO specification
- ✅ Fixed array format for request data

## Testing Your Fix

### Option 1: Test with Your Working Credentials
```bash
# Update the credentials in test_curl_format.py
python test_curl_format.py
```

### Option 2: Test Through Your API
```bash
# Test the trend analysis endpoint
curl -X GET "http://localhost:8000/api/v1/trend-analysis/dataforseo?subtopics=rugby,cricket&location=United%20States&time_range=12m"
```

### Option 3: Test Sandbox
```bash
# Test with sandbox credentials
curl -X GET "http://localhost:8000/api/v1/dataforseo/health"
```

## Expected Results

### ✅ Success Indicators
- **Status Code**: 200
- **Response Structure**: Contains `tasks` array
- **Task Status**: `status_code: 20000` (success)
- **Data**: Either real data (production) or dummy data (sandbox)

### ❌ Common Issues
- **401 Unauthorized**: Check your API credentials in Supabase
- **404 Not Found**: Check the base URL configuration
- **400 Bad Request**: Check the request format matches DataForSEO spec

## Debugging Steps

### 1. Check Your Supabase Configuration
```sql
SELECT key_name, provider, base_url, is_active 
FROM api_keys 
WHERE provider = 'dataforseo' AND is_active = true;
```

### 2. Verify API Credentials Format
Your `key_value` should be base64 encoded `login:password`:
```python
import base64
login = "your_login"
password = "your_password"
key_value = base64.b64encode(f"{login}:{password}".encode()).decode()
```

### 3. Test Direct API Call
Use the test scripts to verify your credentials work:
```bash
python test_curl_format.py
```

### 4. Check Server Logs
Look for these log messages:
- `Making DataForSEO API request to: [URL]`
- `DataForSEO API response status: [STATUS]`
- `DataForSEO API response: [RESPONSE]`

## Configuration Checklist

- [ ] API credentials stored in Supabase `api_keys` table
- [ ] `key_value` is base64 encoded `login:password`
- [ ] `base_url` is correct (production or sandbox)
- [ ] `is_active` is `true`
- [ ] Server can access Supabase database
- [ ] Network allows outbound HTTPS requests

## Next Steps

1. **Test the fixes** using the provided test scripts
2. **Verify credentials** are correctly stored in Supabase
3. **Check server logs** for any remaining issues
4. **Test with real data** once basic connectivity is confirmed

## Support

If you're still having issues:
1. Check the server logs for detailed error messages
2. Verify your DataForSEO account has API access
3. Test with the provided curl format to isolate the issue
4. Ensure your network allows outbound HTTPS requests to DataForSEO

The fixes should resolve the API call issues you were experiencing! 🚀
