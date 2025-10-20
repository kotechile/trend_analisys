"""
Configuration management for Idea Burst
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional, List
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "Idea Burst API"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")
    
    # Database (Supabase cloud - no local database)
    # Note: All database operations go through Supabase SDK
    sql_echo: bool = Field(default=False, env="SQL_ECHO")
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    redis_password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    redis_db: int = Field(default=0, env="REDIS_DB")
    
    # Add REDIS_URL alias for compatibility
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    
    # Security
    secret_key: str = Field(
        default="your-secret-key-change-in-production",
        env="SECRET_KEY"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "https://idea-burst.com"],
        env="ALLOWED_ORIGINS"
    )
    
    # Rate limiting
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    
    # External APIs - All API keys are now stored in Supabase api_keys table
    # Only keeping non-API-key configuration here
    
    # Amazon Associates (tag, not API key)
    amazon_associates_tag: Optional[str] = Field(default=None, env="AMAZON_ASSOCIATES_TAG")
    
    # WordPress (URL, not API key)
    wordpress_api_url: Optional[str] = Field(default=None, env="WORDPRESS_API_URL")
    
    # File uploads
    max_file_size: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    allowed_file_types: List[str] = Field(
        default=["text/csv", "application/csv"],
        env="ALLOWED_FILE_TYPES"
    )
    
    # Performance
    max_concurrent_requests: int = Field(default=100, env="MAX_CONCURRENT_REQUESTS")
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    # Supabase (only Supabase credentials remain in environment variables)
    supabase_url: Optional[str] = Field(default=None, env="SUPABASE_URL")
    supabase_service_role_key: Optional[str] = Field(default=None, env="SUPABASE_SERVICE_ROLE_KEY")
    
    # TheWriter Database
    thewriter_db_connection2: Optional[str] = Field(default=None, env="THEWRITER_DB_CONNECTION2")
    thewriter_supabase_url: Optional[str] = Field(default=None, env="THEWRITER_SUPABASE_URL")
    thewriter_supabase_key: Optional[str] = Field(default=None, env="THEWRITER_SUPABASE_KEY")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Allow extra fields but ignore them

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings"""
    return settings

def validate_required_settings() -> List[str]:
    """Validate that all required settings are present"""
    missing_settings = []
    
    # Check required settings based on environment
    if settings.environment == "production":
        required_settings = [
            "secret_key",
            "database_url",
            "redis_url"
        ]
        
        for setting in required_settings:
            if not getattr(settings, setting) or getattr(settings, setting) == "your-secret-key-change-in-production":
                missing_settings.append(setting)
    
    return missing_settings

def get_database_url() -> str:
    """Get database URL with proper formatting"""
    return settings.database_url

def get_redis_url() -> str:
    """Get Redis URL with proper formatting"""
    return settings.redis_url

def is_development() -> bool:
    """Check if running in development mode"""
    return settings.environment == "development" or settings.debug

def is_production() -> bool:
    """Check if running in production mode"""
    return settings.environment == "production" and not settings.debug