"""
Simple test server to verify the affiliate research functionality
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import json

app = FastAPI(title="Test TrendTap API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://trendtap.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicDecompositionRequest(BaseModel):
    search_query: str
    max_subtopics: int = 10

class AffiliateSearchRequest(BaseModel):
    search_term: str
    niche: str = None
    user_id: str = "temp_user"

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Test TrendTap API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.post("/api/topics/decompose")
async def decompose_topic(request: TopicDecompositionRequest):
    """
    Mock topic decomposition endpoint
    """
    # Mock response with sample subtopics
    mock_subtopics = [
        f"{request.search_query} basics",
        f"advanced {request.search_query}",
        f"{request.search_query} for beginners",
        f"professional {request.search_query}",
        f"{request.search_query} tools and resources"
    ]
    
    return {
        "success": True,
        "data": {
            "id": "mock_decomposition_123",
            "search_query": request.search_query,
            "subtopics": mock_subtopics[:request.max_subtopics],
            "created_at": "2024-01-01T00:00:00Z"
        }
    }

@app.post("/api/affiliate-research/search")
async def search_affiliate_programs(request: AffiliateSearchRequest):
    """
    Mock affiliate research endpoint
    """
    # Mock response with sample affiliate programs
    mock_programs = [
        {
            "name": f"{request.search_term} Mastery Program",
            "description": f"Learn everything about {request.search_term} with our comprehensive course",
            "commission_rate": "30%",
            "network": "ClickBank",
            "epc": "45.50",
            "link": "https://example.com/program1"
        },
        {
            "name": f"Advanced {request.search_term} Training",
            "description": f"Professional training for {request.search_term} experts",
            "commission_rate": "25%",
            "network": "ShareASale",
            "epc": "38.75",
            "link": "https://example.com/program2"
        },
        {
            "name": f"{request.search_term} Tools & Resources",
            "description": f"Essential tools and resources for {request.search_term}",
            "commission_rate": "40%",
            "network": "CJ Affiliate",
            "epc": "52.30",
            "link": "https://example.com/program3"
        }
    ]
    
    return {
        "success": True,
        "message": "Affiliate programs found successfully",
        "data": {
            "programs": mock_programs,
            "total_found": len(mock_programs),
            "search_term": request.search_term,
            "niche": request.niche
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "test_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
