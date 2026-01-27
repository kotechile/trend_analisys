from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
from uuid import UUID

from ..middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])
logger = logging.getLogger(__name__)

class ResearchSettings(BaseModel):
    min_volume: int = 50
    max_difficulty: int = 50
    min_cpc: float = 0.5
    strict_mode: bool = True

class SettingsResponse(BaseModel):
    success: bool
    data: Optional[ResearchSettings] = None
    message: Optional[str] = None

# In-memory storage for now (replace with DB later if needed)
# Map user_id (str) -> ResearchSettings
_settings_store: Dict[str, ResearchSettings] = {}

@router.get("/research", response_model=SettingsResponse)
async def get_research_settings(user_info: Dict[str, Any] = Depends(get_current_user)):
    """Get research settings for the current user"""
    try:
        user_id = user_info["user_id"]
        # Default settings if not found
        settings = _settings_store.get(user_id, ResearchSettings())
        
        return SettingsResponse(
            success=True,
            data=settings
        )
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        return SettingsResponse(
            success=False, 
            message="Failed to retrieve settings",
            data=ResearchSettings() # Return defaults on error
        )

@router.post("/research", response_model=SettingsResponse)
async def update_research_settings(
    settings: ResearchSettings, 
    user_info: Dict[str, Any] = Depends(get_current_user)
):
    """Update research settings for the current user"""
    try:
        user_id = user_info["user_id"]
        _settings_store[user_id] = settings
        
        logger.info(f"Updated settings for user {user_id}: {settings}")
        
        return SettingsResponse(
            success=True,
            data=settings,
            message="Settings saved successfully"
        )
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to save settings")
