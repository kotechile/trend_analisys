#!/usr/bin/env python3
"""
Add critical missing fields to keyword_research_data table
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

async def add_critical_fields():
    """Add the most critical missing fields"""
    try:
        # Critical fields that the backend code needs
        critical_fields = [
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS avg_dofollow_links INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS check_url TEXT;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS serp_item_types JSONB DEFAULT '[]';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS difficulty DECIMAL(5,2);",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS competition_level VARCHAR(50);",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS low_top_of_page_bid DECIMAL(10,4);",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS high_top_of_page_bid DECIMAL(10,4);",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS main_intent VARCHAR(50);",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS last_updated_time TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS monthly_searches JSONB DEFAULT '[]';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS avg_backlinks INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS avg_referring_domains INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS avg_referring_pages INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS avg_rank INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS avg_main_domain_rank INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS backlinks_last_updated_time TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS se_results_count BIGINT;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS serp_last_updated_time TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS clickstream_search_volume INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS clickstream_last_updated_time TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS clickstream_gender_distribution JSONB DEFAULT '{}';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS clickstream_age_distribution JSONB DEFAULT '{}';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS clickstream_monthly_searches JSONB DEFAULT '[]';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_bing_search_volume INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_bing_is_normalized BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_bing_last_updated_time TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_bing_monthly_searches JSONB DEFAULT '[]';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_clickstream_search_volume INTEGER;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_clickstream_is_normalized BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_clickstream_last_updated_time TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS normalized_clickstream_monthly_searches JSONB DEFAULT '[]';",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 1;",
            "ALTER TABLE keyword_research_data ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;"
        ]
        
        logger.info(f"Adding {len(critical_fields)} critical fields...")
        
        for i, sql in enumerate(critical_fields):
            try:
                logger.info(f"Executing: {sql}")
                # Use the SQL editor approach
                result = supabase.rpc('exec_sql', {'sql': sql}).execute()
                logger.info(f"✅ Field {i+1} added successfully")
            except Exception as e:
                logger.warning(f"⚠️ Field {i+1} might already exist: {e}")
        
        logger.info("✅ Critical fields added successfully")
        
        # Test if we can now insert data
        logger.info("Testing data insertion...")
        test_data = {
            "keyword": "test after migration",
            "search_volume": 1000,
            "keyword_difficulty": 30,
            "cpc": 5.0,
            "competition_value": 30,
            "competition": 0.3,
            "intent_type": "COMMERCIAL",
            "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
            "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
            "source": "test"
        }
        
        response = supabase.table("keyword_research_data").insert(test_data).execute()
        logger.info(f"✅ Test insertion successful: {response.data}")
        
    except Exception as e:
        logger.error(f"❌ Failed to add critical fields: {e}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    asyncio.run(add_critical_fields())
