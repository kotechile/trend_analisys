#!/usr/bin/env python3
"""
Test Remote Supabase Connection

This script tests the connection to your remote Supabase database
and checks if DataForSEO tables exist.
"""

import asyncio
import os
import sys
from pathlib import Path

async def test_remote_connection():
    """Test connection to remote Supabase database"""
    
    # You'll need to set these environment variables or replace with your actual values
    # Get these from your Supabase project settings
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://dgcsqiaciyqvprtpopxg.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'your_anon_key_here')
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:[YOUR-PASSWORD]@db.dgcsqiaciyqvprtpopxg.supabase.co:5432/postgres')
    
    print("🔌 Testing remote Supabase connection...")
    print(f"   URL: {SUPABASE_URL}")
    print(f"   Database: dgcsqiaciyqvprtpopxg")
    
    try:
        # Test with psql if available
        import subprocess
        
        # Test database connection
        result = subprocess.run([
            'psql', DATABASE_URL, '-c', 
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys';"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Successfully connected to remote database")
            
            # Check for DataForSEO tables
            result2 = subprocess.run([
                'psql', DATABASE_URL, '-c',
                """SELECT table_name 
                   FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND (table_name LIKE '%dataforseo%' 
                        OR table_name LIKE '%trend%' 
                        OR table_name LIKE '%keyword%' 
                        OR table_name LIKE '%subtopic%')
                   ORDER BY table_name;"""
            ], capture_output=True, text=True, timeout=10)
            
            if result2.returncode == 0:
                tables = [line.strip() for line in result2.stdout.split('\n') if line.strip() and not line.startswith('table_name') and not line.startswith('---') and not line.startswith('(')]
                
                if tables:
                    print(f"✅ Found {len(tables)} DataForSEO tables:")
                    for table in tables:
                        print(f"   - {table}")
                else:
                    print("ℹ️  No DataForSEO tables found yet")
                    print("   You may need to run the migrations on your remote database")
            
            # Check API keys
            result3 = subprocess.run([
                'psql', DATABASE_URL, '-c',
                "SELECT key_name, provider, base_url, is_active FROM api_keys WHERE provider = 'dataforseo';"
            ], capture_output=True, text=True, timeout=10)
            
            if result3.returncode == 0:
                lines = [line.strip() for line in result3.stdout.split('\n') if line.strip() and not line.startswith('key_name') and not line.startswith('---') and not line.startswith('(')]
                
                if lines:
                    print(f"✅ Found {len(lines)} DataForSEO API keys:")
                    for line in lines:
                        parts = line.split('|')
                        if len(parts) >= 4:
                            key_name, provider, base_url, is_active = parts
                            print(f"   - {key_name.strip()}: {provider.strip()} ({'Active' if is_active.strip() == 't' else 'Inactive'})")
                            if base_url.strip():
                                print(f"     URL: {base_url.strip()}")
                else:
                    print("❌ No DataForSEO API keys found")
                    print("   Please add your credentials:")
                    print("   INSERT INTO api_keys (key_name, key_value, provider, base_url, is_active)")
                    print("   VALUES ('dataforseo_sandbox', 'your_key_here', 'dataforseo', 'https://api.dataforseo.com/v3', true);")
            
        else:
            print("❌ Failed to connect to remote database")
            print(f"   Error: {result.stderr}")
            print("   Please check your DATABASE_URL environment variable")
            
    except subprocess.TimeoutExpired:
        print("❌ Connection timeout - check your network and credentials")
    except FileNotFoundError:
        print("❌ psql command not found")
        print("   Please install PostgreSQL client or use Supabase CLI")
    except Exception as e:
        print(f"❌ Error: {e}")

def print_instructions():
    """Print setup instructions"""
    print("\n" + "=" * 60)
    print("📋 SETUP INSTRUCTIONS")
    print("=" * 60)
    print()
    print("1. Set your environment variables:")
    print("   export DATABASE_URL='postgresql://postgres:[YOUR-PASSWORD]@db.dgcsqiaciyqvprtpopxg.supabase.co:5432/postgres'")
    print()
    print("2. Add your DataForSEO API key to the database:")
    print("   INSERT INTO api_keys (key_name, key_value, provider, base_url, is_active)")
    print("   VALUES ('dataforseo_sandbox', 'your_sandbox_key_here', 'dataforseo', 'https://api.dataforseo.com/v3', true);")
    print()
    print("3. Run the DataForSEO table migrations:")
    print("   - Copy the content from: supabase/migrations/20240115000005_create_dataforseo_tables_remote.sql")
    print("   - Paste it into your Supabase SQL Editor")
    print("   - Execute the migration")
    print()
    print("4. Test the integration:")
    print("   python test_remote_connection.py")
    print()

async def main():
    """Main test function"""
    print("🚀 Remote Supabase Connection Test")
    print("=" * 50)
    
    await test_remote_connection()
    print_instructions()

if __name__ == "__main__":
    asyncio.run(main())
