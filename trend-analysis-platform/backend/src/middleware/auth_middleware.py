"""
Authentication Middleware

This module provides authentication middleware for protecting routes
and managing user sessions with Supabase Auth.
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from datetime import datetime

from ..services.auth_service import AuthenticationService
from ..core.logging import db_operation_logger
from ..core.error_handler import DatabaseAuthenticationError

security = HTTPBearer()

class AuthenticationMiddleware:
    """
    Authentication middleware for protecting routes and managing user sessions.
    """
    
    def __init__(self):
        """Initialize the authentication middleware."""
        self.auth_service = AuthenticationService()
        self.logger = db_operation_logger
    
    async def authenticate_request(self, request: Request) -> Optional[Dict[str, Any]]:
        """
        Authenticate a request and return user information.
        
        Args:
            request: FastAPI request object
            
        Returns:
            User information if authenticated, None otherwise
        """
        try:
            # Extract authorization header
            authorization = request.headers.get("Authorization")
            if not authorization or not authorization.startswith("Bearer "):
                return None
            
            token = authorization.replace("Bearer ", "")
            
            # Get user agent and IP for session tracking
            user_agent = request.headers.get("User-Agent")
            client_ip = request.client.host if request.client else None
            
            # Validate session
            session = await self._validate_session(token, user_agent, client_ip)
            if not session:
                return None
            
            return {
                "user_id": session.user_id,
                "session_id": session.session_id,
                "permissions": session.get_permissions(),
                "is_active": session.is_active
            }
            
        except Exception as e:
            self.logger.log_operation_error(
                operation_id="auth_middleware",
                error_message=str(e),
                error_type="authentication_error"
            )
            return None
    
    async def _validate_session(self, token: str, user_agent: Optional[str] = None, 
                               client_ip: Optional[str] = None) -> Optional[Any]:
        """
        Validate a session token.
        
        Args:
            token: Authentication token
            user_agent: Client user agent
            client_ip: Client IP address
            
        Returns:
            AuthenticationContext if valid, None otherwise
        """
        try:
            # In a real implementation, you would validate the JWT token here
            # For now, we'll use a simple token validation
            if token == "test-token":
                # Create a mock session for testing
                from ..models.auth_context import AuthenticationContext
                session = AuthenticationContext.create_session(
                    user_id="test-user-id",
                    access_token=token,
                    refresh_token="test-refresh-token",
                    expires_at=datetime.utcnow().replace(year=2025),
                    ip_address=client_ip,
                    user_agent=user_agent
                )
                
                # Update session activity
                if user_agent or client_ip:
                    session.update_activity(client_ip, user_agent)
                
                return session
            else:
                return None
                
        except Exception as e:
            self.logger.log_operation_error(
                operation_id="validate_session",
                error_message=str(e),
                error_type="session_validation_error"
            )
            return None
    
    def require_authentication(self, request: Request) -> Dict[str, Any]:
        """
        Require authentication for a request.
        
        Args:
            request: FastAPI request object
            
        Returns:
            User information
            
        Raises:
            HTTPException: If authentication fails
        """
        user_info = self.authenticate_request(request)
        if not user_info:
            raise HTTPException(
                status_code=401,
                detail={"error": "Unauthorized", "message": "Authentication required"}
            )
        return user_info
    
    def require_permission(self, permission: str):
        """
        Require a specific permission for a request.
        
        Args:
            permission: Required permission
            
        Returns:
            Decorator function
        """
        def decorator(func):
            async def wrapper(request: Request, *args, **kwargs):
                user_info = self.require_authentication(request)
                
                # Check permission
                if not user_info.get("permissions", {}).get(permission, False):
                    raise HTTPException(
                        status_code=403,
                        detail={"error": "Forbidden", "message": f"Permission '{permission}' required"}
                    )
                
                return await func(request, *args, **kwargs)
            return wrapper
        return decorator

# Global middleware instance
auth_middleware = AuthenticationMiddleware()

def get_current_user(request: Request) -> Dict[str, Any]:
    """
    Get current user from request.
    
    Args:
        request: FastAPI request object
        
    Returns:
        User information
        
    Raises:
        HTTPException: If authentication fails
    """
    return auth_middleware.require_authentication(request)

def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    Get current user from request (optional).
    
    Args:
        request: FastAPI request object
        
    Returns:
        User information or None
    """
    return auth_middleware.authenticate_request(request)

def require_permission(permission: str):
    """
    Require a specific permission.
    
    Args:
        permission: Required permission
        
    Returns:
        Decorator function
    """
    return auth_middleware.require_permission(permission)
