#!/usr/bin/env python3
"""
Backend Unit Test Runner
T110: Backend unit tests for all services
"""
import sys
import os
import subprocess
from pathlib import Path

def run_unit_tests():
    """Run all backend unit tests"""
    print("🚀 Running Backend Unit Tests")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Test files to run
    test_files = [
        "tests/unit/test_services.py",
        "tests/unit/test_api_endpoints.py", 
        "tests/unit/test_middleware.py"
    ]
    
    # Run pytest for each test file
    results = []
    for test_file in test_files:
        if Path(test_file).exists():
            print(f"\n🔍 Running {test_file}...")
            try:
                result = subprocess.run([
                    sys.executable, "-m", "pytest", 
                    test_file, "-v", "--tb=short"
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(f"✅ {test_file} - PASSED")
                    results.append(True)
                else:
                    print(f"❌ {test_file} - FAILED")
                    print("STDOUT:", result.stdout)
                    print("STDERR:", result.stderr)
                    results.append(False)
            except Exception as e:
                print(f"❌ {test_file} - ERROR: {e}")
                results.append(False)
        else:
            print(f"⚠️ {test_file} - NOT FOUND")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 BACKEND UNIT TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {total - passed}")
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL BACKEND UNIT TESTS PASSED!")
        print("🚀 Backend services are working correctly!")
        return True
    else:
        print(f"\n⚠️ {total - passed} test files failed.")
        print("Please check the errors above.")
        return False

if __name__ == "__main__":
    success = run_unit_tests()
    sys.exit(0 if success else 1)
