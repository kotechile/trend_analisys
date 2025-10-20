"""
Database integration for DataForSEO features

Handles database connections and data persistence using Supabase
for trend analysis and keyword research functionality.
"""

import asyncio
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
from supabase import create_client, Client

from ..core.config import settings
from ..models.trend_data import TrendData
from ..models.keyword_data import KeywordData
from ..models.subtopic_data import SubtopicData
from ..models.api_credentials import APICredentials

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages database connections and operations for DataForSEO features using Supabase"""
    
    def __init__(self):
        self.client: Optional[Client] = None
        
    async def initialize(self):
        """Initialize Supabase connection"""
        try:
            if not settings.supabase_url or not settings.supabase_service_role_key:
                raise ValueError("Supabase URL and service role key must be configured")
            
            self.client = create_client(
                settings.supabase_url,
                settings.supabase_service_role_key
            )
            
            logger.info("Supabase database connection initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase database: {e}")
            raise
    
    def get_client(self) -> Client:
        """Get Supabase client"""
        if not self.client:
            raise RuntimeError("Database not initialized. Call initialize() first.")
        return self.client
    
    async def close(self):
        """Close database connections"""
        # Supabase client doesn't need explicit cleanup
        logger.info("Supabase database connection closed")

class DataForSEORepository:
    """Repository for DataForSEO data operations"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    def _map_intent_type(self, raw_intent: str) -> str:
        """Map intent types to allowed database values"""
        intent_upper = raw_intent.upper() if raw_intent else "INFORMATIONAL"
        if intent_upper in ["INFORMATIONAL", "COMMERCIAL", "TRANSACTIONAL"]:
            return intent_upper
        elif intent_upper == "NAVIGATIONAL":
            return "INFORMATIONAL"
        else:
            return "INFORMATIONAL"
    
    async def get_api_credentials(self, provider: str = "dataforseo") -> Optional[APICredentials]:
        """Get active API credentials for DataForSEO"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            result = client.table("api_keys").select("key_value, base_url, user_name, password").eq("provider", provider).eq("is_active", True).order("updated_at", desc=True).limit(1).execute()
            
            if result.data:
                row = result.data[0]
                
                # Handle base_url formatting
                base_url = row.get("base_url")
                if not base_url:
                    raise ValueError("DataForSEO base_url not found in database")
                if not base_url.startswith(('http://', 'https://')):
                    base_url = f"https://{base_url}"
                
                return APICredentials(
                    id=row.get("id", f"{provider}_{row.get('created_at', 'default')}"),
                    base_url=base_url,
                    key_value=row.get("key_value"),
                    provider=row.get("provider") or provider,  # Use the requested provider if not set
                    is_active=row.get("is_active", True),
                    rate_limit=row.get("rate_limit"),  # Optional field
                    quota_used=row.get("quota_used"),  # Optional field
                    quota_limit=row.get("quota_limit"),  # Optional field
                    created_at=datetime.fromisoformat(row.get("created_at", datetime.utcnow().isoformat())) if row.get("created_at") else datetime.utcnow(),
                    updated_at=datetime.fromisoformat(row.get("updated_at", datetime.utcnow().isoformat())) if row.get("updated_at") else datetime.utcnow()
                )
            return None
                
        except Exception as e:
            logger.error(f"Error fetching API credentials: {e}")
            return None
    
    async def get_raw_api_credentials(self, provider: str = "dataforseo") -> Optional[Dict[str, Any]]:
        """Get raw API credentials data for DataForSEO (including user_name and password)"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            result = client.table("api_keys").select("key_value, base_url, user_name, password").eq("provider", provider).eq("is_active", True).order("updated_at", desc=True).limit(1).execute()
            
            if result.data:
                return result.data[0]
            return None
                
        except Exception as e:
            logger.error(f"Error fetching raw API credentials: {e}")
            return None
    
    async def clear_previous_trends(self, location: str, time_range: str) -> bool:
        """Clear previous trend data for a location and time range"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # Delete all previous trend data for this location and time range
            result = client.table("trend_analysis_data").delete().eq("location", location).eq("time_range", time_range).execute()
            
            logger.info(f"Cleared {len(result.data) if result.data else 0} previous trend records for {location} - {time_range}")
            return True
                
        except Exception as e:
            logger.error(f"Error clearing previous trends: {e}")
            return False

    async def save_trend_data(self, trend_data: TrendData) -> bool:
        """Save trend data to database"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # Prepare data for Supabase
            data = {
                "subtopic": trend_data.keyword,  # Map keyword to subtopic for database
                "location": trend_data.location,
                "time_range": "12m",  # Default time range
                "average_interest": sum(point.value for point in trend_data.time_series) / len(trend_data.time_series) if trend_data.time_series and len(trend_data.time_series) > 0 else 0,
                "peak_interest": max(point.value for point in trend_data.time_series) if trend_data.time_series and len(trend_data.time_series) > 0 else 0,
                "timeline_data": [point.dict() for point in trend_data.time_series] if trend_data.time_series else [],
                "related_queries": trend_data.related_queries or [],
                "demographic_data": trend_data.demographics.dict() if trend_data.demographics else None,
                "geographic_data": [geo.dict() for geo in trend_data.geographic_data] if trend_data.geographic_data else [],
                "created_at": trend_data.created_at.isoformat() if trend_data.created_at else datetime.utcnow().isoformat(),
                "updated_at": trend_data.updated_at.isoformat() if trend_data.updated_at else datetime.utcnow().isoformat()
            }
            
            # Insert data (simple insert for now)
            result = client.table("trend_analysis_data").insert(data).execute()
            
            return len(result.data) > 0
                
        except Exception as e:
            logger.error(f"Error saving trend data: {e}")
            return False
    
    async def get_trend_data(self, subtopic: str, location: str, time_range: str) -> Optional[TrendData]:
        """Get cached trend data from database"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # Calculate minimum updated time for cache (24h)
            min_updated_at = (datetime.utcnow() - timedelta(hours=24)).isoformat()
            
            result = client.table("trend_analysis_data").select("*").eq("subtopic", subtopic).eq("location", location).eq("time_range", time_range).gte("updated_at", min_updated_at).order("updated_at", desc=True).limit(1).execute()
            
            if result.data:
                row = result.data[0]
                return TrendData(
                    subtopic=row["subtopic"],
                    location=row["location"],
                    time_range=row["time_range"],
                    average_interest=row["average_interest"],
                    peak_interest=row["peak_interest"],
                    timeline_data=row["timeline_data"] or [],
                    related_queries=row["related_queries"] or [],
                    demographic_data=row["demographic_data"]
                )
            return None
                
        except Exception as e:
            logger.error(f"Error fetching trend data: {e}")
            return None
    
    async def delete_keywords_for_topic(self, topic_id: str, user_id: str) -> bool:
        """Delete existing keyword data for a specific topic and user"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # Delete records for this topic and user
            result = client.table("keyword_research_data").delete().eq("topic_id", topic_id).eq("user_id", user_id).execute()
            
            logger.info(f"Deleted existing keyword records for topic_id: {topic_id}, user_id: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting keyword data for topic {topic_id}: {e}")
            return False

    async def save_keyword_data(self, keyword_data: KeywordData) -> bool:
        """Save keyword data to database"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # Prepare data for Supabase
            data = {
                "keyword": keyword_data.keyword,
                "search_volume": keyword_data.search_volume,
                "keyword_difficulty": keyword_data.keyword_difficulty,
                "cpc": keyword_data.cpc,
                "competition_value": keyword_data.competition_value,
                "trend_percentage": keyword_data.trend_percentage,
                "intent_type": keyword_data.intent_type,
                "priority_score": keyword_data.priority_score,
                "related_keywords": keyword_data.related_keywords or [],
                "search_volume_trend": keyword_data.search_volume_trend or [],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Use upsert (insert with conflict resolution)
            result = client.table("keyword_research_data").upsert(data, on_conflict="keyword").execute()
            
            return len(result.data) > 0
                
        except Exception as e:
            logger.error(f"Error saving keyword data: {e}")
            return False

    async def save_keyword_data_batch(self, keywords: List[Dict[str, Any]]) -> bool:
        """Save multiple keyword data objects to database"""
        data_list = []  # Initialize early to avoid reference errors
        try:
            # Use direct Supabase connection instead of database manager
            from ..core.config import settings
            from supabase import create_client
            
            logger.info(f"DEBUG - Supabase URL: {settings.supabase_url}")
            logger.info(f"DEBUG - Service role key exists: {bool(settings.supabase_service_role_key)}")
            
            # Create direct Supabase client
            client = create_client(settings.supabase_url, settings.supabase_service_role_key)
            
            logger.info(f"Using direct Supabase connection for {len(keywords)} keywords")
            
            # Extract topic_id and user_id from the first keyword for cleanup
            if keywords and len(keywords) > 0:
                topic_id = keywords[0].get("topic_id")
                user_id = keywords[0].get("user_id")
                
                # Validate UUIDs strictly for production data
                import uuid
                try:
                    if topic_id:
                        uuid.UUID(topic_id)
                    if user_id:
                        uuid.UUID(user_id)
                    logger.info(f"DEBUG - Valid UUIDs: topic_id={topic_id}, user_id={user_id}")
                except ValueError as e:
                    logger.error(f"Invalid UUID format: {e}")
                    logger.error(f"topic_id: {topic_id}, user_id: {user_id}")
                    raise ValueError(f"Invalid UUID format: {e}")
                
                # Validate that topic_id exists in research_topics table
                if topic_id:
                    try:
                        topic_check = client.table("research_topics").select("id").eq("id", topic_id).execute()
                        if not topic_check.data:
                            logger.error(f"Topic ID {topic_id} does not exist in research_topics table")
                            raise ValueError(f"Topic ID {topic_id} does not exist in research_topics table")
                        logger.info(f"DEBUG - Topic ID {topic_id} exists in research_topics table")
                    except Exception as e:
                        logger.error(f"Error validating topic_id: {e}")
                        raise ValueError(f"Error validating topic_id: {e}")
                
            # Filter out duplicates to avoid unique constraint violations
            seen_keywords = set()
            unique_keywords = []
            for keyword in keywords:
                keyword_text = keyword.get("keyword", "").lower().strip()
                if keyword_text and keyword_text not in seen_keywords:
                    seen_keywords.add(keyword_text)
                    unique_keywords.append(keyword)
                else:
                    logger.info(f"DEBUG - Skipping duplicate keyword: {keyword_text}")
            
            logger.info(f"Filtered {len(keywords)} keywords to {len(unique_keywords)} unique keywords")
            keywords = unique_keywords
            
            # Prepare data for Supabase
            for i, keyword in enumerate(keywords):
                if i < 3:  # Debug first 3 keywords
                    logger.info(f"DEBUG - Processing keyword {i}: {keyword.get('keyword', 'unknown')}")
                    logger.info(f"DEBUG - keyword_difficulty: {keyword.get('keyword_difficulty')} (type: {type(keyword.get('keyword_difficulty'))})")
                    logger.info(f"DEBUG - difficulty: {keyword.get('difficulty')} (type: {type(keyword.get('difficulty'))})")
                    logger.info(f"DEBUG - priority_score: {keyword.get('priority_score')} (type: {type(keyword.get('priority_score'))})")
                # Get competition value, keep as decimal (0.0-1.0 range) for competition field
                competition_val = keyword.get("competition")
                if competition_val is not None and isinstance(competition_val, (int, float)):
                    # Keep as decimal (0.0-1.0 range) for competition field
                    competition_val = min(float(competition_val), 1.0)
                else:
                    competition_val = 0.0  # Default to 0.0 if not provided
                
                # Handle competition_value - either provided directly or calculate from competition
                competition_value_provided = keyword.get("competition_value")
                if competition_value_provided is not None and isinstance(competition_value_provided, (int, float)):
                    # Use provided competition_value directly (0-100 range)
                    competition_value_int = int(competition_value_provided)
                else:
                    # Convert from competition field to integer (0-100 range) for competition_value field
                    competition_value_int = int(competition_val * 100) if competition_val is not None else 0
                
                # Get CPC value and ensure it fits in numeric(3,2) constraint (max 9.99)
                cpc_val = keyword.get("cpc", 0)
                if cpc_val is not None and isinstance(cpc_val, (int, float)):
                    # Cap at 9.99 to fit database constraint
                    cpc_val = min(float(cpc_val), 9.99)
                else:
                    cpc_val = 0
                
                # Get bid values as decimals (database expects DECIMAL(10,4))
                low_bid = keyword.get("low_top_of_page_bid", 0)
                if low_bid is not None and isinstance(low_bid, (int, float)):
                    low_bid = float(low_bid)  # Keep as decimal
                else:
                    low_bid = 0.0
                    
                high_bid = keyword.get("high_top_of_page_bid", 0)
                if high_bid is not None and isinstance(high_bid, (int, float)):
                    high_bid = float(high_bid)  # Keep as decimal
                else:
                    high_bid = 0.0
                
                # Get average values and cap them to fit database constraints
                avg_backlinks = keyword.get("avg_backlinks", 0)
                if avg_backlinks is not None and isinstance(avg_backlinks, (int, float)):
                    avg_backlinks = int(min(float(avg_backlinks), 999.99))  # Cap at 999.99 and convert to int
                else:
                    avg_backlinks = 0
                    
                avg_rank = keyword.get("avg_rank", 0)
                if avg_rank is not None and isinstance(avg_rank, (int, float)):
                    avg_rank = int(min(float(avg_rank), 999.99))  # Cap at 999.99 and convert to int
                else:
                    avg_rank = 0
                    
                avg_main_domain_rank = keyword.get("avg_main_domain_rank", 0)
                if avg_main_domain_rank is not None and isinstance(avg_main_domain_rank, (int, float)):
                    avg_main_domain_rank = int(min(float(avg_main_domain_rank), 999.99))  # Cap at 999.99 and convert to int
                else:
                    avg_main_domain_rank = 0
                
                # Debug logging for first keyword
                if len(data_list) == 0:
                    logger.info(f"DEBUG - Processing keyword: {keyword.get('keyword', '')}")
                    logger.info(f"DEBUG - topic_id: {keyword.get('topic_id')}")
                    logger.info(f"DEBUG - user_id: {keyword.get('user_id')}")
                    logger.info(f"DEBUG - source: {keyword.get('source')}")
                    logger.info(f"DEBUG - keyword_difficulty: {keyword.get('keyword_difficulty')}")
                    logger.info(f"DEBUG - difficulty: {keyword.get('difficulty')}")

                data = {
                    # Basic identification
                    "keyword": keyword.get("keyword", ""),
                    "seed_keyword": keyword.get("seed_keyword"),
                    "related_keyword": keyword.get("related_keyword"),
                    
                    # Core keyword_info fields
                    "search_volume": int(float(keyword.get("search_volume", 0))) if keyword.get("search_volume") is not None else 0,
                    "cpc": cpc_val,  # Use cleaned CPC value (capped at 9.99)
                    "competition": competition_val,  # Use decimal value (0.0-1.0) for competition field
                    "competition_value": competition_value_int,  # Use integer value (0-100) for competition_value field
                    "competition_level": keyword.get("competition_level"),
                    "low_top_of_page_bid": low_bid,  # Use decimal value (database expects DECIMAL(10,4))
                    "high_top_of_page_bid": high_bid,  # Use decimal value (database expects DECIMAL(10,4))
                    "categories": keyword.get("categories", []),
                    "monthly_searches": keyword.get("monthly_searches", []),
                    "last_updated_time": keyword.get("last_updated_time"),
                    
                    # keyword_properties fields
                    "core_keyword": keyword.get("core_keyword"),
                    "synonym_clustering_algorithm": keyword.get("synonym_clustering_algorithm"),
                    "difficulty": int(float(keyword.get("difficulty", 0))) if keyword.get("difficulty") is not None else (int(float(keyword.get("keyword_difficulty", 0))) if keyword.get("keyword_difficulty") is not None else 0),
                    "keyword_difficulty": int(float(keyword.get("keyword_difficulty", 0))) if keyword.get("keyword_difficulty") is not None else (int(float(keyword.get("difficulty", 0))) if keyword.get("difficulty") is not None else 0),
                    "detected_language": keyword.get("detected_language"),
                    "is_another_language": keyword.get("is_another_language"),
                    
                    # search_intent_info fields
                    "main_intent": keyword.get("main_intent") or "INFORMATIONAL",
                    "intent_type": self._map_intent_type(keyword.get("intent_type") or keyword.get("main_intent") or "INFORMATIONAL"),
                    "foreign_intent": keyword.get("foreign_intent", []),
                    "search_intent_last_updated_time": keyword.get("search_intent_last_updated_time"),
                    
                    # search_volume_trend
                    "monthly_trend": int(float(keyword.get("monthly_trend", 0))) if keyword.get("monthly_trend") is not None else 0,
                    "quarterly_trend": int(float(keyword.get("quarterly_trend", 0))) if keyword.get("quarterly_trend") is not None else 0,
                    "yearly_trend": int(float(keyword.get("yearly_trend", 0))) if keyword.get("yearly_trend") is not None else 0,
                    "search_volume_trend": [],  # Default empty array
                    
                    # clickstream_keyword_info
                    "clickstream_search_volume": int(float(keyword.get("clickstream_search_volume", 0))) if keyword.get("clickstream_search_volume") is not None else 0,
                    "clickstream_last_updated_time": keyword.get("clickstream_last_updated_time"),
                    "clickstream_gender_distribution": keyword.get("clickstream_gender_distribution", {}),
                    "clickstream_age_distribution": keyword.get("clickstream_age_distribution", {}),
                    "clickstream_monthly_searches": keyword.get("clickstream_monthly_searches", []),
                    
                    # serp_info
                    "serp_se_type": keyword.get("serp_se_type"),
                    "serp_check_url": keyword.get("serp_check_url") or keyword.get("check_url"),
                    "serp_item_types": keyword.get("serp_item_types", []),
                    "se_results_count": int(float(keyword.get("se_results_count", 0))) if keyword.get("se_results_count") is not None else 0,
                    "serp_last_updated_time": keyword.get("serp_last_updated_time"),
                    "serp_previous_updated_time": keyword.get("serp_previous_updated_time"),
                    
                    # avg_backlinks_info
                    "avg_backlinks": avg_backlinks,  # Use capped value
                    "avg_dofollow": int(float(keyword.get("avg_dofollow_links", 0))) if keyword.get("avg_dofollow_links") is not None else 0,
                    "avg_referring_pages": int(float(keyword.get("avg_referring_pages", 0))) if keyword.get("avg_referring_pages") is not None else 0,
                    "avg_referring_domains": int(float(keyword.get("avg_referring_domains", 0))) if keyword.get("avg_referring_domains") is not None else 0,
                    "avg_referring_main_domains": int(float(keyword.get("avg_referring_main_domains", 0))) if keyword.get("avg_referring_main_domains") is not None else 0,
                    "avg_rank": avg_rank,  # Use capped value
                    "avg_main_domain_rank": avg_main_domain_rank,  # Use capped value
                    "backlinks_last_updated_time": keyword.get("backlinks_last_updated_time"),
                    
                    # keyword_info_normalized_with_bing
                    "normalized_bing_search_volume": int(float(keyword.get("normalized_bing_search_volume", 0))) if keyword.get("normalized_bing_search_volume") is not None else 0,
                    "normalized_bing_is_normalized": keyword.get("normalized_bing_is_normalized"),
                    "normalized_bing_last_updated_time": keyword.get("normalized_bing_last_updated_time"),
                    "normalized_bing_monthly_searches": keyword.get("normalized_bing_monthly_searches", []),
                    
                    # keyword_info_normalized_with_clickstream
                    "normalized_clickstream_search_volume": int(float(keyword.get("normalized_clickstream_search_volume", 0))) if keyword.get("normalized_clickstream_search_volume") is not None else 0,
                    "normalized_clickstream_is_normalized": keyword.get("normalized_clickstream_is_normalized"),
                    "normalized_clickstream_last_updated_time": keyword.get("normalized_clickstream_last_updated_time"),
                    "normalized_clickstream_monthly_searches": keyword.get("normalized_clickstream_monthly_searches", []),
                    
                    # Additional fields
                    "depth": int(float(keyword.get("depth", 0))) if keyword.get("depth") is not None else 0,
                    "related_keywords": keyword.get("related_keywords", []),
                    "trend_percentage": 0,  # Default value
                    "priority_score": int(float(keyword.get("priority_score", 0))) if keyword.get("priority_score") is not None else 0,
                    "source": keyword.get("source") or "unknown",
                    "topic_id": keyword.get("topic_id"),
                    "user_id": keyword.get("user_id"),
                    "created_at": keyword.get("created_at", datetime.utcnow().isoformat()),
                    "updated_at": datetime.utcnow().isoformat()
                }
                
                if i < 3:  # Debug first 3 keywords
                    logger.info(f"DEBUG - Final data for keyword {i}:")
                    logger.info(f"DEBUG - keyword_difficulty: {data.get('keyword_difficulty')} (type: {type(data.get('keyword_difficulty'))})")
                    logger.info(f"DEBUG - difficulty: {data.get('difficulty')} (type: {type(data.get('difficulty'))})")
                    logger.info(f"DEBUG - priority_score: {data.get('priority_score')} (type: {type(data.get('priority_score'))})")
                
                data_list.append(data)
            
            # Use insert (let the database handle conflicts)
            logger.info(f"Attempting to insert {len(data_list)} keywords into keyword_research_data table")
            logger.info(f"Sample data structure: {data_list[0] if data_list else 'No data'}")
            
            # Debug: Check for any string values that should be integers
            if data_list:
                sample_data = data_list[0]
                logger.info(f"DEBUG - Checking for string values in sample data:")
                for key, value in sample_data.items():
                    if isinstance(value, str) and value == "0.0":
                        logger.warning(f"Found string '0.0' in field '{key}': {value} (type: {type(value)})")
                    elif isinstance(value, str) and value.replace('.', '').isdigit():
                        logger.warning(f"Found numeric string in field '{key}': {value} (type: {type(value)})")
                    elif isinstance(value, float) and value == 0.0:
                        logger.info(f"Found float 0.0 in field '{key}': {value} (type: {type(value)})")
                    elif isinstance(value, int) and value == 0:
                        logger.info(f"Found int 0 in field '{key}': {value} (type: {type(value)})")
            
            # Debug: Log the exact data being sent
            logger.info(f"DEBUG - About to insert data:")
            logger.info(f"DEBUG - First record keys: {list(data_list[0].keys()) if data_list else 'No data'}")
            logger.info(f"DEBUG - First record sample: {data_list[0] if data_list else 'No data'}")
            
            # Try insert first, if it fails due to unique constraint, use upsert
            try:
                result = client.table("keyword_research_data").insert(data_list).execute()
            except Exception as insert_error:
                if "duplicate key value violates unique constraint" in str(insert_error):
                    logger.warning(f"Duplicate key constraint detected, using upsert instead: {insert_error}")
                    # Use upsert to handle duplicates gracefully
                    result = client.table("keyword_research_data").upsert(data_list).execute()
                else:
                    raise insert_error
            
            logger.info(f"Insert result: {result}")
            logger.info(f"Insert successful: {len(result.data)} records inserted")
            return len(result.data) > 0
                
        except Exception as e:
            logger.error(f"Error saving keyword data batch: {e}")
            logger.error(f"Exception type: {type(e)}")
            logger.error(f"Exception details: {str(e)}")
            try:
                logger.error(f"Data being saved: {data_list}")
                logger.error(f"First keyword data: {data_list[0] if data_list else 'No data'}")
            except NameError:
                logger.error("Data being saved: data_list not yet initialized")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False
    
    async def get_keyword_data(self, keywords: List[str]) -> List[KeywordData]:
        """Get cached keyword data from database"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # Calculate minimum updated time for cache (6h)
            min_updated_at = (datetime.utcnow() - timedelta(hours=6)).isoformat()
            
            result = client.table("keyword_research_data").select("*").in_("keyword", keywords).gte("updated_at", min_updated_at).order("updated_at", desc=True).execute()
            
            keyword_data_list = []
            for row in result.data:
                keyword_data = KeywordData(
                    keyword=row["keyword"],
                    search_volume=row["search_volume"],
                    keyword_difficulty=row["keyword_difficulty"],
                    cpc=row["cpc"],
                    competition_value=row["competition_value"],
                    trend_percentage=row["trend_percentage"],
                    intent_type=row["intent_type"],
                    priority_score=row["priority_score"],
                    related_keywords=row["related_keywords"] or [],
                    search_volume_trend=row["search_volume_trend"] or []
                )
                keyword_data_list.append(keyword_data)
            
            return keyword_data_list
                
        except Exception as e:
            logger.error(f"Error fetching keyword data: {e}")
            return []
    
    async def save_subtopic_suggestions(self, suggestions: List[SubtopicData]) -> bool:
        """Save subtopic suggestions to database"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # Prepare data for Supabase
            data_list = []
            for suggestion in suggestions:
                data = {
                    "topic": suggestion.topic,
                    "trending_status": suggestion.trending_status,
                    "growth_potential": suggestion.growth_potential,
                    "search_volume": suggestion.search_volume,
                    "related_queries": suggestion.related_queries,
                    "competition_level": suggestion.competition_level,
                    "commercial_intent": suggestion.commercial_intent,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
                data_list.append(data)
            
            # Use upsert (insert with conflict resolution)
            result = client.table("subtopic_suggestions").upsert(data_list, on_conflict="topic").execute()
            
            return len(result.data) > 0
                
        except Exception as e:
            logger.error(f"Error saving subtopic suggestions: {e}")
            return False

    async def get_keywords_by_topic_and_user(self, topic_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all keywords for a specific topic and user"""
        try:
            # Ensure database is initialized
            if not self.db_manager.client:
                await self.db_manager.initialize()
            
            client = self.db_manager.get_client()
            
            # First, check if the columns exist by trying to query them
            try:
                # Query keywords by topic_id and user_id
                result = client.table("keyword_research_data")\
                    .select("*")\
                    .eq("topic_id", topic_id)\
                    .eq("user_id", user_id)\
                    .order("created_at", desc=True)\
                    .execute()
                
                logger.info(f"Retrieved {len(result.data)} keywords for topic {topic_id} and user {user_id}")
                return result.data
                
            except Exception as column_error:
                logger.warning(f"Columns user_id/topic_id may not exist yet: {column_error}")
                # Fallback: query all keywords for this user (if user_id column exists)
                try:
                    result = client.table("keyword_research_data")\
                        .select("*")\
                        .eq("user_id", user_id)\
                        .order("created_at", desc=True)\
                        .execute()
                    
                    logger.info(f"Retrieved {len(result.data)} keywords for user {user_id} (no topic filtering)")
                    return result.data
                    
                except Exception as user_error:
                    logger.warning(f"user_id column may not exist: {user_error}")
                    # Final fallback: query all keywords (no filtering)
                    result = client.table("keyword_research_data")\
                        .select("*")\
                        .order("created_at", desc=True)\
                        .execute()
                    
                    logger.info(f"Retrieved {len(result.data)} keywords (no user/topic filtering)")
                    return result.data
            
        except Exception as e:
            logger.error(f"Error getting keywords by topic and user: {e}")
            return []

# Global instances
db_manager = DatabaseManager()
dataforseo_repository = DataForSEORepository(db_manager)
