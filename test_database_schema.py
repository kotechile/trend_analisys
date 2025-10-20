#!/usr/bin/env python3
"""
Test to check the current database schema for keyword_research_data table
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

async def test_database_schema():
    """Test the current database schema"""
    try:
        # Try to get the table schema
        response = supabase.rpc('get_table_schema', {'table_name': 'keyword_research_data'}).execute()
        logger.info(f"✅ Table schema: {response.data}")
        
    except Exception as e:
        logger.error(f"❌ Error getting schema: {e}")
        
        # Try a simple query to see what fields exist
        try:
            response = supabase.table("keyword_research_data").select("*").limit(1).execute()
            logger.info(f"✅ Sample query successful: {response.data}")
        except Exception as query_error:
            logger.error(f"❌ Query error: {query_error}")
            
            # Try to check if the table exists at all
            try:
                response = supabase.table("keyword_research_data").select("id").limit(0).execute()
                logger.info("✅ Table exists but might be empty")
            except Exception as table_error:
                logger.error(f"❌ Table doesn't exist or has issues: {table_error}")

if __name__ == "__main__":
    asyncio.run(test_database_schema())
