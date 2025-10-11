#!/usr/bin/env python3
"""
Google OAuth Configuration Verification Script

This script helps verify that your Google OAuth setup is working correctly.
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_supabase_google_config():
    """Test if Google OAuth is configured in Supabase"""
    print("🔍 Testing Supabase Google OAuth configuration...")
    
    url = "https://bvsqnmkvbbvtrcomtvnc.supabase.co/auth/v1/settings"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDYyMTQsImV4cCI6MjA3NTA4MjIxNH0.Vg6_r6djVh9vhwP6QNvg3HS5X4AI6Ic3EGp1BlHOeig"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if 'external' in data and 'google' in data['external']:
            google_config = data['external']['google']
            print("✅ Supabase Google OAuth configuration found!")
            
            # Handle different response formats
            if isinstance(google_config, dict):
                enabled = google_config.get('enabled', False)
                client_id = google_config.get('client_id', '')
                redirect_uri = google_config.get('redirect_uri', '')
            else:
                enabled = bool(google_config)
                client_id = 'Unknown'
                redirect_uri = 'Unknown'
            
            print(f"   Enabled: {enabled}")
            print(f"   Client ID: {'Set' if client_id and client_id != 'Unknown' else 'Not Set'}")
            print(f"   Redirect URI: {redirect_uri if redirect_uri != 'Unknown' else 'Not Set'}")
            
            if enabled and client_id and client_id != 'Unknown':
                print("🎉 Google OAuth is properly configured!")
                return True
            else:
                print("❌ Google OAuth is not fully configured")
                return False
        else:
            print("❌ Google OAuth configuration not found")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_frontend_connection():
    """Test if frontend is accessible"""
    print("\n🔍 Testing frontend connection...")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running on http://localhost:3000")
            return True
        else:
            print(f"❌ Frontend returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def test_backend_connection():
    """Test if backend is accessible"""
    print("\n🔍 Testing backend connection...")
    
    try:
        response = requests.get("http://localhost:8000/supabase-health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running on http://localhost:8000")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def main():
    print("🚀 TrendTap Google OAuth Verification")
    print("=" * 50)
    
    # Test Supabase configuration
    supabase_ok = test_supabase_google_config()
    
    # Test frontend
    frontend_ok = test_frontend_connection()
    
    # Test backend
    backend_ok = test_backend_connection()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Supabase Google OAuth: {'✅' if supabase_ok else '❌'}")
    print(f"   Frontend (localhost:3000): {'✅' if frontend_ok else '❌'}")
    print(f"   Backend (localhost:8000): {'✅' if backend_ok else '❌'}")
    
    if supabase_ok and frontend_ok and backend_ok:
        print("\n🎉 All systems ready! You can now test Google OAuth at http://localhost:3000")
    else:
        print("\n⚠️  Some issues found. Please check the configuration above.")
        
        if not supabase_ok:
            print("\n🔧 To fix Supabase Google OAuth:")
            print("   1. Go to Supabase Dashboard → Authentication → Providers")
            print("   2. Enable Google provider")
            print("   3. Add your Google Client ID and Secret")
            print("   4. Set callback URL: https://bvsqnmkvbbvtrcomtvnc.supabase.co/auth/v1/callback")
        
        if not frontend_ok:
            print("\n🔧 To fix Frontend:")
            print("   Run: docker-compose -f docker-compose-local.yml up frontend -d")
        
        if not backend_ok:
            print("\n🔧 To fix Backend:")
            print("   Run: docker-compose -f docker-compose-local.yml up backend -d")

if __name__ == "__main__":
    main()
