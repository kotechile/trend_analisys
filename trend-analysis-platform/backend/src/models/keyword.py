"""
Keyword model for keyword analysis data
"""

"""
This model file is disabled for Supabase-only architecture.
All database operations go through Supabase SDK.
"""

from datetime import datetime
from typing import List, Optional
import uuid

# # Base = declarative_base()  # Disabled for Supabase-only  # Disabled for Supabase-only

class Keyword:
    """Simple data class for Keyword - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class UploadedFile:
    """Simple data class for UploadedFile - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
