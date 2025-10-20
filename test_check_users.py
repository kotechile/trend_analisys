#!/usr/bin/env python3
"""
Check existing users and topics in the database
"""

from supabase import create_client, Client

def check_users_and_topics():
    """Check what users and topics exist in the database"""
    
    # Supabase configuration
    url = "https://dgcsqiaciyqvprtpopxg.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTQ3NTk5MywiZXhwIjoyMDMxMDUxOTkzfQ.wXVY743o8sX2waD03EenpvTjAdmrwT4eEt6lgWIMaC0"
    
    # Create Supabase client
    client: Client = create_client(url, key)
    
    try:
        print("🔍 Checking users...")
        users_result = client.table("users").select("id, email").limit(5).execute()
        
        if users_result.data:
            print(f"✅ Found {len(users_result.data)} users:")
            for user in users_result.data:
                print(f"  - ID: {user['id']}, Email: {user.get('email', 'N/A')}")
        else:
            print("❌ No users found")
        
        print("\n🔍 Checking research topics...")
        topics_result = client.table("research_topics").select("id, name").limit(5).execute()
        
        if topics_result.data:
            print(f"✅ Found {len(topics_result.data)} topics:")
            for topic in topics_result.data:
                print(f"  - ID: {topic['id']}, Name: {topic.get('name', 'N/A')}")
        else:
            print("❌ No research topics found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_users_and_topics()
