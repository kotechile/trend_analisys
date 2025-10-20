#!/usr/bin/env python3
"""
Test complex insert to keyword_research_data table with all fields
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

async def test_complex_insert():
    """Test a complex insert with all fields to see what error occurs"""
    try:
        # Try to insert a record with all the fields that the backend is trying to use
        test_data = {
            "keyword": "test keyword complex",
            "search_volume": 1000,
            "keyword_difficulty": 30,
            "cpc": 5.0,
            "competition_value": 30,
            "competition": 0.3,
            "intent_type": "COMMERCIAL",
            "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
            "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
            "source": "test",
            "difficulty": 30,
            "competition_level": "MEDIUM",
            "low_top_of_page_bid": 2.0,
            "high_top_of_page_bid": 8.0,
            "main_intent": "COMMERCIAL",
            "monthly_trend": 0,
            "quarterly_trend": 0,
            "yearly_trend": 0,
            "search_volume_trend": [],
            "clickstream_search_volume": 1000,
            "clickstream_last_updated_time": "2025-01-18T22:48:34.223334",
            "clickstream_gender_distribution": {"male": 50, "female": 50},
            "clickstream_age_distribution": {"18-24": 30, "25-34": 40, "35-44": 30},
            "clickstream_monthly_searches": [{"year": 2025, "month": 1, "search_volume": 1000}],
            "serp_se_type": "organic",
            "serp_check_url": "https://example.com",
            "serp_item_types": ["organic"],
            "se_results_count": 1000000,
            "serp_last_updated_time": "2025-01-18T22:48:34.223334",
            "serp_previous_updated_time": "2025-01-18T22:48:34.223334",
            "avg_backlinks": 100,
            "avg_dofollow": 150,
            "avg_referring_pages": 200,
            "avg_referring_domains": 50,
            "avg_referring_main_domains": 10,
            "avg_rank": 25,
            "avg_main_domain_rank": 500,
            "backlinks_last_updated_time": "2025-01-18T22:48:34.223334",
            "normalized_bing_search_volume": 800,
            "normalized_bing_is_normalized": True,
            "normalized_bing_last_updated_time": "2025-01-18T22:48:34.223334",
            "normalized_bing_monthly_searches": [{"year": 2025, "month": 1, "search_volume": 800}],
            "normalized_clickstream_search_volume": 900,
            "normalized_clickstream_is_normalized": True,
            "normalized_clickstream_last_updated_time": "2025-01-18T22:48:34.223334",
            "normalized_clickstream_monthly_searches": [{"year": 2025, "month": 1, "search_volume": 900}],
            "depth": 1,
            "intent_type": "commercial",
            "created_at": "2025-01-18T22:48:34.223334",
            "categories": [10002, 10028],
            "monthly_searches": [{"year": 2025, "month": 1, "search_volume": 1000}],
            "last_updated_time": "2025-01-18T22:48:34.223334"
        }
        
        logger.info(f"Attempting to insert complex data with {len(test_data)} fields")
        
        response = supabase.table("keyword_research_data").insert(test_data).execute()
        logger.info(f"✅ Complex insert successful: {response.data}")
        
    except Exception as e:
        logger.error(f"❌ Complex insert failed: {e}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_complex_insert())
