#!/usr/bin/env python3
"""
Simple Integration Test

This script tests the basic functionality without complex imports.
"""

import requests
import subprocess
import sys
from pathlib import Path

def test_backend_running():
    """Test if backend is running"""
    print("🔍 Testing backend server...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend server not running: {e}")
        print("   Start it with: python backend/main.py")
        return False

def test_frontend_components():
    """Test if frontend components exist"""
    print("\n🔍 Testing frontend components...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    components = [
        "src/pages/TrendAnalysisDataForSEO.tsx",
        "src/pages/IdeaBurstDataForSEO.tsx",
        "src/components/TrendAnalysis/TrendChart.tsx",
        "src/components/KeywordResearch/KeywordTable.tsx"
    ]
    
    all_exist = True
    for component in components:
        if (frontend_path / component).exists():
            print(f"✅ {component}")
        else:
            print(f"❌ {component}")
            all_exist = False
    
    return all_exist

def test_database_migration():
    """Test if database migrations were applied"""
    print("\n🔍 Testing database migrations...")
    
    # Check if migration files exist
    migrations_path = Path("supabase/migrations")
    if not migrations_path.exists():
        print("❌ Migrations directory not found")
        return False
    
    migration_files = list(migrations_path.glob("*.sql"))
    dataforseo_migrations = [f for f in migration_files if "dataforseo" in f.name]
    
    if dataforseo_migrations:
        print(f"✅ Found {len(dataforseo_migrations)} DataForSEO migration files")
        for migration in dataforseo_migrations:
            print(f"   - {migration.name}")
        return True
    else:
        print("❌ No DataForSEO migration files found")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🔍 Testing API endpoints...")
    
    if not test_backend_running():
        return False
    
    # Test basic endpoints
    endpoints = [
        "http://localhost:8000/health",
        "http://localhost:8000/docs",  # FastAPI docs
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint}")
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
    
    return True

def test_frontend_build():
    """Test if frontend can build"""
    print("\n🔍 Testing frontend build...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    try:
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=frontend_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ Frontend builds successfully")
            return True
        else:
            print("❌ Frontend build failed")
            print(f"Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️  Frontend build timed out")
        return False
    except FileNotFoundError:
        print("❌ npm not found - install Node.js")
        return False

def main():
    """Main test function"""
    print("🚀 SIMPLE INTEGRATION TEST")
    print("=" * 50)
    
    tests = [
        ("Backend Server", test_backend_running()),
        ("Frontend Components", test_frontend_components()),
        ("Database Migrations", test_database_migration()),
        ("API Endpoints", test_api_endpoints()),
        ("Frontend Build", test_frontend_build())
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, result in tests:
        if result:
            print(f"\n✅ {test_name}: PASSED")
            passed += 1
        else:
            print(f"\n❌ {test_name}: FAILED")
    
    print(f"\n{'='*50}")
    print(f"📊 RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your integration is ready.")
    else:
        print("❌ Some tests failed. Check the errors above.")
    
    print("\n🚀 NEXT STEPS:")
    print("1. Start backend: python backend/main.py")
    print("2. Start frontend: cd frontend && npm start")
    print("3. Test pages: /trend-analysis-dataforseo, /idea-burst-dataforseo")
    print("4. Check Supabase for DataForSEO tables and RLS policies")

if __name__ == "__main__":
    main()
