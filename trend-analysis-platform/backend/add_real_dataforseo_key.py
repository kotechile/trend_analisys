#!/usr/bin/env python3
"""
Add real DataForSEO API key to Supabase
"""

import os
import sys
from supabase import create_client, Client
from datetime import datetime

def add_real_dataforseo_key():
    """Add real DataForSEO API key to Supabase"""
    
    # Load Supabase credentials from environment variables
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Get API key from user input
        print("\n🔑 DataForSEO API Key Setup")
        print("=" * 50)
        print("To get your DataForSEO API key:")
        print("1. Go to: https://app.dataforseo.com/api-dashboard")
        print("2. Sign up for a free account or log in")
        print("3. Copy your API key from the dashboard")
        print("=" * 50)
        
        api_key = input("\nEnter your DataForSEO API key: ").strip()
        
        if not api_key or api_key == "YOUR_DATAFORSEO_API_KEY_HERE":
            print("❌ Invalid API key. Please provide a real DataForSEO API key.")
            return False
        
        # Update the existing DataForSEO credentials
        update_data = {
            'key_value': api_key,
            'is_active': True,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        print("\n📝 Updating DataForSEO credentials...")
        result = supabase.table("api_keys").update(update_data).eq("provider", "dataforseo").execute()
        
        if result.data:
            print("✅ DataForSEO API key updated successfully!")
            print(f"   - Provider: {result.data[0]['provider']}")
            print(f"   - Base URL: {result.data[0]['base_url']}")
            print(f"   - Active: {result.data[0]['is_active']}")
            print(f"   - Key: {api_key[:10]}...{api_key[-4:] if len(api_key) > 14 else '***'}")
        else:
            print("❌ Failed to update credentials")
            return False
        
        print("\n🎯 Next steps:")
        print("1. Test the trend analysis endpoint")
        print("2. Check the frontend to see real DataForSEO data")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = add_real_dataforseo_key()
    sys.exit(0 if success else 1)
