"""
Settings API routes
FastAPI routes for managing application settings including LLM provider configuration
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator

from ..core.api_key_manager import api_key_manager
from ..core.llm_config import LLMProvider

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/settings", tags=["Settings"])


# Request/Response Models
class LLMProviderSettings(BaseModel):
    """Model for LLM provider settings"""
    default_provider: str = Field(..., description="Default LLM provider")
    available_providers: list = Field(..., description="List of available LLM providers")
    
    @validator('default_provider')
    def validate_provider(cls, v):
        valid_providers = [provider.value for provider in LLMProvider]
        if v not in valid_providers:
            raise ValueError(f'Invalid provider. Must be one of: {valid_providers}')
        return v


class SettingsResponse(BaseModel):
    """Response model for settings operations"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Human-readable message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")


@router.get("/llm-providers", response_model=SettingsResponse)
async def get_llm_providers():
    """Get available LLM providers and current default"""
    try:
        # Get available providers (those with API keys)
        available_providers = []
        for provider in LLMProvider:
            try:
                if provider == LLMProvider.OPENAI and api_key_manager.get_openai_key():
                    available_providers.append(provider.value)
                elif provider == LLMProvider.ANTHROPIC and api_key_manager.get_anthropic_key():
                    available_providers.append(provider.value)
                elif provider == LLMProvider.GOOGLE_AI and api_key_manager.get_google_ai_key():
                    available_providers.append(provider.value)
                elif provider == LLMProvider.DEEPSEEK and api_key_manager.get_deepseek_key():
                    available_providers.append(provider.value)
            except Exception as e:
                logger.warning(f"Provider {provider.value} not available: {e}")
                continue
        
        # Get current default - prioritize DeepSeek if available, otherwise first available
        if 'deepseek' in available_providers:
            current_default = 'deepseek'
        else:
            current_default = available_providers[0] if available_providers else 'openai'
        
        return SettingsResponse(
            success=True,
            message="LLM providers retrieved successfully",
            data={
                "default_provider": current_default,
                "available_providers": available_providers
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting LLM providers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get LLM providers: {str(e)}"
        )


@router.post("/llm-providers", response_model=SettingsResponse)
async def set_default_llm_provider(settings: LLMProviderSettings):
    """Set the default LLM provider"""
    try:
        # Validate the provider is available
        if settings.default_provider not in settings.available_providers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Provider {settings.default_provider} is not available"
            )
        
        # For now, we'll store this in a simple way
        # In production, this would be stored in Supabase
        logger.info(f"Setting default LLM provider to: {settings.default_provider}")
        
        return SettingsResponse(
            success=True,
            message=f"Default LLM provider set to {settings.default_provider}",
            data={
                "default_provider": settings.default_provider,
                "available_providers": settings.available_providers
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting LLM provider: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set LLM provider: {str(e)}"
        )


@router.get("/status", response_model=SettingsResponse)
async def get_settings_status():
    """Get overall settings status"""
    try:
        # Check API key status
        api_status = {
            "openai": bool(api_key_manager.get_openai_key()),
            "anthropic": bool(api_key_manager.get_anthropic_key()),
            "google_ai": bool(api_key_manager.get_google_ai_key()),
            "deepseek": bool(api_key_manager.get_deepseek_key())
        }
        
        return SettingsResponse(
            success=True,
            message="Settings status retrieved successfully",
            data={
                "api_keys": api_status,
                "total_configured": sum(api_status.values())
            }
        )
        
    except Exception as e:
        logger.error(f"Error getting settings status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get settings status: {str(e)}"
        )
