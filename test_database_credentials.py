#!/usr/bin/env python3
"""
Test DataForSEO credentials directly from Supabase
"""

from supabase import create_client, Client

def test_database_credentials():
    """Test DataForSEO credentials directly from Supabase"""
    
    # Supabase configuration
    url = "https://dgcsqiaciyqvprtpopxg.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTQ3NTk5MywiZXhwIjoyMDMxMDUxOTkzfQ.wXVY743o8sX2waD03EenpvTjAdmrwT4eEt6lgWIMaC0"
    
    # Create Supabase client
    client: Client = create_client(url, key)
    
    try:
        print("✅ Supabase client created successfully")
        
        # Query DataForSEO credentials
        result = client.table("api_keys").select("*").eq("provider", "dataforseo").eq("is_active", True).execute()
        
        if result.data:
            print(f"✅ Found {len(result.data)} DataForSEO credentials:")
            for i, cred in enumerate(result.data):
                print(f"   Credential {i+1}:")
                print(f"   - ID: {cred.get('id')}")
                print(f"   - Key Name: {cred.get('key_name')}")
                print(f"   - Base URL: {cred.get('base_url')}")
                print(f"   - Key Value: {cred.get('key_value', '')[:20]}...")
                print(f"   - Username: {cred.get('user_name')}")
                print(f"   - Password: {cred.get('password', '')[:10]}...")
                print(f"   - Is Active: {cred.get('is_active')}")
                print(f"   - Created: {cred.get('created_at')}")
                print()
        else:
            print("❌ No DataForSEO credentials found")
            
        # Query all API keys to see what's available
        all_keys = client.table("api_keys").select("*").execute()
        print(f"📝 All API keys in database ({len(all_keys.data)} total):")
        for key in all_keys.data:
            print(f"   - Provider: {key.get('provider')}, Active: {key.get('is_active')}, Key Name: {key.get('key_name')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database_credentials()
