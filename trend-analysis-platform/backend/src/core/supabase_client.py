"""
Supabase Client Initialization and Management

This module provides centralized Supabase client initialization and configuration
for the trend analysis platform backend, replacing direct PostgreSQL connections
with managed Supabase database operations.
"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class SupabaseClientManager:
    """
    Manages Supabase client instances with connection pooling and error handling.
    """
    
    def __init__(self):
        self._client: Optional[Client] = None
        self._connection_status = "disconnected"
        self._error_count = 0
        self._retry_count = 0
        self._last_used: Optional[datetime] = None
        self._max_retries = 5
        self._max_errors = 10
        
    def get_client(self) -> Client:
        """
        Get or create Supabase client instance.
        
        Returns:
            Client: Configured Supabase client
            
        Raises:
            ValueError: If environment variables are missing
            ConnectionError: If client initialization fails
        """
        if self._client is None:
            self._initialize_client()
        
        if self._connection_status == "error" and self._error_count >= self._max_errors:
            raise ConnectionError("Max error count exceeded. Client disabled.")
            
        return self._client
    
    def _initialize_client(self) -> None:
        """
        Initialize Supabase client with environment configuration.
        """
        try:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not url or not key:
                raise ValueError(
                    "Missing Supabase environment variables. "
                    "Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
                )
            
            # Validate URL format
            if not url.startswith("https://"):
                raise ValueError("SUPABASE_URL must be a valid HTTPS URL")
            
            # Create client
            self._client = create_client(url, key)
            self._connection_status = "connected"
            self._error_count = 0
            self._retry_count = 0
            self._last_used = datetime.utcnow()
            
            logger.info("Supabase client initialized successfully", 
                       url=url, 
                       key_prefix=key[:10] + "...")
            
        except Exception as e:
            self._connection_status = "error"
            self._error_count += 1
            logger.error("Failed to initialize Supabase client", 
                       error=str(e), 
                       error_count=self._error_count)
            raise ConnectionError(f"Supabase client initialization failed: {e}")
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check Supabase connection health.
        
        Returns:
            Dict containing health status and metrics
        """
        try:
            if self._client is None:
                return {
                    "status": "unhealthy",
                    "message": "Client not initialized",
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Test connection with simple query
            start_time = datetime.utcnow()
            result = self._client.table("users").select("id").limit(1).execute()
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            self._connection_status = "connected"
            self._last_used = datetime.utcnow()
            
            return {
                "status": "healthy",
                "database": "supabase",
                "timestamp": datetime.utcnow().isoformat(),
                "execution_time_ms": round(execution_time, 2),
                "connection_status": self._connection_status,
                "error_count": self._error_count,
                "retry_count": self._retry_count
            }
            
        except Exception as e:
            self._connection_status = "error"
            self._error_count += 1
            logger.error("Health check failed", error=str(e))
            
            return {
                "status": "unhealthy",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "connection_status": self._connection_status,
                "error_count": self._error_count
            }
    
    def reset_connection(self) -> None:
        """
        Reset connection state and attempt reconnection.
        """
        self._client = None
        self._connection_status = "disconnected"
        self._error_count = 0
        self._retry_count = 0
        logger.info("Connection reset requested")
    
    @property
    def connection_status(self) -> str:
        """Get current connection status."""
        return self._connection_status
    
    @property
    def error_count(self) -> int:
        """Get current error count."""
        return self._error_count
    
    @property
    def last_used(self) -> Optional[datetime]:
        """Get last successful operation timestamp."""
        return self._last_used

# Global client manager instance
_client_manager = SupabaseClientManager()

def get_supabase_client() -> Client:
    """
    Get configured Supabase client instance.
    
    This is the main entry point for database operations.
    
    Returns:
        Client: Configured Supabase client
        
    Raises:
        ConnectionError: If client is unavailable
    """
    return _client_manager.get_client()

def get_health_status() -> Dict[str, Any]:
    """
    Get Supabase connection health status.
    
    Returns:
        Dict containing health metrics and status
    """
    return _client_manager.health_check()

def reset_supabase_connection() -> None:
    """
    Reset Supabase connection and attempt reconnection.
    """
    _client_manager.reset_connection()

# Convenience function for backward compatibility
def create_supabase_client() -> Client:
    """
    Create new Supabase client instance.
    
    Note: This creates a new client each time. Use get_supabase_client() 
    for connection pooling.
    
    Returns:
        Client: New Supabase client instance
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise ValueError("Missing Supabase environment variables")
    
    return create_client(url, key)