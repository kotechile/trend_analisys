"""
Supabase service for dataflow persistence
This service handles all database operations using the Supabase Client/SDK
"""

import os
import logging
from typing import Optional, Dict, Any, List, Union
from uuid import UUID
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service for interacting with Supabase database"""
    
    def __init__(self):
        """Initialize Supabase client"""
        self.client: Optional[Client] = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client with configuration"""
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            # Try service role key first, then fall back to anon key
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables are required")
            
            # Configure client options
            options = ClientOptions(
                auto_refresh_token=True,
                persist_session=True
            )
            
            self.client = create_client(supabase_url, supabase_key, options)
            logger.info("Supabase client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    def get_client(self) -> Client:
        """Get the Supabase client instance"""
        if not self.client:
            self._initialize_client()
        return self.client
    
    async def execute_query(self, table: str, operation: str, **kwargs) -> Dict[str, Any]:
        """Execute a database query with error handling"""
        try:
            client = self.get_client()
            table_ref = client.table(table)
            
            # Execute the operation based on type
            if operation == "select":
                query = table_ref.select(kwargs.get("select", "*"))
                
                # Add filters
                for filter_key, filter_value in kwargs.get("filters", {}).items():
                    if filter_value is not None:
                        query = query.eq(filter_key, filter_value)
                
                # Add ordering
                if "order_by" in kwargs:
                    order_config = kwargs["order_by"]
                    if isinstance(order_config, dict):
                        for field, direction in order_config.items():
                            query = query.order(field, desc=(direction == "desc"))
                    else:
                        query = query.order(order_config)
                
                # Add pagination
                if "limit" in kwargs:
                    query = query.limit(kwargs["limit"])
                if "offset" in kwargs:
                    query = query.range(kwargs["offset"], kwargs["offset"] + kwargs.get("limit", 10) - 1)
                
                result = query.execute()
                
            elif operation == "insert":
                data = kwargs.get("data")
                if isinstance(data, list):
                    result = table_ref.insert(data).execute()
                else:
                    result = table_ref.insert(data).execute()
                    
            elif operation == "update":
                data = kwargs.get("data")
                filters = kwargs.get("filters", {})
                
                query = table_ref.update(data)
                for filter_key, filter_value in filters.items():
                    query = query.eq(filter_key, filter_value)
                
                result = query.execute()
                
            elif operation == "delete":
                filters = kwargs.get("filters", {})
                
                query = table_ref.delete()
                for filter_key, filter_value in filters.items():
                    query = query.eq(filter_key, filter_value)
                
                result = query.execute()
                
            else:
                raise ValueError(f"Unsupported operation: {operation}")
            
            return {
                "data": result.data,
                "error": result.error,
                "count": getattr(result, 'count', None)
            }
            
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            return {
                "data": None,
                "error": {"message": str(e), "code": "QUERY_ERROR"},
                "count": None
            }
    
    async def get_by_id(self, table: str, id: UUID, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Get a single record by ID with user validation"""
        result = await self.execute_query(
            table=table,
            operation="select",
            filters={"id": str(id), "user_id": str(user_id)},
            limit=1
        )
        
        if result["error"]:
            logger.error(f"Error getting {table} by ID: {result['error']}")
            return None
        
        return result["data"][0] if result["data"] else None
    
    async def get_by_filters(self, table: str, filters: Dict[str, Any], user_id: UUID, 
                           order_by: Optional[Dict[str, str]] = None, 
                           limit: Optional[int] = None, 
                           offset: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get records by filters with user validation"""
        # Always include user_id filter for security
        filters["user_id"] = str(user_id)
        
        result = await self.execute_query(
            table=table,
            operation="select",
            filters=filters,
            order_by=order_by,
            limit=limit,
            offset=offset
        )
        
        if result["error"]:
            logger.error(f"Error getting {table} by filters: {result['error']}")
            return []
        
        return result["data"] or []
    
    async def create(self, table: str, data: Dict[str, Any], user_id: UUID) -> Optional[Dict[str, Any]]:
        """Create a new record with user validation"""
        # Always include user_id for security
        data["user_id"] = str(user_id)
        
        result = await self.execute_query(
            table=table,
            operation="insert",
            data=data
        )
        
        if result["error"]:
            logger.error(f"Error creating {table}: {result['error']}")
            return None
        
        return result["data"][0] if result["data"] else None
    
    async def update(self, table: str, id: UUID, data: Dict[str, Any], user_id: UUID) -> Optional[Dict[str, Any]]:
        """Update a record by ID with user validation"""
        result = await self.execute_query(
            table=table,
            operation="update",
            data=data,
            filters={"id": str(id), "user_id": str(user_id)}
        )
        
        if result["error"]:
            logger.error(f"Error updating {table}: {result['error']}")
            return None
        
        return result["data"][0] if result["data"] else None
    
    async def delete(self, table: str, id: UUID, user_id: UUID) -> bool:
        """Delete a record by ID with user validation"""
        result = await self.execute_query(
            table=table,
            operation="delete",
            filters={"id": str(id), "user_id": str(user_id)}
        )
        
        if result["error"]:
            logger.error(f"Error deleting {table}: {result['error']}")
            return False
        
        return True
    
    async def count(self, table: str, filters: Dict[str, Any], user_id: UUID) -> int:
        """Count records by filters with user validation"""
        filters["user_id"] = str(user_id)
        
        result = await self.execute_query(
            table=table,
            operation="select",
            filters=filters,
            select="id"  # Only select ID for counting
        )
        
        if result["error"]:
            logger.error(f"Error counting {table}: {result['error']}")
            return 0
        
        return len(result["data"]) if result["data"] else 0
    
    async def exists(self, table: str, filters: Dict[str, Any], user_id: UUID) -> bool:
        """Check if a record exists with user validation"""
        filters["user_id"] = str(user_id)
        
        result = await self.execute_query(
            table=table,
            operation="select",
            filters=filters,
            limit=1
        )
        
        if result["error"]:
            logger.error(f"Error checking existence in {table}: {result['error']}")
            return False
        
        return len(result["data"]) > 0 if result["data"] else False
    
    async def bulk_create(self, table: str, data_list: List[Dict[str, Any]], user_id: UUID) -> List[Dict[str, Any]]:
        """Create multiple records with user validation"""
        # Add user_id to all records
        for data in data_list:
            data["user_id"] = str(user_id)
        
        result = await self.execute_query(
            table=table,
            operation="insert",
            data=data_list
        )
        
        if result["error"]:
            logger.error(f"Error bulk creating {table}: {result['error']}")
            return []
        
        return result["data"] or []
    
    async def bulk_update(self, table: str, updates: List[Dict[str, Any]], user_id: UUID) -> List[Dict[str, Any]]:
        """Update multiple records with user validation"""
        updated_records = []
        
        for update_data in updates:
            record_id = update_data.get("id")
            if not record_id:
                continue
            
            # Remove id from update data
            update_data_copy = {k: v for k, v in update_data.items() if k != "id"}
            
            result = await self.update(table, UUID(record_id), update_data_copy, user_id)
            if result:
                updated_records.append(result)
        
        return updated_records
    
    async def get_related_records(self, table: str, foreign_key: str, foreign_id: UUID, 
                                user_id: UUID, order_by: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Get records related by foreign key with user validation"""
        return await self.get_by_filters(
            table=table,
            filters={foreign_key: str(foreign_id)},
            user_id=user_id,
            order_by=order_by
        )
    
    async def search(self, table: str, search_term: str, search_fields: List[str], 
                    user_id: UUID, filters: Optional[Dict[str, Any]] = None,
                    order_by: Optional[Dict[str, str]] = None,
                    limit: Optional[int] = None,
                    offset: Optional[int] = None) -> List[Dict[str, Any]]:
        """Search records with text search across multiple fields"""
        # This is a simplified search implementation
        # In a real implementation, you might want to use PostgreSQL's full-text search
        all_records = await self.get_by_filters(
            table=table,
            filters=filters or {},
            user_id=user_id,
            order_by=order_by,
            limit=limit,
            offset=offset
        )
        
        # Filter records that match the search term
        matching_records = []
        search_term_lower = search_term.lower()
        
        for record in all_records:
            for field in search_fields:
                if field in record and record[field]:
                    field_value = str(record[field]).lower()
                    if search_term_lower in field_value:
                        matching_records.append(record)
                        break
        
        return matching_records

# Global instance
supabase_service = SupabaseService()

def get_supabase_client() -> Client:
    """Get the global Supabase client instance"""
    return supabase_service.get_client()

def get_supabase_service() -> SupabaseService:
    """Get the global Supabase service instance"""
    return supabase_service