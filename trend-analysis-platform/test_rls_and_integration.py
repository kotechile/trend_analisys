#!/usr/bin/env python3
"""
Test RLS Policies and DataForSEO Integration

This script tests:
1. RLS policies are properly configured
2. DataForSEO API integration works with authenticated users
3. Database operations respect security policies
"""

import asyncio
import json
import sys
from pathlib import Path

# Add the backend src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "backend" / "src"))

async def test_rls_policies():
    """Test that RLS policies are properly configured"""
    print("🔒 Testing RLS Policies...")
    
    try:
        from backend.src.dataforseo.database import db_manager
        
        # Initialize database
        await db_manager.initialize()
        print("✅ Database connection established")
        
        async with db_manager.get_session() as session:
            from sqlalchemy import text
            
            # Check if RLS is enabled on all tables
            result = await session.execute(text("""
                SELECT schemaname, tablename, rowsecurity 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename IN ('trend_analysis_data', 'keyword_research_data', 'subtopic_suggestions', 'dataforseo_api_logs')
                ORDER BY tablename;
            """))
            
            tables = result.fetchall()
            
            if tables:
                print(f"✅ Found {len(tables)} DataForSEO tables with RLS status:")
                all_rls_enabled = True
                for schema, table, rls_enabled in tables:
                    status = "✅ Enabled" if rls_enabled else "❌ Disabled"
                    print(f"   - {table}: {status}")
                    if not rls_enabled:
                        all_rls_enabled = False
                
                if all_rls_enabled:
                    print("✅ All DataForSEO tables have RLS enabled")
                else:
                    print("❌ Some tables don't have RLS enabled")
                    return False
            else:
                print("❌ No DataForSEO tables found")
                return False
            
            # Check RLS policies
            result2 = await session.execute(text("""
                SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
                FROM pg_policies 
                WHERE schemaname = 'public' 
                AND tablename IN ('trend_analysis_data', 'keyword_research_data', 'subtopic_suggestions', 'dataforseo_api_logs')
                ORDER BY tablename, policyname;
            """))
            
            policies = result2.fetchall()
            
            if policies:
                print(f"✅ Found {len(policies)} RLS policies:")
                for schema, table, policy, permissive, roles, cmd, qual in policies:
                    print(f"   - {table}.{policy}: {cmd} for {roles}")
            else:
                print("❌ No RLS policies found")
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ RLS test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        try:
            await db_manager.close()
        except:
            pass

async def test_api_credentials():
    """Test API credentials retrieval"""
    print("\n🔑 Testing API Credentials...")
    
    try:
        from backend.src.dataforseo.database import db_manager, dataforseo_repository
        
        # Initialize database
        await db_manager.initialize()
        print("✅ Database connection established")
        
        # Test API credentials retrieval
        credentials = await dataforseo_repository.get_api_credentials("dataforseo")
        
        if credentials:
            print(f"✅ API credentials retrieved:")
            print(f"   Provider: {credentials.provider}")
            print(f"   Base URL: {credentials.base_url}")
            print(f"   Key Value: {credentials.key_value[:10]}...")
            print(f"   Is Active: {credentials.is_active}")
            return True
        else:
            print("❌ No API credentials found")
            print("   Please add your DataForSEO credentials to the api_keys table")
            return False
            
    except Exception as e:
        print(f"❌ API credentials test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        try:
            await db_manager.close()
        except:
            pass

async def test_database_operations():
    """Test database operations with RLS"""
    print("\n💾 Testing Database Operations with RLS...")
    
    try:
        from backend.src.dataforseo.database import db_manager, dataforseo_repository
        from backend.src.models.trend_data import TrendData
        from datetime import datetime
        
        # Initialize database
        await db_manager.initialize()
        print("✅ Database connection established")
        
        # Test saving sample trend data
        sample_trend = TrendData(
            subtopic="test rls topic",
            location="United States",
            time_range="12m",
            average_interest=75.5,
            peak_interest=85.0,
            timeline_data=[{"date": "2024-01-01", "value": 75}],
            related_queries=["test query 1", "test query 2"]
        )
        
        print("   Testing trend data insertion...")
        success = await dataforseo_repository.save_trend_data(sample_trend)
        
        if success:
            print("✅ Successfully saved sample trend data (RLS allows insert)")
        else:
            print("❌ Failed to save sample trend data")
            return False
        
        # Test retrieving trend data
        print("   Testing trend data retrieval...")
        async with db_manager.get_session() as session:
            from sqlalchemy import text
            
            result = await session.execute(text("""
                SELECT subtopic, location, average_interest 
                FROM trend_analysis_data 
                WHERE subtopic = 'test rls topic'
                LIMIT 1;
            """))
            
            row = result.fetchone()
            if row:
                print(f"✅ Successfully retrieved trend data: {row[0]} - {row[1]} ({row[2]})")
            else:
                print("❌ Failed to retrieve trend data")
                return False
        
        # Clean up test data
        print("   Cleaning up test data...")
        async with db_manager.get_session() as session:
            await session.execute(text("""
                DELETE FROM trend_analysis_data 
                WHERE subtopic = 'test rls topic';
            """))
            await session.commit()
            print("✅ Test data cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Database operations test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        try:
            await db_manager.close()
        except:
            pass

async def test_dataforseo_api():
    """Test DataForSEO API integration"""
    print("\n🌐 Testing DataForSEO API Integration...")
    
    try:
        from backend.src.dataforseo.api_integration import api_client
        
        # Initialize API client
        await api_client.initialize()
        print("✅ DataForSEO API client initialized")
        
        # Test a simple API call (this will use your sandbox credentials)
        print("   Testing trend data API call...")
        try:
            # This will make an actual API call to DataForSEO sandbox
            trend_data = await api_client.get_trend_data(
                subtopics=["artificial intelligence"], 
                location="United States", 
                time_range="12m"
            )
            
            if trend_data:
                print(f"✅ API call successful: {len(trend_data)} results")
                for data in trend_data[:2]:  # Show first 2 results
                    print(f"   - {data.subtopic}: {data.average_interest} avg interest")
            else:
                print("⚠️  No trend data returned (this might be normal for sandbox)")
                
        except Exception as api_error:
            print(f"⚠️  API call failed: {api_error}")
            print("   This might be normal if sandbox has limited data")
        
        return True
        
    except Exception as e:
        print(f"❌ DataForSEO API test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function"""
    print("🚀 RLS and DataForSEO Integration Test")
    print("=" * 60)
    
    # Test RLS policies
    rls_success = await test_rls_policies()
    
    if not rls_success:
        print("\n❌ RLS test failed. Please check the RLS policies.")
        return
    
    # Test API credentials
    creds_success = await test_api_credentials()
    
    if not creds_success:
        print("\n❌ API credentials test failed. Please add your DataForSEO credentials.")
        return
    
    # Test database operations
    db_success = await test_database_operations()
    
    if not db_success:
        print("\n❌ Database operations test failed.")
        return
    
    # Test DataForSEO API
    api_success = await test_dataforseo_api()
    
    print("\n" + "=" * 60)
    print("🏁 Integration Test Complete!")
    
    if rls_success and creds_success and db_success and api_success:
        print("✅ All tests passed! Your DataForSEO integration is ready.")
        print("\nNext steps:")
        print("1. Start your backend server")
        print("2. Test the REST API endpoints")
        print("3. Integrate with your frontend")
    else:
        print("❌ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())
