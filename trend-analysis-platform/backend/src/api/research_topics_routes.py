"""
Research Topics API routes for dataflow persistence
This module provides REST API endpoints for managing research topics and their related data
"""

import logging
from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Request
from fastapi.responses import JSONResponse

from ..models.research_topic import (
    ResearchTopicCreate, ResearchTopicUpdate, ResearchTopicResponse,
    ResearchTopicListResponse, ResearchTopicComplete, ResearchTopicStats,
    ResearchTopicStatus
)
from ..models.topic_decomposition import TopicDecompositionCreate, TopicDecompositionResponse
from ..services.research_topic_service import ResearchTopicService
from ..services.topic_decomposition_service import TopicDecompositionService
from ..services.trend_analysis_service import TrendAnalysisService
from ..services.content_idea_service import ContentIdeaService
from ..middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/research-topics", tags=["research-topics"])

# Initialize services
research_topic_service = ResearchTopicService()
topic_decomposition_service = TopicDecompositionService()
trend_analysis_service = TrendAnalysisService()
content_idea_service = ContentIdeaService()

def get_current_user_id(request: Request) -> UUID:
    """Get current user ID from authentication context"""
    try:
        user_info = get_current_user(request)
        return UUID(user_info["user_id"])
    except Exception as e:
        logger.error(f"Error getting current user ID: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

# Common dependency for all routes
async def get_user_id(request: Request) -> UUID:
    """Get user ID from request"""
    return get_current_user_id(request)

@router.post("/", response_model=ResearchTopicResponse, status_code=201)
async def create_research_topic(
    topic_data: ResearchTopicCreate,
    user_id: UUID = Depends(get_user_id)
):
    """Create a new research topic"""
    try:
        topic = await research_topic_service.create(topic_data, user_id)
        if not topic:
            raise HTTPException(status_code=500, detail="Failed to create research topic")
        
        return topic
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating research topic: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{topic_id}", response_model=ResearchTopicResponse)
async def get_research_topic(
    topic_id: UUID = Path(..., description="Research topic ID"),
    user_id: UUID = Depends(get_user_id)
):
    """Get a research topic by ID"""
    try:
        topic = await research_topic_service.get_by_id(topic_id, user_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Research topic not found")
        
        return topic
        
    except Exception as e:
        logger.error(f"Error getting research topic: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=ResearchTopicListResponse)
async def list_research_topics(
    status: Optional[ResearchTopicStatus] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    order_by: str = Query("created_at", description="Field to sort by"),
    order_direction: str = Query("desc", description="Sort direction (asc/desc)"),
    user_id: UUID = Depends(get_user_id)
):
    """List research topics with pagination and filtering"""
    try:
        topics = await research_topic_service.get_all(
            user_id=user_id,
            status=status,
            page=page,
            size=size,
            order_by=order_by,
            order_direction=order_direction
        )
        
        return topics
        
    except Exception as e:
        logger.error(f"Error listing research topics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{topic_id}", response_model=ResearchTopicResponse)
async def update_research_topic(
    topic_id: UUID = Path(..., description="Research topic ID"),
    topic_data: ResearchTopicUpdate = ...,
    user_id: UUID = Depends(get_user_id)
):
    """Update a research topic"""
    try:
        topic = await research_topic_service.update(topic_id, topic_data, user_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Research topic not found")
        
        return topic
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating research topic: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{topic_id}", status_code=204)
async def delete_research_topic(
    topic_id: UUID = Path(..., description="Research topic ID"),
    user_id: UUID = Depends(get_user_id)
):
    """Delete a research topic"""
    try:
        success = await research_topic_service.delete(topic_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Research topic not found")
        
        return JSONResponse(content=None, status_code=204)
        
    except Exception as e:
        logger.error(f"Error deleting research topic: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{topic_id}/complete", response_model=ResearchTopicComplete)
async def get_complete_dataflow(
    topic_id: UUID = Path(..., description="Research topic ID"),
    user_id: UUID = Depends(get_user_id)
):
    """Get complete dataflow for a research topic including all related data"""
    try:
        dataflow = await research_topic_service.get_complete_dataflow(topic_id, user_id)
        if not dataflow:
            raise HTTPException(status_code=404, detail="Research topic not found")
        
        return dataflow
        
    except Exception as e:
        logger.error(f"Error getting complete dataflow: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{topic_id}/stats", response_model=ResearchTopicStats)
async def get_research_topic_stats(
    topic_id: UUID = Path(..., description="Research topic ID"),
    user_id: UUID = Depends(get_user_id)
):
    """Get statistics for a research topic"""
    try:
        # Verify topic exists
        topic = await research_topic_service.get_by_id(topic_id, user_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Research topic not found")
        
        stats = await research_topic_service.get_stats(user_id)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting research topic stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{topic_id}/subtopics", response_model=TopicDecompositionResponse, status_code=201)
async def create_subtopics(
    topic_id: UUID = Path(..., description="Research topic ID"),
    decomposition_data: TopicDecompositionCreate = ...,
    user_id: UUID = Depends(get_user_id)
):
    """Create subtopics for a research topic"""
    try:
        # Set the research topic ID
        decomposition_data.research_topic_id = topic_id
        
        decomposition = await topic_decomposition_service.create_subtopics(
            research_topic_id=topic_id,
            decomposition_data=decomposition_data,
            user_id=user_id
        )
        
        if not decomposition:
            raise HTTPException(status_code=500, detail="Failed to create subtopics")
        
        return decomposition
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating subtopics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{topic_id}/subtopics", response_model=TopicDecompositionResponse)
async def get_subtopics(
    topic_id: UUID = Path(..., description="Research topic ID"),
    user_id: UUID = Depends(get_user_id)
):
    """Get subtopics for a research topic"""
    try:
        decomposition = await topic_decomposition_service.get_by_research_topic(topic_id, user_id)
        if not decomposition:
            raise HTTPException(status_code=404, detail="No subtopics found for this research topic")
        
        return decomposition
        
    except Exception as e:
        logger.error(f"Error getting subtopics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{topic_id}/archive", response_model=ResearchTopicResponse)
async def archive_research_topic(
    topic_id: UUID = Path(..., description="Research topic ID"),
    user_id: UUID = Depends(get_user_id)
):
    """Archive a research topic"""
    try:
        topic = await research_topic_service.archive(topic_id, user_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Research topic not found")
        
        return topic
        
    except Exception as e:
        logger.error(f"Error archiving research topic: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{topic_id}/restore", response_model=ResearchTopicResponse)
async def restore_research_topic(
    topic_id: UUID = Path(..., description="Research topic ID"),
    user_id: UUID = Depends(get_user_id)
):
    """Restore an archived research topic"""
    try:
        topic = await research_topic_service.restore(topic_id, user_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Research topic not found or not archived")
        
        return topic
        
    except Exception as e:
        logger.error(f"Error restoring research topic: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/search", response_model=ResearchTopicListResponse)
async def search_research_topics(
    query: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    user_id: UUID = Depends(get_user_id)
):
    """Search research topics by title or description"""
    try:
        topics = await research_topic_service.search(query, user_id, page, size)
        return topics
        
    except Exception as e:
        logger.error(f"Error searching research topics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stats/overview", response_model=ResearchTopicStats)
async def get_overview_stats(
    user_id: UUID = Depends(get_user_id)
):
    """Get overview statistics for all research topics"""
    try:
        stats = await research_topic_service.get_stats(user_id)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting overview stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
