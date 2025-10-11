#!/usr/bin/env python3
"""
Test script for AHREFS functionality
"""

import requests
import json
import csv
import io

# Test data based on the sample AHREFS file
test_ahrefs_data = """#	Keyword	Country	Difficulty	Volume	CPC	CPS	Parent Keyword	Last Update	SERP Features	Global volume	Traffic potential	Global traffic potential	First seen	Intents
1	insulation	us	47	78000	0.70	0.41	home depot insulation	2025-09-22 08:50:58	Sitelinks,People also ask,Local pack	177000	15000	15000	2015-09-01	Informational,Commercial,Non-branded,Non-local
2	house windows	us	33	7100	3.50	0.75	home depot windows	2025-09-22 11:19:26	Sitelinks,People also ask	15000	40000	42000	2015-09-01	Informational,Commercial,Non-branded,Non-local
3	real estate investor	us	48	4100	0.00	0.48	real estate investing	2025-09-22 11:15:07	Sitelinks,People also ask	7000	15000	17000	2015-09-01	Informational,Non-branded,Non-local
4	home maintenance	us	42	3300	0.30	0.65	home maintenance checklist	2025-09-21 16:10:32	Sitelinks,Local pack	8200	3200	4200	2015-09-08	Informational,Non-branded,Non-local
5	utility bills	us	4	2200	0.40	0.45	utility bill examples	2025-09-18 07:33:25	People also ask,Sitelinks	9500	2000	4100	2015-09-04	Informational,Non-branded,Non-local
"""

def test_ahrefs_upload():
    """Test AHREFS file upload"""
    print("Testing AHREFS file upload...")
    
    # Create a test file
    files = {
        'file': ('test_ahrefs.csv', test_ahrefs_data, 'text/csv')
    }
    
    data = {
        'topic_id': '550e8400-e29b-41d4-a716-446655440000',
        'user_id': '550e8400-e29b-41d4-a716-446655440001'
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/ahrefs/upload',
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"Upload response status: {response.status_code}")
        print(f"Upload response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ AHREFS upload test passed!")
            return response.json()
        else:
            print("❌ AHREFS upload test failed!")
            return None
            
    except Exception as e:
        print(f"❌ AHREFS upload test failed with error: {e}")
        return None

def test_ahrefs_content_generation():
    """Test AHREFS content generation"""
    print("\nTesting AHREFS content generation...")
    
    # Use the keywords that were successfully parsed from the upload test
    keywords = [
        {
            'keyword': 'insulation',
            'volume': 78000,
            'difficulty': 47,
            'cpc': 0.7,
            'traffic_potential': 15000,
            'intents': ['Informational', 'Commercial', 'Non-branded', 'Non-local'],
            'serp_features': ['Sitelinks', 'People also ask', 'Local pack'],
            'parent_keyword': 'home depot insulation',
            'country': 'us',
            'global_volume': 177000,
            'global_traffic_potential': 15000,
            'first_seen': '2015-09-01',
            'last_update': '2025-09-22 08:50:58'
        },
        {
            'keyword': 'house windows',
            'volume': 7100,
            'difficulty': 33,
            'cpc': 3.5,
            'traffic_potential': 40000,
            'intents': ['Informational', 'Commercial', 'Non-branded', 'Non-local'],
            'serp_features': ['Sitelinks', 'People also ask'],
            'parent_keyword': 'home depot windows',
            'country': 'us',
            'global_volume': 15000,
            'global_traffic_potential': 42000,
            'first_seen': '2015-09-01',
            'last_update': '2025-09-22 11:19:26'
        },
        {
            'keyword': 'home maintenance',
            'volume': 3300,
            'difficulty': 42,
            'cpc': 0.3,
            'traffic_potential': 3200,
            'intents': ['Informational', 'Non-branded', 'Non-local'],
            'serp_features': ['Sitelinks', 'Local pack'],
            'parent_keyword': 'home maintenance checklist',
            'country': 'us',
            'global_volume': 8200,
            'global_traffic_potential': 4200,
            'first_seen': '2015-09-08',
            'last_update': '2025-09-21 16:10:32'
        }
    ]
    
    request_data = {
        'topic_id': '550e8400-e29b-41d4-a716-446655440000',
        'topic_title': 'Home Improvement',
        'subtopics': ['insulation', 'windows', 'maintenance'],
        'ahrefs_keywords': keywords,
        'user_id': '550e8400-e29b-41d4-a716-446655440001'
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/content-ideas/generate-ahrefs',
            json=request_data,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        print(f"Content generation response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Content generation test passed!")
            print(f"Generated {result.get('total_ideas', 0)} ideas")
            print(f"Blog ideas: {result.get('blog_ideas', 0)}")
            print(f"Software ideas: {result.get('software_ideas', 0)}")
            
            # Show analytics summary
            analytics = result.get('analytics_summary', {})
            print(f"\nAnalytics Summary:")
            print(f"Total Volume: {analytics.get('total_volume', 0):,}")
            print(f"Avg Difficulty: {analytics.get('avg_difficulty', 0)}")
            print(f"Avg CPC: ${analytics.get('avg_cpc', 0)}")
            print(f"High Volume Keywords: {analytics.get('high_volume_keywords', 0)}")
            print(f"Low Difficulty Keywords: {analytics.get('low_difficulty_keywords', 0)}")
            print(f"Commercial Keywords: {analytics.get('commercial_keywords', 0)}")
            
            return result
        else:
            print(f"❌ Content generation test failed! Status: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Content generation test failed with error: {e}")
        return None

if __name__ == "__main__":
    print("🚀 Starting AHREFS functionality tests...")
    print("Make sure the backend server is running on http://localhost:8000")
    print("=" * 60)
    
    # Test upload
    upload_result = test_ahrefs_upload()
    
    if upload_result:
        # Test content generation
        generation_result = test_ahrefs_content_generation()
        
        if generation_result:
            print("\n🎉 All AHREFS tests passed successfully!")
        else:
            print("\n❌ Some tests failed. Check the output above.")
    else:
        print("\n❌ Upload test failed. Skipping content generation test.")
    
    print("=" * 60)
    print("Test completed!")
