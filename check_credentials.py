#!/usr/bin/env python3
"""
Check DataForSEO credentials in Supabase database
"""

import asyncio
import os
from supabase import create_client, Client

async def check_credentials():
    # Supabase configuration
    url = "https://dgcsqiaciyqvprtpopxg.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTQ3NTk5MywiZXhwIjoyMDMxMDUxOTkzfQ.wXVY743o8sX2waD03EenpvTjAdmrwT4eEt6lgWIMaC0"
    
    # Create Supabase client
    supabase: Client = create_client(url, key)
    
    try:
        # Query api_keys table
        result = supabase.table("api_keys").select("provider, is_active, base_url, user_name, password").eq("provider", "dataforseo").execute()
        
        print("DataForSEO credentials in database:")
        print("=" * 50)
        
        if result.data:
            for row in result.data:
                print(f"Provider: {row.get('provider')}")
                print(f"Active: {row.get('is_active')}")
                print(f"Base URL: {row.get('base_url')}")
                print(f"User Name: {row.get('user_name', 'NOT SET')}")
                print(f"Password: {'SET' if row.get('password') else 'NOT SET'}")
                print("-" * 30)
        else:
            print("No DataForSEO credentials found in database")
            
        # Check all providers
        print("\nAll API keys in database:")
        print("=" * 50)
        all_result = supabase.table("api_keys").select("provider, is_active, base_url").execute()
        
        if all_result.data:
            for row in all_result.data:
                print(f"Provider: {row.get('provider')}, Active: {row.get('is_active')}, Base URL: {row.get('base_url')}")
        else:
            print("No API keys found in database")
            
    except Exception as e:
        print(f"Error checking credentials: {e}")

if __name__ == "__main__":
    asyncio.run(check_credentials())
