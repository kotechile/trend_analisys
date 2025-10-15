"""
TrendAnalysis model for TrendTap
"""

from enum import Enum as PyEnum
from ..core.database import Base

class AnalysisStatus(PyEnum):
    """Analysis status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TrendAnalysis:
    """Simple data class for TrendAnalysis - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
