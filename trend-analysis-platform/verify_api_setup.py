#!/usr/bin/env python3
"""
Verify DataForSEO API Setup

This script helps verify that your DataForSEO API credentials are properly set up
and provides instructions for testing the integration.
"""

def print_verification_steps():
    """Print step-by-step verification instructions"""
    
    print("🔍 DataForSEO API Setup Verification")
    print("=" * 50)
    print()
    
    print("1. ✅ API Credentials Added")
    print("   You mentioned you've added DataForSEO sandbox credentials to your api_keys table.")
    print("   This should include:")
    print("   - key_name: 'dataforseo_sandbox' (or similar)")
    print("   - key_value: 'your_sandbox_api_key'")
    print("   - provider: 'dataforseo'")
    print("   - base_url: 'https://api.dataforseo.com/v3'")
    print("   - is_active: true")
    print()
    
    print("2. 🔧 Create DataForSEO Tables")
    print("   Run this SQL in your Supabase SQL Editor:")
    print("   " + "─" * 50)
    print("   -- Copy and paste the entire content from:")
    print("   -- supabase/migrations/20240115000005_create_dataforseo_tables_remote.sql")
    print("   " + "─" * 50)
    print()
    
    print("3. 🧪 Test API Integration")
    print("   Once tables are created, you can test with:")
    print("   python test_dataforseo_api.py")
    print()
    
    print("4. 🚀 Available Endpoints")
    print("   After setup, these endpoints will be available:")
    print("   - GET  /api/v1/trend-analysis/dataforseo")
    print("   - POST /api/v1/trend-analysis/dataforseo/compare")
    print("   - POST /api/v1/trend-analysis/dataforseo/suggestions")
    print("   - POST /api/v1/keyword-research/dataforseo")
    print("   - POST /api/v1/keyword-research/dataforseo/prioritize")
    print()

def print_api_test_example():
    """Print example API test"""
    
    print("📝 Example API Test")
    print("=" * 30)
    print()
    print("Once your backend is running, test with curl:")
    print()
    print("# Test trend analysis")
    print("curl -X GET 'http://localhost:8000/api/v1/trend-analysis/dataforseo' \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '{\"subtopics\": [\"artificial intelligence\"], \"location\": \"United States\", \"time_range\": \"12m\"}'")
    print()
    print("# Test keyword research")
    print("curl -X POST 'http://localhost:8000/api/v1/keyword-research/dataforseo' \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '{\"seed_keywords\": [\"AI tools\"], \"max_difficulty\": 50, \"max_keywords\": 20}'")
    print()

def print_troubleshooting():
    """Print troubleshooting tips"""
    
    print("🔧 Troubleshooting")
    print("=" * 20)
    print()
    print("If you encounter issues:")
    print()
    print("1. Check API Key Format:")
    print("   - Ensure your DataForSEO key is valid")
    print("   - Sandbox keys usually start with specific prefixes")
    print("   - Verify the key is active in your DataForSEO dashboard")
    print()
    print("2. Check Database Connection:")
    print("   - Verify your Supabase project is active")
    print("   - Check that the api_keys table has the correct data")
    print("   - Ensure the DataForSEO tables were created successfully")
    print()
    print("3. Check Backend Configuration:")
    print("   - Verify your backend can connect to Supabase")
    print("   - Check environment variables are set correctly")
    print("   - Look at backend logs for detailed error messages")
    print()

def main():
    """Main function"""
    print_verification_steps()
    print()
    print_api_test_example()
    print()
    print_troubleshooting()
    
    print("🎯 Next Action")
    print("=" * 15)
    print("Run the DataForSEO table migration in your Supabase SQL Editor,")
    print("then test the API integration!")

if __name__ == "__main__":
    main()
