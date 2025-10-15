"""
KeywordData model for TrendTap
"""

from enum import Enum as PyEnum
from ..core.database import Base

class KeywordSource(PyEnum):
    """Keyword source enumeration"""
    CSV_UPLOAD = "csv_upload"
    DATAFORSEO = "dataforseo"
    MANUAL = "manual"

class KeywordStatus(PyEnum):
    """Keyword processing status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class KeywordData:
    """Simple data class for KeywordData - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
