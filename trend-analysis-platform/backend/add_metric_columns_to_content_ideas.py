#!/usr/bin/env python3
"""
Add metric columns to content_ideas table if they don't exist
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core.supabase_singleton import get_supabase_client
from src.core.config import validate_supabase_config

def add_metric_columns():
    """Add missing metric columns to content_ideas table"""
    try:
        validate_supabase_config()
        supabase = get_supabase_client()
    except ValueError as e:
        print(f"⚠️ Supabase credentials not found: {e}. Skipping migration.")
        return False
    
    try:
        
        # Add columns if they don't exist
        queries = [
            "ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS total_search_volume INTEGER DEFAULT 0",
            "ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS average_difficulty INTEGER DEFAULT 50",
            "ALTER TABLE content_ideas ADD COLUMN IF NOT EXISTS average_cpc NUMERIC(10,2) DEFAULT 0"
        ]
        
        for query in queries:
            try:
                supabase.rpc('exec_sql', {'query': query}).execute()
                print(f"✅ Added column: {query}")
            except Exception as e:
                print(f"⚠️ Column might already exist: {e}")
                # Try without IF NOT EXISTS
                query_simple = query.replace('IF NOT EXISTS', '').replace('COLUMN IF NOT EXISTS', 'COLUMN')
                try:
                    supabase.rpc('exec_sql', {'query': query_simple}).execute()
                    print(f"✅ Added column: {query_simple}")
                except:
                    pass
        
        print("✅ Migration complete!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    add_metric_columns()








