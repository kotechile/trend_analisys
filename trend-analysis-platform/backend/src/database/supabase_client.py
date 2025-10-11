"""
Supabase client configuration for TrendTap
Enhanced with connection management and error handling
"""
import os
from typing import Optional, Dict, Any
from supabase import create_client, Client
from supabase.exceptions import APIError, AuthError
from dotenv import load_dotenv
import structlog
from datetime import datetime
from enum import Enum

logger = structlog.get_logger()

# Load environment variables
load_dotenv()

class ConnectionStatus(Enum):
    """Supabase connection status"""
    INITIALIZED = "initialized"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    RECONNECTING = "reconnecting"

class SupabaseClient:
    """Enhanced Supabase client with connection management"""
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.anon_key = os.getenv("SUPABASE_ANON_KEY")
        self.connection_status = ConnectionStatus.INITIALIZED
        self.last_activity = None
        self.client: Optional[Client] = None
        
        if not self.url or not self.service_role_key:
            raise ValueError("Supabase URL and service role key are required")
        
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the Supabase client"""
        try:
            self.connection_status = ConnectionStatus.CONNECTING
            self.client = create_client(self.url, self.service_role_key)
            self.connection_status = ConnectionStatus.CONNECTED
            logger.info("Supabase client initialized", url=self.url)
        except Exception as e:
            self.connection_status = ConnectionStatus.ERROR
            logger.error("Failed to initialize Supabase client", error=str(e))
            raise
    
    def get_client(self) -> Client:
        """Get the Supabase client instance"""
        if self.client is None:
            self._initialize_client()
        return self.client
    
    def get_anon_client(self) -> Client:
        """Get Supabase client with anon key for frontend operations"""
        if not self.anon_key:
            raise ValueError("SUPABASE_ANON_KEY is required for anon client")
        return create_client(self.url, self.anon_key)
    
    def test_connection(self) -> Dict[str, Any]:
        """Test the Supabase connection"""
        try:
            start_time = datetime.utcnow()
            # Simple query to test connection
            response = self.get_client().table("users").select("count").execute()
            end_time = datetime.utcnow()
            
            response_time = (end_time - start_time).total_seconds() * 1000  # Convert to ms
            
            self.last_activity = end_time
            self.connection_status = ConnectionStatus.CONNECTED
            
            return {
                "status": "healthy",
                "supabase_status": "connected",
                "response_time_ms": response_time,
                "last_check": end_time.isoformat(),
                "details": {
                    "connection_pool_size": 1,  # Supabase manages this
                    "active_connections": 1,
                    "error_count": 0
                }
            }
        except APIError as e:
            self.connection_status = ConnectionStatus.ERROR
            logger.error("Supabase API error", error=str(e))
            return {
                "status": "unhealthy",
                "supabase_status": "error",
                "error": str(e),
                "last_check": datetime.utcnow().isoformat()
            }
        except AuthError as e:
            self.connection_status = ConnectionStatus.ERROR
            logger.error("Supabase auth error", error=str(e))
            return {
                "status": "unhealthy",
                "supabase_status": "error",
                "error": f"Authentication error: {str(e)}",
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.connection_status = ConnectionStatus.ERROR
            logger.error("Supabase connection error", error=str(e))
            return {
                "status": "unhealthy",
                "supabase_status": "error",
                "error": str(e),
                "last_check": datetime.utcnow().isoformat()
            }
    
    def safe_operation(self, operation_func, *args, **kwargs):
        """Execute a Supabase operation with error handling"""
        try:
            result = operation_func(*args, **kwargs)
            self.last_activity = datetime.utcnow()
            return result
        except APIError as e:
            logger.error("Supabase API error", error=str(e), operation=operation_func.__name__)
            raise
        except AuthError as e:
            logger.error("Supabase auth error", error=str(e), operation=operation_func.__name__)
            raise
        except Exception as e:
            logger.error("Supabase operation error", error=str(e), operation=operation_func.__name__)
            raise

# Global instance
supabase_client = SupabaseClient()

def get_supabase_client() -> Client:
    """Get the Supabase client instance"""
    return supabase_client.get_client()

def get_supabase_anon_client() -> Client:
    """Get Supabase client with anon key for frontend operations"""
    return supabase_client.get_anon_client()

def test_supabase_connection() -> Dict[str, Any]:
    """Test the Supabase connection"""
    return supabase_client.test_connection()

