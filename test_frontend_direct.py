#!/usr/bin/env python3
"""
Test frontend data storage directly to Supabase
"""

import asyncio
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from the .env file in the backend directory
dotenv_path = os.path.join(os.path.dirname(__file__), 'trend-analysis-platform', 'backend', '.env')
load_dotenv(dotenv_path)

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials not found in .env file.")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger.info("✅ Supabase client created successfully")

async def test_frontend_data():
    """Test with data that matches what the frontend sends"""
    try:
        # This is the exact data structure that the frontend sends
        frontend_data = [
            {
                "keyword": "green home",
                "search_volume": 1300,
                "keyword_difficulty": 33,
                "difficulty": 33,
                "cpc": 6.33,
                "competition": 0.3,
                "competition_level": "MEDIUM",
                "low_top_of_page_bid": 2.0,
                "high_top_of_page_bid": 8.0,
                "last_updated_time": "2025-01-18T22:48:34.223334",
                "avg_backlinks": 100,
                "avg_referring_domains": 50,
                "avg_referring_pages": 200,
                "avg_dofollow_links": 150,  # This field name from frontend
                "avg_rank": 25,
                "avg_main_domain_rank": 500,
                "backlinks_last_updated_time": "2025-01-18T22:48:34.223334",
                "categories": [10002, 10028],
                "monthly_searches": [{"year": 2025, "month": 1, "search_volume": 1300}],
                "serp_item_types": ["organic"],
                "se_results_count": 1000000,
                "check_url": "https://example.com",  # This field name from frontend
                "serp_last_updated_time": "2025-01-18T22:48:34.223334",
                "clickstream_search_volume": 1300,
                "clickstream_last_updated_time": "2025-01-18T22:48:34.223334",
                "clickstream_gender_distribution": {"male": 50, "female": 50},
                "clickstream_age_distribution": {"18-24": 30, "25-34": 40, "35-44": 30},
                "clickstream_monthly_searches": [{"year": 2025, "month": 1, "search_volume": 1300}],
                "normalized_bing_search_volume": 800,
                "normalized_bing_is_normalized": True,
                "normalized_bing_last_updated_time": "2025-01-18T22:48:34.223334",
                "normalized_bing_monthly_searches": [{"year": 2025, "month": 1, "search_volume": 800}],
                "normalized_clickstream_search_volume": 900,
                "normalized_clickstream_is_normalized": True,
                "normalized_clickstream_last_updated_time": "2025-01-18T22:48:34.223334",
                "normalized_clickstream_monthly_searches": [{"year": 2025, "month": 1, "search_volume": 900}],
                "depth": 1,
                "intent_type": "commercial",  # Lowercase from frontend
                "competition_value": 30,
                "created_at": "2025-01-18T22:48:34.223334",
                "source": "keyword_ideas",
                "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
                "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4"
            }
        ]
        
        logger.info("Testing frontend data structure...")
        
        # Process the data the same way the backend does
        processed_data = []
        for keyword in frontend_data:
            # Convert intent_type to uppercase
            intent_type = (keyword.get("intent_type") or "INFORMATIONAL").upper()
            
            # Map field names to database column names
            data = {
                "keyword": keyword.get("keyword", ""),
                "search_volume": int(float(keyword.get("search_volume", 0))) if keyword.get("search_volume") is not None else 0,
                "keyword_difficulty": int(float(keyword.get("keyword_difficulty", 0))) if keyword.get("keyword_difficulty") is not None else 0,
                "difficulty": int(float(keyword.get("difficulty", 0))) if keyword.get("difficulty") is not None else 0,
                "cpc": float(keyword.get("cpc", 0)) if keyword.get("cpc") is not None else 0,
                "competition": float(keyword.get("competition", 0)) if keyword.get("competition") is not None else 0,
                "competition_value": int(float(keyword.get("competition_value", 0))) if keyword.get("competition_value") is not None else 0,
                "competition_level": keyword.get("competition_level"),
                "low_top_of_page_bid": float(keyword.get("low_top_of_page_bid", 0)) if keyword.get("low_top_of_page_bid") is not None else 0,
                "high_top_of_page_bid": float(keyword.get("high_top_of_page_bid", 0)) if keyword.get("high_top_of_page_bid") is not None else 0,
                "last_updated_time": keyword.get("last_updated_time"),
                "avg_backlinks": int(float(keyword.get("avg_backlinks", 0))) if keyword.get("avg_backlinks") is not None else 0,
                "avg_referring_domains": int(float(keyword.get("avg_referring_domains", 0))) if keyword.get("avg_referring_domains") is not None else 0,
                "avg_referring_pages": int(float(keyword.get("avg_referring_pages", 0))) if keyword.get("avg_referring_pages") is not None else 0,
                "avg_dofollow": int(float(keyword.get("avg_dofollow_links", 0))) if keyword.get("avg_dofollow_links") is not None else 0,  # Map to database column
                "avg_rank": int(float(keyword.get("avg_rank", 0))) if keyword.get("avg_rank") is not None else 0,
                "avg_main_domain_rank": int(float(keyword.get("avg_main_domain_rank", 0))) if keyword.get("avg_main_domain_rank") is not None else 0,
                "backlinks_last_updated_time": keyword.get("backlinks_last_updated_time"),
                "categories": keyword.get("categories", []),
                "monthly_searches": keyword.get("monthly_searches", []),
                "serp_item_types": keyword.get("serp_item_types", []),
                "se_results_count": int(float(keyword.get("se_results_count", 0))) if keyword.get("se_results_count") is not None else 0,
                "serp_check_url": keyword.get("check_url"),  # Map to database column
                "serp_last_updated_time": keyword.get("serp_last_updated_time"),
                "clickstream_search_volume": int(float(keyword.get("clickstream_search_volume", 0))) if keyword.get("clickstream_search_volume") is not None else 0,
                "clickstream_last_updated_time": keyword.get("clickstream_last_updated_time"),
                "clickstream_gender_distribution": keyword.get("clickstream_gender_distribution", {}),
                "clickstream_age_distribution": keyword.get("clickstream_age_distribution", {}),
                "clickstream_monthly_searches": keyword.get("clickstream_monthly_searches", []),
                "normalized_bing_search_volume": int(float(keyword.get("normalized_bing_search_volume", 0))) if keyword.get("normalized_bing_search_volume") is not None else 0,
                "normalized_bing_is_normalized": keyword.get("normalized_bing_is_normalized", False),
                "normalized_bing_last_updated_time": keyword.get("normalized_bing_last_updated_time"),
                "normalized_bing_monthly_searches": keyword.get("normalized_bing_monthly_searches", []),
                "normalized_clickstream_search_volume": int(float(keyword.get("normalized_clickstream_search_volume", 0))) if keyword.get("normalized_clickstream_search_volume") is not None else 0,
                "normalized_clickstream_is_normalized": keyword.get("normalized_clickstream_is_normalized", False),
                "normalized_clickstream_last_updated_time": keyword.get("normalized_clickstream_last_updated_time"),
                "normalized_clickstream_monthly_searches": keyword.get("normalized_clickstream_monthly_searches", []),
                "depth": int(float(keyword.get("depth", 0))) if keyword.get("depth") is not None else 0,
                "intent_type": intent_type,
                "source": keyword.get("source", "keyword_ideas"),
                "user_id": keyword.get("user_id"),
                "topic_id": keyword.get("topic_id"),
                "created_at": keyword.get("created_at"),
                "updated_at": "2025-01-18T23:50:00.000000+00:00"
            }
            processed_data.append(data)
        
        logger.info(f"Processed {len(processed_data)} keywords")
        
        # Insert the processed data
        response = supabase.table("keyword_research_data").insert(processed_data).execute()
        logger.info(f"✅ Frontend data insert successful: {len(response.data)} records inserted")
        
        # Verify the data was inserted
        verify_response = supabase.table("keyword_research_data").select("*").eq("keyword", "green home").execute()
        logger.info(f"✅ Verification: Found {len(verify_response.data)} records with keyword 'green home'")
        
    except Exception as e:
        logger.error(f"❌ Frontend data test failed: {e}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_frontend_data())
