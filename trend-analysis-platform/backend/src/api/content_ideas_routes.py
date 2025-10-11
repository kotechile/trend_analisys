"""
Content Ideas API Routes
Handles generation and management of content ideas (blog posts and software ideas)
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from ..services.content_idea_generator import ContentIdeaGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/content-ideas", tags=["content-ideas"])

# Pydantic models
class ContentIdeaGenerationRequest(BaseModel):
    topic_id: str
    topic_title: str
    subtopics: List[str]
    keywords: List[str]
    user_id: str
    content_types: Optional[List[str]] = None  # ['blog', 'software'] or None for both

class ContentIdeaResponse(BaseModel):
    success: bool
    message: str
    total_ideas: int
    blog_ideas: int
    software_ideas: int
    ideas: List[Dict[str, Any]]

class ContentIdeaListRequest(BaseModel):
    topic_id: str
    user_id: str
    content_type: Optional[str] = None  # 'blog', 'software', or None for all

# Dependency
def get_content_idea_generator() -> ContentIdeaGenerator:
    return ContentIdeaGenerator()

@router.post("/generate", response_model=ContentIdeaResponse)
async def generate_content_ideas(
    request: ContentIdeaGenerationRequest,
    generator: ContentIdeaGenerator = Depends(get_content_idea_generator)
):
    """
    Generate content ideas (blog posts and software ideas) based on subtopics and keywords
    """
    try:
        logger.info(f"Generating content ideas for topic: {request.topic_title}")
        logger.info(f"Subtopics: {len(request.subtopics)}")
        logger.info(f"Keywords: {len(request.keywords)}")
        logger.info(f"Content types: {request.content_types}")

        result = await generator.generate_content_ideas(
            topic_id=request.topic_id,
            topic_title=request.topic_title,
            subtopics=request.subtopics,
            keywords=request.keywords,
            user_id=request.user_id,
            content_types=request.content_types
        )

        return ContentIdeaResponse(
            success=result["success"],
            message=f"Successfully generated {result['total_ideas']} content ideas",
            total_ideas=result["total_ideas"],
            blog_ideas=result["blog_ideas"],
            software_ideas=result["software_ideas"],
            ideas=result["ideas"]
        )

    except Exception as e:
        logger.error(f"Content idea generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Content idea generation failed: {str(e)}")

@router.post("/list", response_model=List[Dict[str, Any]])
async def list_content_ideas(
    request: ContentIdeaListRequest,
    generator: ContentIdeaGenerator = Depends(get_content_idea_generator)
):
    """
    Retrieve content ideas for a specific topic
    """
    try:
        logger.info(f"Retrieving content ideas for topic: {request.topic_id}")
        logger.info(f"Content type filter: {request.content_type}")

        ideas = await generator.get_content_ideas(
            topic_id=request.topic_id,
            user_id=request.user_id,
            content_type=request.content_type
        )

        return ideas

    except Exception as e:
        logger.error(f"Failed to retrieve content ideas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve content ideas: {str(e)}")

@router.delete("/{idea_id}")
async def delete_content_idea(
    idea_id: str,
    user_id: str,
    generator: ContentIdeaGenerator = Depends(get_content_idea_generator)
):
    """
    Delete a specific content idea
    """
    try:
        logger.info(f"Deleting content idea: {idea_id}")

        # Delete from database
        result = generator.supabase.table('content_ideas').delete().eq('id', idea_id).eq('user_id', user_id).execute()
        
        if result.data:
            return {"success": True, "message": "Content idea deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Content idea not found")

    except Exception as e:
        logger.error(f"Failed to delete content idea: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete content idea: {str(e)}")