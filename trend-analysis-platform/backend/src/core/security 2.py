"""
Security utilities and dependencies
"""

from fastapi import HTTPException, Depends
from typing import Optional

def require_admin():
    """Simple admin requirement - for now, always allow"""
    # TODO: Implement proper admin authentication
    return True

def get_current_user():
    """Get current user - for now, return a mock user"""
    # TODO: Implement proper user authentication
    return {"id": "admin", "role": "admin", "username": "admin"}

