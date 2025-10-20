#!/usr/bin/env python3
"""
Debug API Credentials

This script helps debug the API credentials retrieval from Supabase.
"""

import os
from supabase import create_client

def debug_api_credentials():
    """Debug API credentials retrieval"""
    print("🔍 Debugging DataForSEO API Credentials")
    print("=" * 50)
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    
    print(f"SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Not set'}")
    print(f"SUPABASE_ANON_KEY: {'✅ Set' if supabase_key else '❌ Not set'}")
    
    if not supabase_url or not supabase_key:
        print("\n❌ Missing Supabase environment variables")
        print("Please set:")
        print("export SUPABASE_URL='your_supabase_url'")
        print("export SUPABASE_ANON_KEY='your_supabase_anon_key'")
        return
    
    try:
        # Connect to Supabase
        supabase = create_client(supabase_url, supabase_key)
        print("\n✅ Connected to Supabase")
        
        # Query API keys table
        print("\n🔍 Querying api_keys table...")
        result = supabase.table("api_keys").select("*").execute()
        
        print(f"Total API keys found: {len(result.data)}")
        
        if result.data:
            print("\n📋 All API keys:")
            for i, key in enumerate(result.data):
                print(f"  {i+1}. {key.get('key_name', 'N/A')} - {key.get('provider', 'N/A')} - Active: {key.get('is_active', 'N/A')}")
        
        # Query specifically for DataForSEO
        print("\n🔍 Querying for DataForSEO keys...")
        dataforseo_result = supabase.table("api_keys").select("*").eq("provider", "dataforseo").execute()
        
        print(f"DataForSEO keys found: {len(dataforseo_result.data)}")
        
        if dataforseo_result.data:
            print("\n📋 DataForSEO API keys:")
            for i, key in enumerate(dataforseo_result.data):
                print(f"  {i+1}. Name: {key.get('key_name', 'N/A')}")
                print(f"     Provider: {key.get('provider', 'N/A')}")
                print(f"     Active: {key.get('is_active', 'N/A')}")
                print(f"     Base URL: {key.get('base_url', 'N/A')}")
                print(f"     Key Value: {key.get('key_value', 'N/A')[:10]}..." if key.get('key_value') else "     Key Value: N/A")
                print()
        
        # Query for active DataForSEO keys
        print("🔍 Querying for ACTIVE DataForSEO keys...")
        active_result = supabase.table("api_keys").select("*").eq("provider", "dataforseo").eq("is_active", True).execute()
        
        print(f"Active DataForSEO keys found: {len(active_result.data)}")
        
        if active_result.data:
            print("\n✅ Active DataForSEO API keys:")
            for i, key in enumerate(active_result.data):
                print(f"  {i+1}. Name: {key.get('key_name', 'N/A')}")
                print(f"     Base URL: {key.get('base_url', 'N/A')}")
                print(f"     Key Value: {key.get('key_value', 'N/A')[:10]}..." if key.get('key_value') else "     Key Value: N/A")
        else:
            print("\n❌ No active DataForSEO keys found")
            print("Please check:")
            print("1. Is there a record with provider = 'dataforseo'?")
            print("2. Is is_active = true?")
            print("3. Is the key_value field populated?")
        
    except Exception as e:
        print(f"\n❌ Error connecting to Supabase: {e}")

if __name__ == "__main__":
    debug_api_credentials()
