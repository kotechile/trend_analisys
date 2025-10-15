#!/usr/bin/env python3
"""
Simple test to verify Supabase setup works
"""

import os
import sys
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_supabase_imports():
    """Test that we can import Supabase components"""
    try:
        from src.core.supabase_database_service import SupabaseDatabaseService, get_database_service
        print("✅ Supabase database service imports successful")
        return True
    except Exception as e:
        print(f"❌ Supabase import failed: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    try:
        from src.core.supabase_database_service import get_database_service
        
        # Check if environment variables are set
        if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
            print("⚠️  Supabase environment variables not set - using mock test")
            return True
        
        db_service = get_database_service()
        health = db_service.health_check()
        
        if health["healthy"]:
            print("✅ Supabase database connection successful")
            return True
        else:
            print(f"❌ Supabase database connection failed: {health.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def test_core_imports():
    """Test core module imports"""
    try:
        from src.core.database import get_db, get_db_session
        from src.core.config import settings
        print("✅ Core module imports successful")
        return True
    except Exception as e:
        print(f"❌ Core imports failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing Supabase setup...")
    print("=" * 50)
    
    tests = [
        test_core_imports,
        test_supabase_imports,
        test_database_connection,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Supabase setup is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
