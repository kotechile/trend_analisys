#!/usr/bin/env python3
"""
Test simplified backend logic with only core fields
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

def process_keyword_data(keyword, user_id, topic_id):
    """Process keyword data using only core fields that exist in database"""
    
    # Get competition value, keep as decimal (0.0-1.0 range) for competition field
    competition_val = keyword.get("competition")
    if competition_val is not None and isinstance(competition_val, (int, float)):
        competition_val = min(float(competition_val), 1.0)
    else:
        competition_val = 0.0
    
    # Handle competition_value - either provided directly or calculate from competition
    competition_value_provided = keyword.get("competition_value")
    if competition_value_provided is not None and isinstance(competition_value_provided, (int, float)):
        competition_value_int = int(competition_value_provided)
    else:
        competition_value_int = int(competition_val * 100) if competition_val is not None else 0
    
    # Get CPC value and ensure it fits in numeric(3,2) constraint (max 9.99)
    cpc_val = keyword.get("cpc", 0)
    if cpc_val is not None and isinstance(cpc_val, (int, float)):
        cpc_val = min(float(cpc_val), 9.99)
    else:
        cpc_val = 0
    
    # Convert intent_type to uppercase
    intent_type = (keyword.get("intent_type") or keyword.get("main_intent") or "INFORMATIONAL").upper()
    
    # Create data with only core fields
    data = {
        "keyword": keyword.get("keyword", ""),
        "search_volume": int(float(keyword.get("search_volume", 0))) if keyword.get("search_volume") is not None else 0,
        "keyword_difficulty": int(float(keyword.get("keyword_difficulty", 0))) if keyword.get("keyword_difficulty") is not None else 0,
        "cpc": cpc_val,
        "competition_value": competition_value_int,
        "competition": competition_val,
        "intent_type": intent_type,
        "user_id": user_id,
        "topic_id": topic_id,
        "source": keyword.get("source", "keyword_ideas")
    }
    
    return data

async def test_simplified_backend():
    """Test simplified backend logic"""
    try:
        # Test data from frontend
        test_keywords = [
            {
                "keyword": "green home",
                "search_volume": 1300,
                "keyword_difficulty": 33,
                "difficulty": 33,
                "cpc": 6.33,
                "competition": 0.3,
                "competition_level": "MEDIUM",
                "intent_type": "commercial",  # lowercase as frontend sends
                "competition_value": 30,
                "source": "keyword_ideas"
            }
        ]
        
        user_id = "f248b7ed-b8df-4464-8544-8304d7ae4c30"
        topic_id = "38ca070b-3238-4a27-ab75-860395c663b4"
        
        # Process keywords
        data_list = []
        for keyword in test_keywords:
            processed_data = process_keyword_data(keyword, user_id, topic_id)
            data_list.append(processed_data)
            logger.info(f"Processed keyword: {processed_data['keyword']} - intent_type: {processed_data['intent_type']}")
        
        # Insert to database
        logger.info(f"Inserting {len(data_list)} keywords")
        response = supabase.table("keyword_research_data").insert(data_list).execute()
        logger.info(f"✅ Simplified backend test successful: {response.data}")
        
    except Exception as e:
        logger.error(f"❌ Simplified backend test failed: {e}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_simplified_backend())
