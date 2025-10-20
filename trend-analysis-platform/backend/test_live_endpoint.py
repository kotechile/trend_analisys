#!/usr/bin/env python3
"""
Test the DataForSEO live endpoint directly to see what it returns.
"""

import asyncio
import json
import logging
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

async def test_live_endpoint():
    """Test DataForSEO live endpoint directly"""
    
    import httpx
    
    # DataForSEO API credentials (you'll need to get these from Supabase)
    base_url = "https://api.dataforseo.com/v3"
    
    # Test with a simple request to see the response structure
    test_payload = [{
        "api": "keywords_data",
        "function": "explore", 
        "se": "google_trends",
        "keywords": ["Market Analysis", "Consumer Behavior"],
        "location_name": "United States",
        "date_from": "2024-01-01",
        "date_to": "2024-12-31",
        "type": "web",
        "item_types": ["google_trends_graph", "google_trends_map"]
    }]
    
    logger.info("🚀 Testing DataForSEO LIVE endpoint directly")
    logger.info(f"📊 Payload: {json.dumps(test_payload, indent=2)}")
    
    # Note: This will fail without proper credentials, but we can see the error structure
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url}/keywords_data/google_trends/explore/live",
                json=test_payload,
                headers={"Content-Type": "application/json"}
            )
            
            logger.info(f"📈 Status: {response.status_code}")
            logger.info(f"📊 Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Success! Response structure:")
                logger.info(f"📊 Type: {type(data)}")
                logger.info(f"📊 Keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
                logger.info(f"📊 Full response: {json.dumps(data, indent=2)}")
            else:
                logger.error(f"❌ Error: {response.status_code}")
                logger.error(f"📄 Response: {response.text}")
                
    except Exception as e:
        logger.error(f"❌ Exception: {e}")
        logger.error(f"❌ Type: {type(e).__name__}")

if __name__ == "__main__":
    asyncio.run(test_live_endpoint())
