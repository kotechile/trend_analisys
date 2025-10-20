#!/usr/bin/env python3
"""
Test to verify DataForSEO is using sandbox environment
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

async def test_dataforseo_credentials():
    """Test DataForSEO credentials and verify sandbox URL"""
    try:
        # Query for DataForSEO credentials
        response = supabase.table("api_keys").select("*").eq("provider", "dataforseo").eq("is_active", True).execute()
        
        if response.data:
            credential = response.data[0]
            base_url = credential.get("base_url")
            key_name = credential.get("key_name")
            
            logger.info(f"✅ Active DataForSEO credential found:")
            logger.info(f"   - Key Name: {key_name}")
            logger.info(f"   - Base URL: {base_url}")
            
            # Check if it's sandbox
            if "sandbox" in base_url.lower():
                logger.info("✅ CONFIRMED: Using SANDBOX environment")
                logger.info("   This will NOT consume production credits")
            else:
                logger.warning("❌ WARNING: Using PRODUCTION environment")
                logger.warning("   This WILL consume production credits!")
            
            # Check the full URL that would be used
            full_url = f"{base_url}/dataforseo_labs/google/keyword_ideas/live"
            logger.info(f"   - Full API URL: {full_url}")
            
        else:
            logger.error("❌ No active DataForSEO credentials found")
            
    except Exception as e:
        logger.error(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_dataforseo_credentials())
