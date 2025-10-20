#!/usr/bin/env python3
"""
Add test DataForSEO credentials to Supabase database
"""

import asyncio
import os
from supabase import create_client, Client

async def add_test_credentials():
    # Get Supabase credentials from environment
    url = os.getenv("SUPABASE_URL", "https://dgcsqiaciyqvprtpopxg.supabase.co")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not key:
        print("❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set")
        return
    
    # Create Supabase client
    supabase: Client = create_client(url, key)
    
    try:
        # Add test DataForSEO credentials
        test_credentials = {
            "key_name": "DataForSEO Test Credentials",
            "provider": "dataforseo",
            "is_active": True,
            "base_url": "https://api.dataforseo.com/v3",
            "user_name": "test_username",
            "password": "test_password",
            "key_value": "dGVzdF91c2VybmFtZTp0ZXN0X3Bhc3N3b3Jk"  # base64 encoded username:password
        }
        
        result = supabase.table("api_keys").insert(test_credentials).execute()
        
        if result.data:
            print("✅ Successfully added test DataForSEO credentials")
            print(f"ID: {result.data[0].get('id')}")
        else:
            print("❌ Failed to add credentials")
            
    except Exception as e:
        print(f"Error adding credentials: {e}")

if __name__ == "__main__":
    asyncio.run(add_test_credentials())
