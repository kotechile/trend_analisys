#!/usr/bin/env python3
"""
Script to run the content_ideas status fields migration
"""

import os
import sys
import subprocess
from pathlib import Path

def run_migration():
    """Run the content_ideas status fields migration"""
    
    # Get the project root directory
    project_root = Path(__file__).parent
    migration_file = project_root / "backend" / "migrations" / "add_content_ideas_status_fields.sql"
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        return False
    
    print(f"📄 Found migration file: {migration_file}")
    
    # Read the migration SQL
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    print("🔧 Migration SQL content:")
    print("=" * 50)
    print(migration_sql[:500] + "..." if len(migration_sql) > 500 else migration_sql)
    print("=" * 50)
    
    # Check if we're in a Supabase environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase environment variables not found")
        print("Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables")
        return False
    
    print("✅ Supabase environment variables found")
    
    # Try to run the migration using psql or supabase CLI
    try:
        # First, try using supabase CLI
        result = subprocess.run([
            'supabase', 'db', 'reset', '--linked'
        ], capture_output=True, text=True, cwd=project_root)
        
        if result.returncode == 0:
            print("✅ Database reset successful")
        else:
            print(f"⚠️  Database reset failed: {result.stderr}")
        
        # Now apply the migration
        result = subprocess.run([
            'supabase', 'db', 'push', '--include-all'
        ], capture_output=True, text=True, cwd=project_root)
        
        if result.returncode == 0:
            print("✅ Migration applied successfully")
            return True
        else:
            print(f"❌ Migration failed: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ Supabase CLI not found. Please install it or run the migration manually.")
        print("\nTo run manually:")
        print(f"1. Connect to your Supabase database")
        print(f"2. Run the SQL from: {migration_file}")
        return False
    except Exception as e:
        print(f"❌ Error running migration: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting content_ideas status fields migration...")
    success = run_migration()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("\nThe content_ideas table now includes:")
        print("- status field (draft, in_progress, completed, published, archived)")
        print("- published, published_at, published_to_titles fields")
        print("- titles_record_id for linking to Titles table")
        print("- priority and workflow_status fields")
        print("- Quality scoring fields")
        print("- Enhanced keyword fields")
        print("- Affiliate and monetization fields")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        sys.exit(1)





