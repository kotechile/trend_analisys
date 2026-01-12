#!/usr/bin/env python3
"""
Create affiliate_researches table in Supabase
"""

import os
import sys
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core.supabase_singleton import get_supabase_client
from src.core.config import validate_supabase_config

def create_affiliate_researches_table():
    """Create the affiliate_researches table in Supabase"""
    
    try:
        validate_supabase_config()
        supabase = get_supabase_client()
    except ValueError as e:
        print(f"❌ Supabase configuration error: {e}")
        return False
    
    # SQL to create the affiliate_researches table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS affiliate_researches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        topic TEXT NOT NULL,
        search_query TEXT,
        results JSONB,
        total_programs_found INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_affiliate_researches_user_id ON affiliate_researches(user_id);
    CREATE INDEX IF NOT EXISTS idx_affiliate_researches_topic ON affiliate_researches(topic);
    
    -- Create RLS policies
    ALTER TABLE affiliate_researches ENABLE ROW LEVEL SECURITY;
    
    -- Allow users to see their own research
    CREATE POLICY "Users can see their own research" ON affiliate_researches
        FOR SELECT USING (auth.uid() = user_id);
    
    -- Allow users to insert their own research
    CREATE POLICY "Users can insert their own research" ON affiliate_researches
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    """
    
    try:
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': create_table_sql})
        print("✅ Successfully created affiliate_researches table")
        return True
        
    except Exception as e:
        print(f"❌ Error creating affiliate_researches table: {e}")
        return False

if __name__ == "__main__":
    success = create_affiliate_researches_table()
    if success:
        print("\n🎉 Database setup complete!")
    else:
        print("\n💥 Database setup failed!")
        sys.exit(1)
