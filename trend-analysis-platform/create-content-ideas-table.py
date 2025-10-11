#!/usr/bin/env python3
"""
Script to create content_ideas table in Supabase
"""

import os
import sys
from pathlib import Path

# Add the backend src directory to the Python path
backend_src = Path(__file__).parent / "backend" / "src"
sys.path.insert(0, str(backend_src))

from core.supabase_database import get_supabase_db

def create_content_ideas_table():
    """Create the content_ideas table in Supabase"""
    try:
        db = get_supabase_db()
        
        # Read the SQL file
        sql_file = Path(__file__).parent / "backend" / "sql" / "create_content_ideas_table.sql"
        with open(sql_file, 'r') as f:
            sql_content = f.read()
        
        # Execute the SQL
        result = db.rpc('exec_sql', {'sql': sql_content}).execute()
        
        print("✅ Content ideas table created successfully!")
        print("Table structure:")
        print("- id: UUID (Primary Key)")
        print("- research_id: VARCHAR(255) (Unique)")
        print("- ideas: JSONB (Array of content ideas)")
        print("- created_at: TIMESTAMP")
        print("- updated_at: TIMESTAMP")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating content ideas table: {e}")
        return False

if __name__ == "__main__":
    print("Creating content_ideas table in Supabase...")
    success = create_content_ideas_table()
    
    if success:
        print("\n🎉 Setup complete! You can now use the content ideas functionality.")
    else:
        print("\n💥 Setup failed. Please check your Supabase configuration.")
        sys.exit(1)

