#!/usr/bin/env python3
"""
Check research topics table structure
"""

from supabase import create_client, Client

def check_topics():
    """Check research topics table"""
    
    # Supabase configuration
    url = "https://dgcsqiaciyqvprtpopxg.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTQ3NTk5MywiZXhwIjoyMDMxMDUxOTkzfQ.wXVY743o8sX2waD03EenpvTjAdmrwT4eEt6lgWIMaC0"
    
    # Create Supabase client
    client: Client = create_client(url, key)
    
    try:
        print("🔍 Checking research topics...")
        topics_result = client.table("research_topics").select("*").limit(5).execute()
        
        if topics_result.data:
            print(f"✅ Found {len(topics_result.data)} topics:")
            for topic in topics_result.data:
                print(f"  - Topic: {topic}")
        else:
            print("❌ No research topics found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_topics()
