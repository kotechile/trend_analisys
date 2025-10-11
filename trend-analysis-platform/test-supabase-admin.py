#!/usr/bin/env python3
"""
Test Supabase admin LLM endpoint directly
"""

import os
import sys
import requests
import time
from pathlib import Path

def test_supabase_connection():
    """Test direct connection to Supabase"""
    print("🧪 Testing Supabase Connection...")
    print("=" * 40)
    
    try:
        from sqlalchemy import create_engine, text
        
        # Connect to Supabase
        database_url = "postgresql://postgres:hobnE8-pumqet-sywxab@db.bvsqnmkvbbvtrcomtvnc.supabase.co:5432/postgres"
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
            
            # Test LLM providers table
            result = conn.execute(text("SELECT COUNT(*) FROM llm_providers"))
            count = result.fetchone()[0]
            print(f"✅ Found {count} LLM providers in database")
            
            # Get sample providers
            result = conn.execute(text("SELECT name, provider_type, is_active FROM llm_providers LIMIT 3"))
            providers = result.fetchall()
            print("📋 Sample providers:")
            for provider in providers:
                print(f"   - {provider[0]} ({provider[1]}) - Active: {provider[2]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def test_admin_endpoint():
    """Test the admin LLM endpoint"""
    print("\n🌐 Testing Admin LLM Endpoint...")
    print("=" * 40)
    
    # Wait for backend to be ready
    print("⏳ Waiting for backend to start...")
    time.sleep(5)
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"⚠️  Health endpoint returned {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Health endpoint failed: {e}")
        return False
    
    try:
        # Test admin LLM providers endpoint
        response = requests.get("http://localhost:8000/api/admin/llm/providers", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin LLM endpoint working - Found {len(data.get('providers', []))} providers")
            
            # Show sample data
            providers = data.get('providers', [])
            if providers:
                print("📋 Sample provider data:")
                for provider in providers[:3]:
                    print(f"   - {provider.get('name')} ({provider.get('provider_type')})")
            
            return True
        else:
            print(f"❌ Admin LLM endpoint returned {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Admin LLM endpoint failed: {e}")
        return False

def main():
    print("🚀 TrendTap Supabase Admin Test")
    print("=" * 50)
    
    # Test database connection
    db_ok = test_supabase_connection()
    
    if not db_ok:
        print("\n❌ Database connection failed. Cannot proceed with endpoint test.")
        return 1
    
    # Test admin endpoint
    endpoint_ok = test_admin_endpoint()
    
    if endpoint_ok:
        print("\n🎉 All tests passed!")
        print("✅ Supabase database connection working")
        print("✅ Admin LLM endpoint working")
        print("\n🌐 You can now visit:")
        print("   - Frontend: http://localhost:3000")
        print("   - Admin LLM: http://localhost:3000/admin/llm")
        print("   - Backend API: http://localhost:8000/docs")
        return 0
    else:
        print("\n❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())


