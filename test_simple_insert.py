#!/usr/bin/env python3
"""
Test simple insert to keyword_research_data table
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

async def test_simple_insert():
    """Test a simple insert to see what error occurs"""
    try:
        # Try to insert a minimal record
        test_data = {
            "keyword": "test keyword",
            "search_volume": 1000,
            "keyword_difficulty": 30,
            "cpc": 5.0,
            "competition_value": 30,
            "intent_type": "COMMERCIAL",
            "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
            "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4",
            "source": "test"
        }
        
        logger.info(f"Attempting to insert: {test_data}")
        
        response = supabase.table("keyword_research_data").insert(test_data).execute()
        logger.info(f"✅ Insert successful: {response.data}")
        
    except Exception as e:
        logger.error(f"❌ Insert failed: {e}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_simple_insert())
