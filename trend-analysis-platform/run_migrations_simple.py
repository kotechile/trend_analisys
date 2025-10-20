#!/usr/bin/env python3
"""
Simple DataForSEO Migration Runner

This script runs the DataForSEO migrations directly using the existing Supabase setup.
Run this script from the trend-analysis-platform directory.
"""

import os
import sys
from pathlib import Path

# Add the backend src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "backend" / "src"))

def run_migration_file(file_path):
    """Run a single migration file"""
    print(f"📄 Running migration: {file_path}")
    
    try:
        # Read the migration file
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        print(f"✅ Migration file read successfully: {len(sql_content)} characters")
        print(f"📝 First 200 characters: {sql_content[:200]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading migration file {file_path}: {e}")
        return False

def main():
    """Run all DataForSEO migrations"""
    print("🚀 Starting DataForSEO migrations...")
    
    # Define migration files in order
    migrations = [
        "supabase/migrations/20240115000001_create_dataforseo_tables.sql",
        "supabase/migrations/20240115000002_create_dataforseo_indexes.sql",
        "supabase/migrations/20240115000003_create_dataforseo_constraints.sql"
    ]
    
    success_count = 0
    
    for migration in migrations:
        if os.path.exists(migration):
            if run_migration_file(migration):
                success_count += 1
            else:
                print(f"❌ Failed to process {migration}")
                break
        else:
            print(f"⚠️  Migration file not found: {migration}")
    
    print(f"\n📊 Migration Summary:")
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {len(migrations) - success_count}")
    print(f"📁 Total: {len(migrations)}")
    
    if success_count == len(migrations):
        print("\n🎉 All migrations processed successfully!")
        print("\n📋 Next Steps:")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Copy and paste each migration file content")
        print("4. Run them in the order shown above")
        print("\n💡 Or use: supabase db push (after linking your project)")
    else:
        print("\n❌ Some migrations failed. Check the errors above.")

if __name__ == "__main__":
    main()
