"""
UserSession model for JWT session management.
"""
import uuid
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    func,
)
from src.core.database import Base

class UserSession:
    """Simple data class for UserSession - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
