#!/usr/bin/env python3
"""
Test Supabase connection directly
"""

import os
from supabase import create_client, Client

def test_supabase_direct():
    """Test Supabase connection and insert directly"""
    
    # Supabase configuration from .env
    url = "https://dgcsqiaciyqvprtpopxg.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTQ3NTk5MywiZXhwIjoyMDMxMDUxOTkzfQ.wXVY743o8sX2waD03EenpvTjAdmrwT4eEt6lgWIMaC0"
    
    # Create Supabase client
    client: Client = create_client(url, key)
    
    try:
        print("✅ Supabase client created successfully")
        
        # Test data with correct types and UUID format
        test_data = {
            "keyword": "test-keyword-direct-123",
            "search_volume": 1000,
            "keyword_difficulty": 25,
            "cpc": 0.5,
            "competition_value": 30,  # Integer (0-100)
            "competition": 0.3,  # Decimal (0.0-1.0)
            "trend_percentage": 0.0,
            "intent_type": "COMMERCIAL",
            "priority_score": 75.0,
            "related_keywords": [],
            "search_volume_trend": [],
            "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",  # Real topic ID
            "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",  # Real user ID
            "source": "test"
        }
        
        print(f"📝 Test data: {test_data}")
        
        # Try to insert
        result = client.table("keyword_research_data").insert(test_data).execute()
        
        print(f"✅ Insert successful: {result}")
        print(f"✅ Records inserted: {len(result.data)}")
        
        # Clean up
        client.table("keyword_research_data").delete().eq("keyword", "test-keyword-direct-123").execute()
        print("✅ Test data cleaned up")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_supabase_direct()
