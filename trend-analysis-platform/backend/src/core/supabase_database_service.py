"""
Supabase Database Service
Uses Supabase SDK for all database operations
Replaces SQLAlchemy-based database operations
"""

import os
from typing import Dict, List, Any, Optional, Union
from supabase import create_client, Client
from dotenv import load_dotenv
import structlog
import json
from datetime import datetime
import uuid

logger = structlog.get_logger()

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing required Supabase environment variables")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class SupabaseDatabaseService:
    """Database service using Supabase SDK"""
    
    def __init__(self):
        self.client = supabase
        logger.info("Supabase database service initialized")
    
    def health_check(self) -> Dict[str, Any]:
        """Check database connection health"""
        try:
            # Simple query to test connection
            result = self.client.table("users").select("id").limit(1).execute()
            return {
                "status": "healthy",
                "database": "supabase",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error("Database health check failed", error=str(e))
            return {
                "status": "unhealthy",
                "database": "supabase",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    # User operations
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error getting user by ID", user_id=user_id, error=str(e))
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            result = self.client.table("users").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error getting user by email", email=email, error=str(e))
            return None
    
    def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            result = self.client.table("users").insert(user_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error creating user", error=str(e))
            return None
    
    def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user"""
        try:
            result = self.client.table("users").update(user_data).eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error updating user", user_id=user_id, error=str(e))
            return None
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            result = self.client.table("users").delete().eq("id", user_id).execute()
            return True
        except Exception as e:
            logger.error("Error deleting user", user_id=user_id, error=str(e))
            return False
    
    # Affiliate research operations
    def create_affiliate_research(self, research_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create affiliate research record"""
        try:
            result = self.client.table("affiliate_research").insert(research_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error creating affiliate research", error=str(e))
            return None
    
    def get_affiliate_research(self, research_id: str) -> Optional[Dict[str, Any]]:
        """Get affiliate research by ID"""
        try:
            result = self.client.table("affiliate_research").select("*").eq("id", research_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error getting affiliate research", research_id=research_id, error=str(e))
            return None
    
    def get_affiliate_research_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all affiliate research for a user"""
        try:
            result = self.client.table("affiliate_research").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error("Error getting affiliate research by user", user_id=user_id, error=str(e))
            return []
    
    def create_affiliate_offer(self, offer_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create affiliate offer record"""
        try:
            result = self.client.table("affiliate_offers").insert(offer_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error creating affiliate offer", error=str(e))
            return None
    
    # Trend analysis operations
    def create_trend_analysis(self, analysis_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create trend analysis record"""
        try:
            result = self.client.table("trend_analysis").insert(analysis_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error creating trend analysis", error=str(e))
            return None
    
    def get_trend_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get trend analysis by ID"""
        try:
            result = self.client.table("trend_analysis").select("*").eq("id", analysis_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error getting trend analysis", analysis_id=analysis_id, error=str(e))
            return None
    
    def get_trend_analysis_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all trend analysis for a user"""
        try:
            result = self.client.table("trend_analysis").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error("Error getting trend analysis by user", user_id=user_id, error=str(e))
            return []
    
    # Content operations
    def create_content_idea(self, content_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create content idea record"""
        try:
            result = self.client.table("content_ideas").insert(content_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error creating content idea", error=str(e))
            return None
    
    def get_content_ideas_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all content ideas for a user"""
        try:
            result = self.client.table("content_ideas").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error("Error getting content ideas by user", user_id=user_id, error=str(e))
            return []
    
    # Generic CRUD operations
    def create_record(self, table_name: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a record in any table"""
        try:
            result = self.client.table(table_name).insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error creating record", table=table_name, error=str(e))
            return None
    
    def get_record(self, table_name: str, record_id: str) -> Optional[Dict[str, Any]]:
        """Get a record by ID from any table"""
        try:
            result = self.client.table(table_name).select("*").eq("id", record_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error getting record", table=table_name, record_id=record_id, error=str(e))
            return None
    
    def update_record(self, table_name: str, record_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a record in any table"""
        try:
            result = self.client.table(table_name).update(data).eq("id", record_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Error updating record", table=table_name, record_id=record_id, error=str(e))
            return None
    
    def delete_record(self, table_name: str, record_id: str) -> bool:
        """Delete a record from any table"""
        try:
            result = self.client.table(table_name).delete().eq("id", record_id).execute()
            return True
        except Exception as e:
            logger.error("Error deleting record", table=table_name, record_id=record_id, error=str(e))
            return False
    
    def get_records_by_user(self, table_name: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all records for a user from any table"""
        try:
            result = self.client.table(table_name).select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error("Error getting records by user", table=table_name, user_id=user_id, error=str(e))
            return []

# Create global instance
supabase_db = SupabaseDatabaseService()

# Dependency function for FastAPI
def get_supabase_db() -> SupabaseDatabaseService:
    """Get Supabase database service dependency"""
    return supabase_db
