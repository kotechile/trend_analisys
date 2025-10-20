#!/usr/bin/env python3
"""
Test script to debug idea generation issue
"""

import requests
import json

def test_idea_generation():
    """Test the idea generation endpoint"""
    
    # Test data - using the same data from the frontend logs
    test_data = {
        "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
        "topic_title": "Eco Friendly Homes",
        "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
        "subtopics": [],
        "keywords": [
            {
                "id": "8da06ebf-ecb6-4957-ac6d-d55832652ff8",
                "keyword": "original phone brands",
                "search_volume": 10,
                "keyword_difficulty": 0,
                "cpc": 0,
                "competition_value": 0,
                "trend_percentage": 0,
                "intent_type": "TRANSACTIONAL",
                "priority_score": 35,
                "related_keywords": [],
                "search_volume_trend": [],
                "created_at": "2025-10-19T01:36:24.907238+00:00",
                "updated_at": "2025-10-19T01:36:28.878024+00:00",
                "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
                "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
                "source": "keyword_ideas",
                "competition": 0,
                "seed_keywords": [],
                "difficulty": 0,
                "competition_level": None,
                "low_top_of_page_bid": 0,
                "high_top_of_page_bid": 0,
                "main_intent": "transactional",
                "monthly_trend": 0,
                "quarterly_trend": 0,
                "yearly_trend": 0,
                "avg_backlinks": 0,
                "avg_referring_domains": 0,
                "last_updated_time": None,
                "related_keyword": None,
                "seed_keyword": None,
                "categories": [],
                "monthly_searches": [],
                "core_keyword": None,
                "synonym_clustering_algorithm": None,
                "detected_language": None,
                "is_another_language": None,
                "foreign_intent": [],
                "search_intent_last_updated_time": None,
                "clickstream_search_volume": 0,
                "clickstream_last_updated_time": None,
                "clickstream_gender_distribution": {},
                "clickstream_age_distribution": {},
                "clickstream_monthly_searches": [],
                "serp_se_type": None,
                "serp_check_url": None,
                "serp_item_types": [],
                "se_results_count": 0,
                "serp_last_updated_time": None,
                "serp_previous_updated_time": None,
                "avg_dofollow": 0,
                "avg_referring_pages": 0,
                "avg_referring_main_domains": 0,
                "avg_rank": 0,
                "avg_main_domain_rank": 0,
                "backlinks_last_updated_time": None,
                "normalized_bing_search_volume": 0,
                "normalized_bing_is_normalized": None,
                "normalized_bing_last_updated_time": None,
                "normalized_bing_monthly_searches": [],
                "normalized_clickstream_search_volume": 0,
                "normalized_clickstream_is_normalized": None,
                "normalized_clickstream_last_updated_time": None,
                "normalized_clickstream_monthly_searches": [],
                "depth": 0
            },
            {
                "id": "3e1fa5f2-fd52-46b1-8c87-7af6891cadbf",
                "keyword": "watches with phone capabilities",
                "search_volume": 30,
                "keyword_difficulty": 60,
                "cpc": 2.14,
                "competition_value": 100,
                "trend_percentage": 0,
                "intent_type": "COMMERCIAL",
                "priority_score": 39,
                "related_keywords": [],
                "search_volume_trend": [],
                "created_at": "2025-10-19T01:36:24.907032+00:00",
                "updated_at": "2025-10-19T01:36:28.877874+00:00",
                "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
                "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
                "source": "keyword_ideas",
                "competition": 1,
                "seed_keywords": [],
                "difficulty": 60,
                "competition_level": "HIGH",
                "low_top_of_page_bid": 0,
                "high_top_of_page_bid": 0,
                "main_intent": "commercial",
                "monthly_trend": 0,
                "quarterly_trend": 0,
                "yearly_trend": 0,
                "avg_backlinks": 0,
                "avg_referring_domains": 0,
                "last_updated_time": None,
                "related_keyword": None,
                "seed_keyword": None,
                "categories": [],
                "monthly_searches": [],
                "core_keyword": None,
                "synonym_clustering_algorithm": None,
                "detected_language": None,
                "is_another_language": None,
                "foreign_intent": [],
                "search_intent_last_updated_time": None,
                "clickstream_search_volume": 0,
                "clickstream_last_updated_time": None,
                "clickstream_gender_distribution": {},
                "clickstream_age_distribution": {},
                "clickstream_monthly_searches": [],
                "serp_se_type": None,
                "serp_check_url": None,
                "serp_item_types": [],
                "se_results_count": 0,
                "serp_last_updated_time": None,
                "serp_previous_updated_time": None,
                "avg_dofollow": 0,
                "avg_referring_pages": 0,
                "avg_referring_main_domains": 0,
                "avg_rank": 0,
                "avg_main_domain_rank": 0,
                "backlinks_last_updated_time": None,
                "normalized_bing_search_volume": 0,
                "normalized_bing_is_normalized": None,
                "normalized_bing_last_updated_time": None,
                "normalized_bing_monthly_searches": [],
                "normalized_clickstream_search_volume": 0,
                "normalized_clickstream_is_normalized": None,
                "normalized_clickstream_last_updated_time": None,
                "normalized_clickstream_monthly_searches": [],
                "depth": 0
            }
        ]
    }
    
    try:
        # Make request to the idea generation endpoint
        response = requests.post(
            "http://localhost:8000/api/content-ideas/generate",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_idea_generation()
