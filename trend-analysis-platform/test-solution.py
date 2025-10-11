#!/usr/bin/env python3
"""
Solution Test Script
Tests the complete TrendTap solution
"""
import requests
import json
import time
import sys
from pathlib import Path

class TrendTapTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None
    
    def test_health(self):
        """Test backend health"""
        print("🔍 Testing backend health...")
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ Backend is healthy")
                return True
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Backend health check failed: {e}")
            return False
    
    def test_database_health(self):
        """Test database health"""
        print("🔍 Testing database health...")
        try:
            response = self.session.get(f"{self.base_url}/health/database")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    print("✅ Database is healthy")
                    return True
                else:
                    print(f"❌ Database health check failed: {data}")
                    return False
            else:
                print(f"❌ Database health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Database health check failed: {e}")
            return False
    
    def test_redis_health(self):
        """Test Redis health"""
        print("🔍 Testing Redis health...")
        try:
            response = self.session.get(f"{self.base_url}/health/redis")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    print("✅ Redis is healthy")
                    return True
                else:
                    print(f"❌ Redis health check failed: {data}")
                    return False
            else:
                print(f"❌ Redis health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Redis health check failed: {e}")
            return False
    
    def test_login(self):
        """Test user login"""
        print("🔍 Testing user login...")
        try:
            login_data = {
                "email": "admin@trendtap.com",
                "password": "admin123"
            }
            response = self.session.post(f"{self.base_url}/api/v1/users/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                if self.token:
                    print("✅ Login successful")
                    self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                    return True
                else:
                    print("❌ No access token received")
                    return False
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
    
    def test_affiliate_search(self):
        """Test affiliate search"""
        print("🔍 Testing affiliate search...")
        try:
            search_data = {
                "query": "technology",
                "category": "software"
            }
            response = self.session.post(f"{self.base_url}/api/v1/affiliate/search", json=search_data)
            if response.status_code == 200:
                print("✅ Affiliate search successful")
                return True
            else:
                print(f"❌ Affiliate search failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Affiliate search failed: {e}")
            return False
    
    def test_trend_analysis(self):
        """Test trend analysis"""
        print("🔍 Testing trend analysis...")
        try:
            trend_data = {
                "keywords": ["artificial intelligence", "machine learning"],
                "geo": "US",
                "timeframe": "today 5-y"
            }
            response = self.session.post(f"{self.base_url}/api/v1/trends/analyze", json=trend_data)
            if response.status_code == 200:
                print("✅ Trend analysis successful")
                return True
            else:
                print(f"❌ Trend analysis failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Trend analysis failed: {e}")
            return False
    
    def test_keyword_upload(self):
        """Test keyword upload"""
        print("🔍 Testing keyword upload...")
        try:
            keyword_data = {
                "keywords": [
                    {"keyword": "test keyword 1", "search_volume": 1000},
                    {"keyword": "test keyword 2", "search_volume": 2000}
                ]
            }
            response = self.session.post(f"{self.base_url}/api/v1/keywords/upload", json=keyword_data)
            if response.status_code == 201:
                print("✅ Keyword upload successful")
                return True
            else:
                print(f"❌ Keyword upload failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Keyword upload failed: {e}")
            return False
    
    def test_content_generation(self):
        """Test content generation"""
        print("🔍 Testing content generation...")
        try:
            content_data = {
                "title": "Test Content",
                "keywords": ["test", "content"],
                "type": "article"
            }
            response = self.session.post(f"{self.base_url}/api/v1/content/generate", json=content_data)
            if response.status_code == 201:
                print("✅ Content generation successful")
                return True
            else:
                print(f"❌ Content generation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Content generation failed: {e}")
            return False
    
    def test_software_generation(self):
        """Test software generation"""
        print("🔍 Testing software generation...")
        try:
            software_data = {
                "name": "Test Software",
                "description": "Test software description",
                "category": "productivity"
            }
            response = self.session.post(f"{self.base_url}/api/v1/software/generate", json=software_data)
            if response.status_code == 201:
                print("✅ Software generation successful")
                return True
            else:
                print(f"❌ Software generation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Software generation failed: {e}")
            return False
    
    def test_calendar_operations(self):
        """Test calendar operations"""
        print("🔍 Testing calendar operations...")
        try:
            # Create calendar entry
            calendar_data = {
                "title": "Test Event",
                "date": "2024-12-31",
                "description": "Test calendar entry"
            }
            response = self.session.post(f"{self.base_url}/api/v1/calendar/entries", json=calendar_data)
            if response.status_code == 201:
                print("✅ Calendar entry creation successful")
                
                # Get calendar entries
                response = self.session.get(f"{self.base_url}/api/v1/calendar/entries")
                if response.status_code == 200:
                    print("✅ Calendar entries retrieval successful")
                    return True
                else:
                    print(f"❌ Calendar entries retrieval failed: {response.status_code}")
                    return False
            else:
                print(f"❌ Calendar entry creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Calendar operations failed: {e}")
            return False
    
    def test_frontend_access(self):
        """Test frontend access"""
        print("🔍 Testing frontend access...")
        try:
            response = requests.get("http://localhost:5173")
            if response.status_code == 200:
                print("✅ Frontend is accessible")
                return True
            else:
                print(f"❌ Frontend access failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Frontend access failed: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting TrendTap Solution Tests")
        print("=" * 50)
        
        tests = [
            ("Backend Health", self.test_health),
            ("Database Health", self.test_database_health),
            ("Redis Health", self.test_redis_health),
            ("User Login", self.test_login),
            ("Affiliate Search", self.test_affiliate_search),
            ("Trend Analysis", self.test_trend_analysis),
            ("Keyword Upload", self.test_keyword_upload),
            ("Content Generation", self.test_content_generation),
            ("Software Generation", self.test_software_generation),
            ("Calendar Operations", self.test_calendar_operations),
            ("Frontend Access", self.test_frontend_access)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ {test_name} - ERROR: {e}")
                failed += 1
        
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED!")
            print("🚀 TrendTap solution is working correctly!")
        else:
            print(f"\n⚠️ {failed} tests failed. Please check the issues above.")
        
        return failed == 0

def main():
    """Main test function"""
    print("🔍 TrendTap Solution Test Suite")
    print("Make sure the backend and frontend are running before running this test.")
    print("Backend: http://localhost:8000")
    print("Frontend: http://localhost:5173")
    print()
    
    # Wait for user confirmation
    input("Press Enter to start testing...")
    
    tester = TrendTapTester()
    success = tester.run_all_tests()
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
