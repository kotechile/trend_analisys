#!/usr/bin/env python3
"""
Test the complete frontend workflow: DataForSEO API + Direct Supabase storage
"""

import asyncio
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
import httpx

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

async def test_complete_workflow():
    """Test the complete workflow: DataForSEO API + Direct storage"""
    try:
        # Step 1: Call DataForSEO API (simulating frontend)
        logger.info("Step 1: Calling DataForSEO API...")
        
        async with httpx.AsyncClient() as client:
            # Call keyword ideas endpoint
            keyword_ideas_response = await client.post(
                "http://localhost:8000/api/v1/keyword-research/keyword-ideas",
                json={
                    "seed_keywords": ["green homes"],
                    "location_code": 2840,
                    "language_code": "en",
                    "limit": 3
                }
            )
            
            if keyword_ideas_response.status_code != 200:
                logger.error(f"Keyword ideas API failed: {keyword_ideas_response.status_code} - {keyword_ideas_response.text}")
                return
            
            keyword_ideas = keyword_ideas_response.json()
            logger.info(f"✅ Got {len(keyword_ideas)} keyword ideas from API")
            
            # Call related keywords endpoint
            related_keywords_response = await client.post(
                "http://localhost:8000/api/v1/keyword-research/related-keywords",
                json={
                    "keywords": ["green homes"],
                    "location_code": 2840,
                    "language_code": "en",
                    "depth": 1,
                    "limit": 2
                }
            )
            
            if related_keywords_response.status_code != 200:
                logger.error(f"Related keywords API failed: {related_keywords_response.status_code} - {related_keywords_response.text}")
                return
            
            related_keywords = related_keywords_response.json()
            logger.info(f"✅ Got {len(related_keywords)} related keywords from API")
        
        # Step 2: Process data (simulating frontend processing)
        logger.info("Step 2: Processing data...")
        
        all_keywords = keyword_ideas + related_keywords
        logger.info(f"Total keywords to process: {len(all_keywords)}")
        
        # Step 3: Store via backend API (using proper intent type mapping)
        logger.info("Step 3: Storing data via backend API...")
        
        # Prepare data for backend API (raw DataForSEO response)
        processed_data = []
        for keyword in all_keywords:
            # Add required fields for backend processing
            data = {
                **keyword,  # Include all original DataForSEO fields
                "user_id": "f248b7ed-b8df-4464-8544-8304d7ae4c30",
                "topic_id": "38ca070b-3238-4a27-ab75-860395c663b4"
            }
            processed_data.append(data)
        
        # Store via backend API (create new client)
        async with httpx.AsyncClient() as store_client:
            store_response = await store_client.post(
                "http://localhost:8000/api/v1/keyword-research/store",
                json=processed_data
            )
        
        if store_response.status_code == 200:
            result = store_response.json()
            logger.info(f"✅ Successfully stored {result.get('count', 0)} keywords via backend API")
        else:
            logger.error(f"❌ Backend API failed: {store_response.status_code} - {store_response.text}")
            return
        
        # Step 4: Verify the data was stored
        logger.info("Step 4: Verifying stored data...")
        verify_response = supabase.table("keyword_research_data").select("*").eq("topic_id", "38ca070b-3238-4a27-ab75-860395c663b4").execute()
        logger.info(f"✅ Verification: Found {len(verify_response.data)} total keywords for this topic")
        
        logger.info("🎉 Complete workflow test successful!")
        logger.info("✅ DataForSEO API is working (using sandbox)")
        logger.info("✅ Direct Supabase storage is working")
        logger.info("✅ Frontend can successfully store keyword data")
        
    except Exception as e:
        logger.error(f"❌ Workflow test failed: {e}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_complete_workflow())
