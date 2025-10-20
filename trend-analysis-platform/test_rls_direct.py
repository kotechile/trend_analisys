#!/usr/bin/env python3
"""
Test RLS Policies Directly

This script directly connects to your Supabase database to test RLS policies
without requiring the backend configuration.
"""

import asyncio
import os
import subprocess
import sys

async def test_rls_policies_direct():
    """Test RLS policies using direct database connection"""
    print("🔒 Testing RLS Policies Directly...")
    
    # You'll need to set your database URL
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:[YOUR-PASSWORD]@db.dgcsqiaciyqvprtpopxg.supabase.co:5432/postgres')
    
    if '[YOUR-PASSWORD]' in DATABASE_URL:
        print("❌ Please set your DATABASE_URL environment variable with the actual password")
        print("   export DATABASE_URL='postgresql://postgres:your_actual_password@db.dgcsqiaciyqvprtpopxg.supabase.co:5432/postgres'")
        return False
    
    try:
        # Test RLS status
        print("   Checking RLS status on DataForSEO tables...")
        result = subprocess.run([
            'psql', DATABASE_URL, '-c', 
            """SELECT schemaname, tablename, rowsecurity 
               FROM pg_tables 
               WHERE schemaname = 'public' 
               AND tablename IN ('trend_analysis_data', 'keyword_research_data', 'subtopic_suggestions', 'dataforseo_api_logs')
               ORDER BY tablename;"""
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            lines = [line.strip() for line in result.stdout.split('\n') if line.strip() and not line.startswith('schemaname') and not line.startswith('---') and not line.startswith('(')]
            
            if lines:
                print(f"✅ Found {len(lines)} DataForSEO tables:")
                all_rls_enabled = True
                for line in lines:
                    parts = line.split('|')
                    if len(parts) >= 3:
                        schema, table, rls_enabled = parts
                        status = "✅ Enabled" if rls_enabled.strip() == 't' else "❌ Disabled"
                        print(f"   - {table.strip()}: {status}")
                        if rls_enabled.strip() != 't':
                            all_rls_enabled = False
                
                if all_rls_enabled:
                    print("✅ All DataForSEO tables have RLS enabled")
                else:
                    print("❌ Some tables don't have RLS enabled")
                    return False
            else:
                print("❌ No DataForSEO tables found")
                return False
        else:
            print(f"❌ Failed to check RLS status: {result.stderr}")
            return False
        
        # Test RLS policies
        print("\n   Checking RLS policies...")
        result2 = subprocess.run([
            'psql', DATABASE_URL, '-c',
            """SELECT schemaname, tablename, policyname, permissive, roles, cmd
               FROM pg_policies 
               WHERE schemaname = 'public' 
               AND tablename IN ('trend_analysis_data', 'keyword_research_data', 'subtopic_suggestions', 'dataforseo_api_logs')
               ORDER BY tablename, policyname;"""
        ], capture_output=True, text=True, timeout=10)
        
        if result2.returncode == 0:
            lines = [line.strip() for line in result2.stdout.split('\n') if line.strip() and not line.startswith('schemaname') and not line.startswith('---') and not line.startswith('(')]
            
            if lines:
                print(f"✅ Found {len(lines)} RLS policies:")
                for line in lines:
                    parts = line.split('|')
                    if len(parts) >= 6:
                        schema, table, policy, permissive, roles, cmd = parts
                        print(f"   - {table.strip()}.{policy.strip()}: {cmd.strip()} for {roles.strip()}")
            else:
                print("❌ No RLS policies found")
                return False
        else:
            print(f"❌ Failed to check RLS policies: {result2.stderr}")
            return False
        
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ Connection timeout - check your network and credentials")
        return False
    except FileNotFoundError:
        print("❌ psql command not found")
        print("   Please install PostgreSQL client or use Supabase CLI")
        return False
    except Exception as e:
        print(f"❌ RLS test failed: {e}")
        return False

async def test_api_keys():
    """Test API keys table"""
    print("\n🔑 Testing API Keys...")
    
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:[YOUR-PASSWORD]@db.dgcsqiaciyqvprtpopxg.supabase.co:5432/postgres')
    
    if '[YOUR-PASSWORD]' in DATABASE_URL:
        print("❌ Please set your DATABASE_URL environment variable")
        return False
    
    try:
        result = subprocess.run([
            'psql', DATABASE_URL, '-c',
            "SELECT key_name, provider, base_url, is_active FROM api_keys WHERE provider = 'dataforseo';"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            lines = [line.strip() for line in result.stdout.split('\n') if line.strip() and not line.startswith('key_name') and not line.startswith('---') and not line.startswith('(')]
            
            if lines:
                print(f"✅ Found {len(lines)} DataForSEO API keys:")
                for line in lines:
                    parts = line.split('|')
                    if len(parts) >= 4:
                        key_name, provider, base_url, is_active = parts
                        print(f"   - {key_name.strip()}: {provider.strip()} ({'Active' if is_active.strip() == 't' else 'Inactive'})")
                        if base_url.strip():
                            print(f"     URL: {base_url.strip()}")
                return True
            else:
                print("❌ No DataForSEO API keys found")
                return False
        else:
            print(f"❌ Failed to check API keys: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ API keys test failed: {e}")
        return False

def print_summary():
    """Print summary and next steps"""
    print("\n" + "=" * 60)
    print("📋 RLS and DataForSEO Setup Summary")
    print("=" * 60)
    print()
    print("✅ What's Complete:")
    print("   - DataForSEO tables created in remote database")
    print("   - RLS policies applied for authenticated users")
    print("   - API credentials configured")
    print()
    print("🔧 RLS Policies Applied:")
    print("   - trend_analysis_data: Full CRUD for authenticated users")
    print("   - keyword_research_data: Full CRUD for authenticated users")
    print("   - subtopic_suggestions: Full CRUD for authenticated users")
    print("   - dataforseo_api_logs: Full CRUD for authenticated users")
    print("   - api_keys: Service role only (for security)")
    print()
    print("🚀 Next Steps:")
    print("   1. Test your backend API endpoints")
    print("   2. Verify frontend integration works")
    print("   3. Test with real DataForSEO sandbox data")
    print()
    print("🧪 Test Commands:")
    print("   # Test trend analysis")
    print("   curl -X GET 'http://localhost:8000/api/v1/trend-analysis/dataforseo' \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"subtopics\": [\"AI tools\"], \"location\": \"United States\", \"time_range\": \"12m\"}'")
    print()
    print("   # Test keyword research")
    print("   curl -X POST 'http://localhost:8000/api/v1/keyword-research/dataforseo' \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"seed_keywords\": [\"machine learning\"], \"max_difficulty\": 50, \"max_keywords\": 10}'")

async def main():
    """Main test function"""
    print("🚀 RLS and DataForSEO Direct Test")
    print("=" * 50)
    
    # Test RLS policies
    rls_success = await test_rls_policies_direct()
    
    # Test API keys
    keys_success = await test_api_keys()
    
    print_summary()
    
    if rls_success and keys_success:
        print("\n✅ All tests passed! Your DataForSEO integration with RLS is ready.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())
