#!/usr/bin/env python3
"""
Test DataForSEO credentials from database
"""

import asyncio
import sys
import os

# Add the backend src directory to the path
sys.path.append('/Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/backend/src')

async def test_dataforseo_credentials():
    """Test DataForSEO credentials from database"""
    
    try:
        from dataforseo.database import DataForSEORepository, DatabaseManager
        
        # Create database manager and repository
        db_manager = DatabaseManager()
        repository = DataForSEORepository(db_manager)
        
        # Initialize database connection
        await db_manager.initialize()
        print("✅ Database connection initialized")
        
        # Test getting DataForSEO credentials
        credentials = await repository.get_api_credentials("dataforseo")
        
        if credentials:
            print(f"✅ DataForSEO credentials found:")
            print(f"   - ID: {credentials.id}")
            print(f"   - Key Name: {credentials.key_name}")
            print(f"   - Base URL: {credentials.base_url}")
            print(f"   - Key Value: {credentials.key_value[:20]}...")
            print(f"   - Username: {credentials.username}")
            print(f"   - Password: {credentials.password[:10]}...")
        else:
            print("❌ No DataForSEO credentials found")
            
        # Test getting raw credentials
        raw_credentials = await repository.get_raw_api_credentials("dataforseo")
        
        if raw_credentials:
            print(f"✅ Raw DataForSEO credentials found:")
            print(f"   - Base URL: {raw_credentials.get('base_url')}")
            print(f"   - Key Value: {raw_credentials.get('key_value', '')[:20]}...")
            print(f"   - Username: {raw_credentials.get('user_name')}")
            print(f"   - Password: {raw_credentials.get('password', '')[:10]}...")
        else:
            print("❌ No raw DataForSEO credentials found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'db_manager' in locals():
            await db_manager.close()

if __name__ == "__main__":
    asyncio.run(test_dataforseo_credentials())
