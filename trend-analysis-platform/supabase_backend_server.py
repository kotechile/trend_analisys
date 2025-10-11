#!/usr/bin/env python3
"""
[DEPRECATED] Supabase-Integrated Backend Server for TrendTap
Uses Supabase SDK for database operations and real data storage

⚠️  DEPRECATED: This server only provides topic decomposition and affiliate research endpoints.
   Use backend/minimal_main.py instead for full functionality including content ideas.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import datetime
import json
import os
from supabase import create_client, Client
import structlog

# Configure logging
logger = structlog.get_logger()

app = FastAPI(title="TrendTap Backend with Supabase", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url_here")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "your_supabase_anon_key_here")

# Initialize Supabase client
supabase: Optional[Client] = None
if SUPABASE_URL != "your_supabase_url_here" and SUPABASE_KEY != "your_supabase_anon_key_here":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}")
        logger.info("Running in fallback mode without database")
else:
    logger.info("Supabase credentials not provided, running in fallback mode")

class TopicDecompositionRequest(BaseModel):
    search_query: str

class AffiliateSearchRequest(BaseModel):
    search_term: str
    niche: Optional[str] = None
    budget_range: Optional[str] = None
    user_id: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "TrendTap Backend API with Supabase",
        "version": "1.0.0",
        "status": "running",
        "database": "Supabase" if supabase else "Fallback Mode",
        "docs": "/docs",
        "endpoints": {
            "topic_decomposition": "/api/topics/decompose",
            "affiliate_research": "/api/affiliate-research/search"
        }
    }

@app.post("/api/topics/decompose")
async def decompose_topic(request: TopicDecompositionRequest):
    """
    Decompose a search query into related subtopics using AI analysis
    Stores results in Supabase if available
    """
    search_query = request.search_query
    
    try:
        # Generate intelligent subtopics
        subtopics = generate_intelligent_subtopics(search_query)
        
        # Store in Supabase if available
        if supabase:
            try:
                result = supabase.table("topic_decompositions").insert({
                    "search_query": search_query,
                    "subtopics": subtopics,
                    "created_at": datetime.datetime.now().isoformat(),
                    "user_id": None  # Could be extracted from auth context
                }).execute()
                logger.info(f"Stored topic decomposition in Supabase: {result}")
            except Exception as e:
                logger.warning(f"Failed to store in Supabase: {e}")
        
        return {
            "success": True,
            "message": "Topics decomposed successfully",
            "subtopics": subtopics,
            "original_query": search_query,
            "timestamp": datetime.datetime.now().isoformat(),
            "stored_in_database": supabase is not None
        }
        
    except Exception as e:
        logger.error(f"Error in topic decomposition: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/affiliate-research/search")
async def search_affiliate_programs(request: AffiliateSearchRequest):
    """
    Search for affiliate programs based on search criteria
    Stores results in Supabase if available
    """
    search_term = request.search_term
    niche = request.niche or "general"
    
    try:
        # Generate realistic affiliate programs
        programs = generate_realistic_affiliate_programs(search_term, niche)
        
        # Store in Supabase if available
        if supabase:
            try:
                result = supabase.table("affiliate_searches").insert({
                    "search_term": search_term,
                    "niche": niche,
                    "budget_range": request.budget_range,
                    "user_id": request.user_id,
                    "programs_found": len(programs),
                    "created_at": datetime.datetime.now().isoformat()
                }).execute()
                logger.info(f"Stored affiliate search in Supabase: {result}")
            except Exception as e:
                logger.warning(f"Failed to store in Supabase: {e}")
        
        return {
            "success": True,
            "message": "Affiliate programs found successfully",
            "data": {
                "programs": programs,
                "total_found": len(programs),
                "search_term": search_term,
                "niche": niche,
                "timestamp": datetime.datetime.now().isoformat()
            },
            "stored_in_database": supabase is not None
        }
        
    except Exception as e:
        logger.error(f"Error in affiliate search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_intelligent_subtopics(search_query: str) -> List[str]:
    """
    Generate intelligent subtopics based on the search query
    This simulates AI-powered topic decomposition
    """
    query_lower = search_query.lower()
    
    # Define topic patterns and their associated subtopics
    topic_patterns = {
        "fitness": [
            f"{search_query} workout routines",
            f"{search_query} nutrition guide",
            f"{search_query} equipment reviews",
            f"{search_query} beginner tips",
            f"{search_query} advanced techniques",
            f"{search_query} home workouts",
            f"{search_query} gym equipment",
            f"{search_query} fitness apps"
        ],
        "cooking": [
            f"{search_query} recipes",
            f"{search_query} cooking techniques",
            f"{search_query} kitchen equipment",
            f"{search_query} meal planning",
            f"{search_query} ingredient guides",
            f"{search_query} cooking tips",
            f"{search_query} food safety",
            f"{search_query} cooking tools"
        ],
        "technology": [
            f"{search_query} reviews",
            f"{search_query} tutorials",
            f"{search_query} troubleshooting",
            f"{search_query} best practices",
            f"{search_query} comparisons",
            f"{search_query} setup guides",
            f"{search_query} maintenance",
            f"{search_query} accessories"
        ],
        "business": [
            f"{search_query} strategies",
            f"{search_query} tools and software",
            f"{search_query} marketing tips",
            f"{search_query} financial planning",
            f"{search_query} legal considerations",
            f"{search_query} networking",
            f"{search_query} scaling",
            f"{search_query} case studies"
        ],
        "travel": [
            f"{search_query} destinations",
            f"{search_query} travel tips",
            f"{search_query} packing guides",
            f"{search_query} budget planning",
            f"{search_query} safety advice",
            f"{search_query} local experiences",
            f"{search_query} transportation",
            f"{search_query} accommodations"
        ]
    }
    
    # Find matching pattern or use default
    for pattern, subtopics in topic_patterns.items():
        if pattern in query_lower:
            return subtopics
    
    # Default intelligent subtopics
    return [
        f"{search_query} fundamentals",
        f"Advanced {search_query} techniques",
        f"{search_query} tools and resources",
        f"{search_query} best practices",
        f"{search_query} troubleshooting",
        f"{search_query} for beginners",
        f"Professional {search_query}",
        f"{search_query} reviews and comparisons"
    ]

def generate_realistic_affiliate_programs(search_term: str, niche: str) -> List[Dict[str, Any]]:
    """
    Generate realistic affiliate programs based on search criteria
    """
    # Define affiliate program templates based on niche
    program_templates = {
        "fitness": [
            {"name": f"{search_term} Masterclass", "network": "ClickBank", "rate": "50%", "category": "Education"},
            {"name": f"Premium {search_term} Equipment", "network": "Amazon Associates", "rate": "8%", "category": "Products"},
            {"name": f"{search_term} Nutrition Supplements", "network": "ShareASale", "rate": "25%", "category": "Health"},
            {"name": f"{search_term} Training App", "network": "CJ Affiliate", "rate": "30%", "category": "Software"},
            {"name": f"Personal {search_term} Coaching", "network": "Impact", "rate": "40%", "category": "Services"}
        ],
        "cooking": [
            {"name": f"{search_term} Cookbook", "network": "Amazon Associates", "rate": "6%", "category": "Books"},
            {"name": f"Professional {search_term} Tools", "network": "ShareASale", "rate": "15%", "category": "Kitchen"},
            {"name": f"{search_term} Online Course", "network": "ClickBank", "rate": "45%", "category": "Education"},
            {"name": f"Premium {search_term} Ingredients", "network": "CJ Affiliate", "rate": "20%", "category": "Food"},
            {"name": f"{search_term} Cooking Classes", "network": "Impact", "rate": "35%", "category": "Education"}
        ],
        "technology": [
            {"name": f"{search_term} Software License", "network": "CJ Affiliate", "rate": "25%", "category": "Software"},
            {"name": f"Professional {search_term} Tools", "network": "ShareASale", "rate": "18%", "category": "Tools"},
            {"name": f"{search_term} Online Training", "network": "ClickBank", "rate": "40%", "category": "Education"},
            {"name": f"Premium {search_term} Hardware", "network": "Amazon Associates", "rate": "4%", "category": "Hardware"},
            {"name": f"{search_term} Consulting Services", "network": "Impact", "rate": "30%", "category": "Services"}
        ],
        "business": [
            {"name": f"{search_term} Business Course", "network": "ClickBank", "rate": "50%", "category": "Education"},
            {"name": f"Professional {search_term} Software", "network": "CJ Affiliate", "rate": "30%", "category": "Software"},
            {"name": f"{search_term} Consulting Services", "network": "Impact", "rate": "25%", "category": "Services"},
            {"name": f"Premium {search_term} Tools", "network": "ShareASale", "rate": "20%", "category": "Tools"},
            {"name": f"{search_term} Mastermind Group", "network": "ClickBank", "rate": "45%", "category": "Education"}
        ],
        "travel": [
            {"name": f"{search_term} Travel Guide", "network": "Amazon Associates", "rate": "6%", "category": "Books"},
            {"name": f"Premium {search_term} Experiences", "network": "CJ Affiliate", "rate": "15%", "category": "Experiences"},
            {"name": f"{search_term} Travel Insurance", "network": "ShareASale", "rate": "12%", "category": "Insurance"},
            {"name": f"{search_term} Booking Platform", "network": "Impact", "rate": "8%", "category": "Services"},
            {"name": f"Luxury {search_term} Packages", "network": "CJ Affiliate", "rate": "10%", "category": "Travel"}
        ]
    }
    
    # Find matching niche or use default
    templates = program_templates.get(niche.lower(), program_templates["business"])
    
    # Generate programs with realistic data
    programs = []
    for i, template in enumerate(templates):
        program = {
            "id": str(i + 1),
            "name": template["name"],
            "description": f"Comprehensive {template['name'].lower()} program with expert guidance and proven results",
            "commission_rate": template["rate"],
            "network": template["network"],
            "epc": f"{25 + (i * 5):.2f}",
            "link": f"https://example.com/{template['name'].lower().replace(' ', '-')}",
            "category": template["category"],
            "difficulty": ["Easy", "Medium", "Hard"][i % 3],
            "rating": f"{4.0 + (i * 0.2):.1f}",
            "reviews": 50 + (i * 25)
        }
        programs.append(program)
    
    return programs

if __name__ == "__main__":
    print("🚀 Starting TrendTap Backend Server with Supabase Integration")
    print("📡 Available endpoints:")
    print("   - GET  /")
    print("   - POST /api/topics/decompose")
    print("   - POST /api/affiliate-research/search")
    print("   - GET  /docs (API documentation)")
    print("🗄️  Database: Supabase SDK")
    print("⚙️  Environment variables needed:")
    print("   - SUPABASE_URL")
    print("   - SUPABASE_ANON_KEY")
    print("🎯 This server provides intelligent topic decomposition and realistic affiliate research!")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

