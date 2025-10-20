#!/usr/bin/env python3
"""
Test script for debugging multi-keyword trend analysis with DataForSEO API.

This script calls the backend API with 3 keywords and captures all logs
to help identify where the data processing is failing.
"""

import asyncio
import json
import logging
import sys
import time
from datetime import datetime
from typing import List, Dict, Any

import httpx

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'debug_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)

logger = logging.getLogger(__name__)

# Test configuration
BACKEND_URL = "http://localhost:8000"
API_ENDPOINT = "/api/v1/trend-analysis/dataforseo"

# Test data
TEST_KEYWORDS = [
    "Market Analysis",
    "Consumer Behavior", 
    "Competitive Landscape"
]
TEST_LOCATION = "United States"
TEST_TIME_RANGE = "12m"

class TrendAnalysisDebugger:
    """Debug helper for trend analysis API calls"""
    
    def __init__(self, backend_url: str = BACKEND_URL):
        self.backend_url = backend_url
        self.api_url = f"{backend_url}{API_ENDPOINT}"
        self.client = httpx.AsyncClient(timeout=900.0)  # 15 minutes timeout for Google Trends
        
    async def test_trend_analysis(self) -> Dict[str, Any]:
        """Test trend analysis with 3 keywords and capture detailed logs"""
        
        logger.info("🚀 Starting multi-keyword trend analysis debug test")
        logger.info(f"📊 Test keywords: {TEST_KEYWORDS}")
        logger.info(f"📍 Test location: {TEST_LOCATION}")
        logger.info(f"⏰ Test time range: {TEST_TIME_RANGE}")
        logger.info(f"🌐 Backend URL: {self.backend_url}")
        logger.info(f"🔗 API endpoint: {self.api_url}")
        
        # Prepare request payload
        payload = {
            "subtopics": TEST_KEYWORDS,
            "location": TEST_LOCATION,
            "time_range": TEST_TIME_RANGE
        }
        
        logger.info(f"📤 Request payload: {json.dumps(payload, indent=2)}")
        
        start_time = time.time()
        
        try:
            logger.info(f"🌐 Making API request to {self.api_url}")
            
            # Make the API request
            response = await self.client.post(
                self.api_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            request_duration = time.time() - start_time
            logger.info(f"⏱️ Request completed in {request_duration:.2f} seconds")
            
            # Log response details
            logger.info(f"📈 Response status: {response.status_code}")
            logger.info(f"📊 Response headers: {dict(response.headers)}")
            
            # Parse response
            try:
                response_data = response.json()
                logger.info(f"✅ Response JSON parsed successfully")
                logger.info(f"📊 Response data type: {type(response_data)}")
                logger.info(f"📊 Response data length: {len(response_data) if isinstance(response_data, list) else 'N/A'}")
                
                # Log detailed response structure
                if isinstance(response_data, list):
                    logger.info(f"📋 Response is a list with {len(response_data)} items")
                    
                    for i, item in enumerate(response_data):
                        logger.info(f"📊 Item {i}: {type(item)}")
                        if isinstance(item, dict):
                            logger.info(f"📊 Item {i} keys: {list(item.keys())}")
                            logger.info(f"📊 Item {i} keyword: {item.get('keyword', 'N/A')}")
                            logger.info(f"📊 Item {i} time_series length: {len(item.get('time_series', []))}")
                            logger.info(f"📊 Item {i} average_interest: {item.get('average_interest', 'N/A')}")
                            logger.info(f"📊 Item {i} peak_interest: {item.get('peak_interest', 'N/A')}")
                else:
                    logger.warning(f"⚠️ Response is not a list: {type(response_data)}")
                    logger.info(f"📊 Response content: {response_data}")
                
                # Validate response
                self._validate_response(response_data)
                
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "response_data": response_data,
                    "request_duration": request_duration,
                    "keywords_processed": len(response_data) if isinstance(response_data, list) else 0
                }
                
            except json.JSONDecodeError as e:
                logger.error(f"❌ Failed to parse JSON response: {e}")
                logger.error(f"📄 Raw response text: {response.text}")
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": f"JSON decode error: {e}",
                    "raw_response": response.text,
                    "request_duration": request_duration
                }
                
        except httpx.TimeoutException as e:
            request_duration = time.time() - start_time
            logger.error(f"❌ Request timed out after {request_duration:.2f}s: {e}")
            return {
                "success": False,
                "error": f"Timeout: {e}",
                "request_duration": request_duration
            }
            
        except Exception as e:
            request_duration = time.time() - start_time
            logger.error(f"❌ Request failed after {request_duration:.2f}s: {e}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            return {
                "success": False,
                "error": f"Request failed: {e}",
                "request_duration": request_duration
            }
    
    def _validate_response(self, response_data: Any) -> None:
        """Validate the API response structure"""
        logger.info(f"🔍 Validating response structure...")
        
        if not isinstance(response_data, list):
            logger.error(f"❌ Response is not a list: {type(response_data)}")
            return
        
        if len(response_data) == 0:
            logger.error(f"❌ Response is empty list")
            return
        
        logger.info(f"✅ Response has {len(response_data)} items")
        
        # Check each item
        for i, item in enumerate(response_data):
            logger.info(f"🔍 Validating item {i}...")
            
            if not isinstance(item, dict):
                logger.error(f"❌ Item {i} is not a dictionary: {type(item)}")
                continue
            
            # Check required fields
            required_fields = ['keyword', 'location', 'time_series', 'average_interest', 'peak_interest']
            for field in required_fields:
                if field not in item:
                    logger.error(f"❌ Item {i} missing required field '{field}'")
                else:
                    logger.info(f"✅ Item {i} has field '{field}': {item[field]}")
            
            # Check keyword uniqueness
            keyword = item.get('keyword', '')
            if keyword in TEST_KEYWORDS:
                logger.info(f"✅ Item {i} keyword '{keyword}' matches test data")
            else:
                logger.warning(f"⚠️ Item {i} keyword '{keyword}' not in test data")
            
            # Check time series data
            time_series = item.get('time_series', [])
            if isinstance(time_series, list) and len(time_series) > 0:
                logger.info(f"✅ Item {i} has {len(time_series)} time series points")
            else:
                logger.warning(f"⚠️ Item {i} has empty or invalid time series")
        
        logger.info(f"✅ Response validation completed")
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

async def main():
    """Main test function"""
    debugger = TrendAnalysisDebugger()
    
    try:
        logger.info("=" * 80)
        logger.info("🧪 MULTI-KEYWORD TREND ANALYSIS DEBUG TEST")
        logger.info("=" * 80)
        
        # Run the test
        result = await debugger.test_trend_analysis()
        
        # Log results
        logger.info("=" * 80)
        logger.info("📊 TEST RESULTS")
        logger.info("=" * 80)
        
        if result["success"]:
            logger.info(f"✅ Test completed successfully")
            logger.info(f"📊 Status code: {result['status_code']}")
            logger.info(f"⏱️ Request duration: {result['request_duration']:.2f}s")
            logger.info(f"📊 Keywords processed: {result['keywords_processed']}")
            
            if result['keywords_processed'] == len(TEST_KEYWORDS):
                logger.info(f"✅ All {len(TEST_KEYWORDS)} keywords processed successfully")
            else:
                logger.warning(f"⚠️ Only {result['keywords_processed']}/{len(TEST_KEYWORDS)} keywords processed")
        else:
            logger.error(f"❌ Test failed")
            logger.error(f"❌ Error: {result['error']}")
            if 'request_duration' in result:
                logger.error(f"⏱️ Request duration: {result['request_duration']:.2f}s")
        
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"❌ Test script failed: {e}")
        logger.error(f"❌ Error type: {type(e).__name__}")
    
    finally:
        await debugger.close()

if __name__ == "__main__":
    asyncio.run(main())
