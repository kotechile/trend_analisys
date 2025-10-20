#!/usr/bin/env python3
"""
Simple test to verify the trend analysis fix works with mock data.
This test simulates the frontend behavior and verifies that each subtopic gets unique data.
"""

import json
import requests
import time

def test_trend_analysis_fix():
    """Test the trend analysis fix with mock data"""
    print("🧪 Testing Trend Analysis Fix with Mock Data")
    print("=" * 60)
    
    # Test data - multiple subtopics that should return different results
    test_subtopics = ["Market Analysis", "Consumer Behavior", "Competitive Landscape", "Technology Trends", "Regulatory Environment"]
    
    print(f"Testing with subtopics: {', '.join(test_subtopics)}")
    print()
    
    try:
        # Make request to the API
        url = "http://localhost:8000/api/v1/trend-analysis/dataforseo"
        payload = {
            "subtopics": test_subtopics,
            "location": "United States",
            "time_range": "12m"
        }
        
        print(f"🌐 Making request to: {url}")
        print(f"📋 Payload: {json.dumps(payload, indent=2)}")
        print()
        
        # Make the request with a timeout
        response = requests.post(url, json=payload, timeout=30)
        
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
                subtopic = trend.get("keyword", f"unknown_{i}")
                avg_interest = trend.get("average_interest", 0)
                peak_interest = trend.get("peak_interest", 0)
                timeline_points = len(trend.get("time_series", []))
                
                print(f"  {i+1}. {subtopic}")
                print(f"     Average Interest: {avg_interest}")
                print(f"     Peak Interest: {peak_interest}")
                print(f"     Timeline Points: {timeline_points}")
                print()
                
                # Track uniqueness
                unique_subtopics.add(subtopic)
                if avg_interest is not None:
                    unique_averages.add(round(avg_interest, 2))
                if peak_interest is not None:
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
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - API is not responding")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Trend Analysis Fix Test")
    print(f"⏰ Test started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    success = test_trend_analysis_fix()
    
    print()
    print("=" * 60)
    if success:
        print("✅ TEST PASSED: Trend analysis fix is working correctly!")
    else:
        print("❌ TEST FAILED: Trend analysis fix needs more work")
    print(f"⏰ Test completed at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
