#!/usr/bin/env python3
"""
Test direct Supabase insertion with exact frontend data format
"""

from supabase import create_client, Client

def test_direct_supabase_final():
    """Test direct Supabase insertion with exact frontend data format"""
    
    # Supabase configuration
    url = "https://dgcsqiaciyqvprtpopxg.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3NxaWFjaXlxdnBydHBvcHhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNTQ3NTk5MywiZXhwIjoyMDMxMDUxOTkzfQ.wXVY743o8sX2waD03EenpvTjAdmrwT4eEt6lgWIMaC0"
    
    # Create Supabase client
    client: Client = create_client(url, key)
    
    try:
        print("✅ Supabase client created successfully")
        
        # Test data in exact frontend format
        test_data = {
            "keyword": "green home",
            "search_volume": 1300,
            "keyword_difficulty": 33,
            "difficulty": 33,
            "cpc": 6.33,
            "competition": 0.3,  # Decimal value
            "competition_value": 30,  # Integer value (0.3 * 100)
            "competition_level": "MEDIUM",
            "main_intent": "COMMERCIAL",
            "source": "keyword_ideas",
            "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
            "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
            "trend_percentage": 0.0,
            "intent_type": "COMMERCIAL",
            "priority_score": 75.0,
            "related_keywords": [],
            "search_volume_trend": []
        }
        
        print(f"📝 Test data: {test_data}")
        
        # Try to insert
        result = client.table("keyword_research_data").insert(test_data).execute()
        
        print(f"✅ Insert successful: {result}")
        print(f"✅ Records inserted: {len(result.data)}")
        
        # Clean up
        client.table("keyword_research_data").delete().eq("keyword", "green home").execute()
        print("✅ Test data cleaned up")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct_supabase_final()
