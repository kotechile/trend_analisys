#!/usr/bin/env python3
"""
Test DataForSEO Connection

This script tests the connection to your remote Supabase database
and verifies the DataForSEO API credentials are working.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "backend" / "src"))

async def test_database_connection():
    """Test database connection and API credentials"""
    try:
        from backend.src.dataforseo.database import db_manager, dataforseo_repository
        
        print("🔌 Testing database connection...")
        
        # Initialize database manager
        await db_manager.initialize()
        print("✅ Database connection established")
        
        # Test API credentials retrieval
        print("🔑 Testing API credentials retrieval...")
        credentials = await dataforseo_repository.get_api_credentials("dataforseo")
        
        if credentials:
            print(f"✅ API credentials found:")
            print(f"   Provider: {credentials.provider}")
            print(f"   Base URL: {credentials.base_url}")
            print(f"   Key Value: {credentials.key_value[:10]}...")
            print(f"   Is Active: {credentials.is_active}")
            
            # Test API client initialization
            print("\n🌐 Testing DataForSEO API client...")
            from backend.src.dataforseo.api_integration import api_client
            await api_client.initialize()
            print("✅ DataForSEO API client initialized successfully")
            
            # Test a simple API call (if you want to test actual API)
            print("\n🧪 Testing API connectivity...")
            try:
                # This would make an actual API call - uncomment if you want to test
                # trend_data = await api_client.get_trend_data(["test"], "United States", "12m")
                # print(f"✅ API call successful: {len(trend_data)} results")
                print("ℹ️  Skipping actual API call (uncomment in script to test)")
            except Exception as e:
                print(f"⚠️  API call failed: {e}")
            
        else:
            print("❌ No DataForSEO API credentials found")
            print("   Please add your credentials to the api_keys table:")
            print("   INSERT INTO api_keys (key_name, key_value, provider, base_url, is_active)")
            print("   VALUES ('dataforseo_sandbox', 'your_key_here', 'dataforseo', 'https://api.dataforseo.com/v3', true);")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close database connection
        try:
            await db_manager.close()
            print("🔌 Database connection closed")
        except:
            pass

async def test_database_schema():
    """Test if DataForSEO tables exist in the remote database"""
    try:
        from backend.src.dataforseo.database import db_manager
        
        print("📊 Testing database schema...")
        await db_manager.initialize()
        
        async with db_manager.get_session() as session:
            from sqlalchemy import text
            
            # Check if DataForSEO tables exist
            result = await session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND (table_name LIKE '%dataforseo%' 
                     OR table_name LIKE '%trend%' 
                     OR table_name LIKE '%keyword%' 
                     OR table_name LIKE '%subtopic%')
                ORDER BY table_name;
            """))
            
            tables = [row[0] for row in result.fetchall()]
            
            if tables:
                print(f"✅ Found {len(tables)} DataForSEO tables:")
                for table in tables:
                    print(f"   - {table}")
            else:
                print("❌ No DataForSEO tables found")
                print("   You may need to run the migrations on your remote database")
                
    except Exception as e:
        print(f"❌ Schema test error: {e}")
    finally:
        try:
            await db_manager.close()
        except:
            pass

async def main():
    """Main test function"""
    print("🚀 DataForSEO Connection Test")
    print("=" * 50)
    
    # Test database schema first
    await test_database_schema()
    print()
    
    # Test database connection and API credentials
    await test_database_connection()
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    asyncio.run(main())
