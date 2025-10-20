#!/usr/bin/env python3
"""
Apply database migration to add user_id and topic_id columns
"""

import asyncio
import os
from supabase import create_client, Client

async def apply_migration():
    # Get Supabase credentials from environment
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
        return False
    
    try:
        supabase: Client = create_client(url, key)
        
        # Read the migration SQL
        with open("trend-analysis-platform/supabase/migrations/20250115000002_add_user_topic_to_keyword_research.sql", "r") as f:
            migration_sql = f.read()
        
        print("Applying migration...")
        print("Migration SQL:")
        print(migration_sql)
        
        # Execute the migration
        result = supabase.rpc('exec_sql', {'sql': migration_sql}).execute()
        
        print("Migration applied successfully!")
        return True
        
    except Exception as e:
        print(f"Error applying migration: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(apply_migration())
