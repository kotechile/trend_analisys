#!/usr/bin/env python3
"""
Test Supabase connection
"""

import os
import sys
from sqlalchemy import create_engine, text

def test_connection():
    """Test the Supabase database connection"""
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        print("Please create a .env file with your Supabase credentials")
        return False
    
    if not database_url.startswith("postgresql://"):
        print("❌ DATABASE_URL should be a PostgreSQL connection string")
        print("Expected format: postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres")
        return False
    
    print(f"🔗 Testing connection to: {database_url.split('@')[1] if '@' in database_url else 'database'}")
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected successfully!")
            print(f"   PostgreSQL version: {version}")
            
            # Test UUID support
            result = conn.execute(text("SELECT gen_random_uuid()"))
            uuid = result.fetchone()[0]
            print(f"✅ UUID support confirmed: {uuid}")
            
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your database password")
        print("2. Verify the project URL format")
        print("3. Ensure the project is fully initialized")
        print("4. Check your .env file")
        return False

if __name__ == "__main__":
    print("🧪 Testing Supabase Connection...")
    print("=" * 40)
    
    success = test_connection()
    
    if success:
        print("\n🎉 Connection successful! You're ready to create tables.")
    else:
        print("\n💡 Please check the SUPABASE_SETUP_GUIDE.md for help")


