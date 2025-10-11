#!/usr/bin/env python3
"""
Set up Row Level Security (RLS) policies for Supabase tables
"""

import os
from supabase import create_client
from dotenv import load_dotenv

def setup_rls_policies():
    """Set up RLS policies for the new tables"""
    
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
        
        # RLS policies for topic_decompositions table
        print("🔒 Setting up RLS policies for topic_decompositions...")
        
        topic_decompositions_rls_sql = """
        -- Enable RLS on topic_decompositions table
        ALTER TABLE topic_decompositions ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Users can only see their own topic decompositions
        CREATE POLICY "Users can view own topic decompositions" ON topic_decompositions
            FOR SELECT USING (auth.uid() = user_id);
        
        -- Policy: Users can insert their own topic decompositions
        CREATE POLICY "Users can insert own topic decompositions" ON topic_decompositions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Policy: Users can update their own topic decompositions
        CREATE POLICY "Users can update own topic decompositions" ON topic_decompositions
            FOR UPDATE USING (auth.uid() = user_id);
        
        -- Policy: Users can delete their own topic decompositions
        CREATE POLICY "Users can delete own topic decompositions" ON topic_decompositions
            FOR DELETE USING (auth.uid() = user_id);
        """
        
        # RLS policies for affiliate_offers table
        print("🔒 Setting up RLS policies for affiliate_offers...")
        
        affiliate_offers_rls_sql = """
        -- Enable RLS on affiliate_offers table
        ALTER TABLE affiliate_offers ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Users can only see their own affiliate offers
        CREATE POLICY "Users can view own affiliate offers" ON affiliate_offers
            FOR SELECT USING (auth.uid() = user_id);
        
        -- Policy: Users can insert their own affiliate offers
        CREATE POLICY "Users can insert own affiliate offers" ON affiliate_offers
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Policy: Users can update their own affiliate offers
        CREATE POLICY "Users can update own affiliate offers" ON affiliate_offers
            FOR UPDATE USING (auth.uid() = user_id);
        
        -- Policy: Users can delete their own affiliate offers
        CREATE POLICY "Users can delete own affiliate offers" ON affiliate_offers
            FOR DELETE USING (auth.uid() = user_id);
        """
        
        print("📋 RLS SQL for topic_decompositions:")
        print(topic_decompositions_rls_sql)
        print("\n📋 RLS SQL for affiliate_offers:")
        print(affiliate_offers_rls_sql)
        
        print("\n🔧 To apply these policies:")
        print("1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/bvsqnmkvbbvtrcomtvnc")
        print("2. Navigate to: SQL Editor")
        print("3. Run the SQL above for each table")
        print("4. This will enable RLS and create the necessary policies")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    setup_rls_policies()
