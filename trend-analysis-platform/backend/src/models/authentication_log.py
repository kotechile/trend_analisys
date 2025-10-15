"""
AuthenticationLog model for audit logging and security monitoring.
"""
import uuid
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    Enum as SqlEnum,
    func,
)
from src.core.database import Base
import enum

class AuthenticationEventType(str, enum.Enum):
    """Authentication event types for logging."""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    PASSWORD_RESET_REQUESTED = "password_reset_requested"
    PASSWORD_RESET_USED = "password_reset_used"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    EMAIL_VERIFIED = "email_verified"
    ROLE_CHANGED = "role_changed"
    ACCOUNT_DEACTIVATED = "account_deactivated"

class AuthenticationLog:
    """Simple data class for AuthenticationLog - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
