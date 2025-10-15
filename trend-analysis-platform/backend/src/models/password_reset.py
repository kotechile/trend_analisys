"""
PasswordReset model for password reset functionality.
"""
import uuid
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    func,
)
from src.core.database import Base

class PasswordReset:
    """Simple data class for PasswordReset - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
