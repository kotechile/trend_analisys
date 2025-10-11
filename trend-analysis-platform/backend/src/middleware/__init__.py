"""
Middleware package for FastAPI application.
"""

from .auth import (
    AuthenticationMiddleware,
    TokenRefreshMiddleware,
    AuthenticationMetricsMiddleware,
    get_current_user,
    get_current_user_optional,
    require_admin,
    require_user_role,
    get_token_from_request,
    verify_token_dependency,
    auth_metrics
)

from .authorization import (
    AuthorizationMiddleware,
    AuthorizationMetricsMiddleware,
    Permission,
    ResourceType,
    require_permission,
    require_permissions,
    require_admin_permission,
    require_resource_ownership,
    authz_metrics
)

from .rate_limiting import (
    EnhancedRateLimitMiddleware,
    RateLimitMetricsMiddleware,
    RateLimitAlgorithm,
    RateLimitScope,
    RateLimitRule,
    rate_limit_metrics
)

from .cors_security import (
    EnhancedCORSMiddleware,
    EnhancedSecurityHeadersMiddleware,
    SecurityMetricsMiddleware,
    security_metrics
)

from .logging import (
    RequestResponseLoggingMiddleware,
    LoggingMetricsMiddleware,
    logging_metrics
)

from .error_handling import (
    ErrorHandlingMiddleware,
    ErrorRecoveryMiddleware,
    error_metrics
)

from .security import (
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    RequestLoggingMiddleware,
    ErrorHandlingMiddleware,
    CORSMiddleware,
    MaintenanceModeMiddleware,
    SecurityMetricsMiddleware,
    security_metrics
)

__all__ = [
    # Authentication middleware
    "AuthenticationMiddleware",
    "TokenRefreshMiddleware", 
    "AuthenticationMetricsMiddleware",
    "get_current_user",
    "get_current_user_optional",
    "require_admin",
    "require_user_role",
    "get_token_from_request",
    "verify_token_dependency",
    "auth_metrics",
    
    # Authorization middleware
    "AuthorizationMiddleware",
    "AuthorizationMetricsMiddleware",
    "Permission",
    "ResourceType",
    "require_permission",
    "require_permissions",
    "require_admin_permission",
    "require_resource_ownership",
    "authz_metrics",
    
    # Rate limiting middleware
    "EnhancedRateLimitMiddleware",
    "RateLimitMetricsMiddleware",
    "RateLimitAlgorithm",
    "RateLimitScope",
    "RateLimitRule",
    "rate_limit_metrics",
    
    # CORS and security middleware
    "EnhancedCORSMiddleware",
    "EnhancedSecurityHeadersMiddleware",
    "SecurityMetricsMiddleware",
    "security_metrics",
    
    # Logging middleware
    "RequestResponseLoggingMiddleware",
    "LoggingMetricsMiddleware",
    "logging_metrics",
    
    # Error handling middleware
    "ErrorHandlingMiddleware",
    "ErrorRecoveryMiddleware",
    "error_metrics",
    
    # Security middleware
    "SecurityHeadersMiddleware",
    "RateLimitMiddleware",
    "RequestLoggingMiddleware",
    "ErrorHandlingMiddleware",
    "CORSMiddleware",
    "MaintenanceModeMiddleware",
    "SecurityMetricsMiddleware",
    "security_metrics",
]
