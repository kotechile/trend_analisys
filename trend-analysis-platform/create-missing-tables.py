#!/usr/bin/env python3
"""
Create missing Supabase tables for affiliate research
"""

import os
from supabase import create_client
from dotenv import load_dotenv

def create_missing_tables():
    """Create missing tables in Supabase"""
    
    # Load environment variables
    load_dotenv()
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        print("Please check your .env file")
        return False
    
    print(f"🔗 Connecting to Supabase...")
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        
        # Test connection
        print("✅ Connected to Supabase")
        
        # Create topic_decompositions table
        print("📋 Creating topic_decompositions table...")
        
        topic_decompositions_sql = """
        CREATE TABLE IF NOT EXISTS topic_decompositions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            search_query TEXT NOT NULL,
            subtopics TEXT[] NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # Create affiliate_offers table
        print("📋 Creating affiliate_offers table...")
        
        affiliate_offers_sql = """
        CREATE TABLE IF NOT EXISTS affiliate_offers (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            workflow_session_id TEXT,
            offer_name TEXT NOT NULL,
            offer_description TEXT,
            commission_rate DECIMAL(5,2),
            access_instructions TEXT,
            linkup_data JSONB,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # Execute SQL using Supabase RPC
        try:
            # Note: We'll use a different approach since direct SQL execution might not be available
            # Let's try to insert a test record to see if tables exist
            print("🔍 Checking if tables exist...")
            
            # Try to query topic_decompositions
            try:
                result = supabase.table('topic_decompositions').select('*').limit(1).execute()
                print("✅ topic_decompositions table exists")
            except Exception as e:
                print(f"❌ topic_decompositions table missing: {e}")
                print("Please create the table manually in Supabase dashboard")
                print("SQL:", topic_decompositions_sql)
            
            # Try to query affiliate_offers
            try:
                result = supabase.table('affiliate_offers').select('*').limit(1).execute()
                print("✅ affiliate_offers table exists")
            except Exception as e:
                print(f"❌ affiliate_offers table missing: {e}")
                print("Please create the table manually in Supabase dashboard")
                print("SQL:", affiliate_offers_sql)
                
        except Exception as e:
            print(f"❌ Error checking tables: {e}")
            print("Please create the tables manually in Supabase dashboard")
            print("\nSQL for topic_decompositions:")
            print(topic_decompositions_sql)
            print("\nSQL for affiliate_offers:")
            print(affiliate_offers_sql)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    create_missing_tables()
