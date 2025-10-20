#!/usr/bin/env python3
"""
Test script to verify the trend analysis fix for multiple subtopics.
This script tests the fixed functional_dataforseo_router.py to ensure
each subtopic gets unique trend data instead of duplicate results.
"""

import asyncio
import httpx
import json
from datetime import datetime

async def test_trend_analysis_fix():
    """Test the trend analysis endpoint with multiple subtopics"""
    
    # Test data - multiple subtopics that should return different results
    test_subtopics = ["artificial intelligence", "machine learning", "deep learning", "neural networks"]
    
    print("🧪 Testing Trend Analysis Fix for Multiple Subtopics")
    print("=" * 60)
    print(f"Testing with subtopics: {', '.join(test_subtopics)}")
    print()
    
    try:
        # Make request to the fixed endpoint
        url = "http://localhost:8000/api/v1/trend-analysis/dataforseo"
        params = {
            "subtopics": ",".join(test_subtopics),
            "location": "United States",
            "time_range": "12m",
            "include_geography": True
        }
        
        print(f"🌐 Making request to: {url}")
        print(f"📋 Parameters: {params}")
        print()
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Received {len(data)} trend data points")
                print()
                
                # Analyze the results
                print("📊 Analyzing Results:")
                print("-" * 40)
                
                unique_subtopics = set()
                unique_averages = set()
                unique_peaks = set()
                
                for i, trend in enumerate(data):
                    subtopic = trend.get("subtopic", f"unknown_{i}")
                    avg_interest = trend.get("average_interest", 0)
                    peak_interest = trend.get("peak_interest", 0)
                    timeline_points = len(trend.get("timeline_data", []))
                    
                    print(f"  {i+1}. {subtopic}")
                    print(f"     Average Interest: {avg_interest:.2f}")
                    print(f"     Peak Interest: {peak_interest:.2f}")
                    print(f"     Timeline Points: {timeline_points}")
                    print()
                    
                    # Track uniqueness
                    unique_subtopics.add(subtopic)
                    unique_averages.add(round(avg_interest, 2))
                    unique_peaks.add(round(peak_interest, 2))
                
                # Verify fix
                print("🔍 Verification Results:")
                print("-" * 40)
                print(f"✅ Unique subtopics: {len(unique_subtopics)}/{len(test_subtopics)}")
                print(f"✅ Unique average values: {len(unique_averages)}")
                print(f"✅ Unique peak values: {len(unique_peaks)}")
                print()
                
                if len(unique_subtopics) == len(test_subtopics):
                    print("🎉 SUCCESS: All subtopics have unique identifiers!")
                else:
                    print("❌ ISSUE: Some subtopics are missing or duplicated")
                
                if len(unique_averages) > 1:
                    print("🎉 SUCCESS: Different average interest values detected!")
                else:
                    print("❌ ISSUE: All subtopics have the same average interest")
                
                if len(unique_peaks) > 1:
                    print("🎉 SUCCESS: Different peak interest values detected!")
                else:
                    print("❌ ISSUE: All subtopics have the same peak interest")
                
                print()
                print("📈 Summary:")
                print(f"   - Expected subtopics: {len(test_subtopics)}")
                print(f"   - Received subtopics: {len(unique_subtopics)}")
                print(f"   - Unique averages: {len(unique_averages)}")
                print(f"   - Unique peaks: {len(unique_peaks)}")
                
                # Overall assessment
                if (len(unique_subtopics) == len(test_subtopics) and 
                    len(unique_averages) > 1 and 
                    len(unique_peaks) > 1):
                    print("\n🎉 FIX VERIFIED: The trend analysis now returns unique data for each subtopic!")
                    return True
                else:
                    print("\n❌ FIX NOT WORKING: Some subtopics still have duplicate data")
                    return False
                    
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Trend Analysis Fix Test")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    success = await test_trend_analysis_fix()
    
    print()
    print("=" * 60)
    if success:
        print("✅ TEST PASSED: Trend analysis fix is working correctly!")
    else:
        print("❌ TEST FAILED: Trend analysis fix needs more work")
    print(f"⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    asyncio.run(main())
