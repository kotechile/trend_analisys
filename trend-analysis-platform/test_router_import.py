#!/usr/bin/env python3
"""
Test Router Import

This script tests if the DataForSEO router can be imported correctly.
"""

import sys
from pathlib import Path

# Add the backend src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "backend" / "src"))

def test_imports():
    """Test importing the router and its dependencies"""
    print("🔍 Testing DataForSEO Router Imports")
    print("=" * 50)
    
    try:
        print("1. Testing basic imports...")
        from typing import List, Optional, Dict, Any
        print("   ✅ typing imports")
        
        from fastapi import APIRouter, HTTPException
        print("   ✅ FastAPI imports")
        
        print("2. Testing model imports...")
        from models.trend_data import TrendData
        print("   ✅ TrendData model")
        
        from models.keyword_data import KeywordData
        print("   ✅ KeywordData model")
        
        from models.subtopic_data import SubtopicData
        print("   ✅ SubtopicData model")
        
        print("3. Testing service imports...")
        from dataforseo.database import dataforseo_repository
        print("   ✅ dataforseo_repository")
        
        from dataforseo.api_integration import api_client
        print("   ✅ api_client")
        
        print("4. Testing router import...")
        from routers.dataforseo_router import router
        print("   ✅ DataForSEO router")
        
        print("\n🎉 All imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_imports()
