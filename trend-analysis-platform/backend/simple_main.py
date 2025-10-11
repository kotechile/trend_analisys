"""
Simple FastAPI Backend for TrendTap
Minimal version that works with CORS
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="TrendTap API",
    description="API for trend analysis and research topics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "TrendTap API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2025-10-09T23:30:00.000000",
        "service": "TrendTap Backend API",
        "version": "1.0.0"
    }

# Mock endpoints for topic decomposition
@app.post("/api/enhanced-topic-decomposition")
async def enhanced_topic_decomposition(data: dict):
    """Mock enhanced topic decomposition endpoint"""
    topic = data.get("topic", "Unknown Topic")
    
    # Generate mock subtopics
    subtopics = [
        f"{topic} - Introduction",
        f"{topic} - Benefits and Advantages", 
        f"{topic} - Implementation Strategies",
        f"{topic} - Best Practices",
        f"{topic} - Case Studies",
        f"{topic} - Tools and Resources",
        f"{topic} - Common Challenges",
        f"{topic} - Future Trends",
        f"{topic} - Expert Tips",
        f"{topic} - Cost Analysis"
    ]
    
    return {
        "subtopics": subtopics,
        "status": "success",
        "message": "Enhanced topic decomposition completed"
    }

@app.post("/api/topic-decomposition")
async def topic_decomposition(data: dict):
    """Mock topic decomposition endpoint"""
    topic = data.get("topic", "Unknown Topic")
    
    # Generate mock subtopics
    subtopics = [
        f"{topic} - Overview",
        f"{topic} - Key Concepts",
        f"{topic} - Practical Applications",
        f"{topic} - Industry Insights",
        f"{topic} - Expert Recommendations"
    ]
    
    return {
        "subtopics": subtopics,
        "status": "success",
        "message": "Topic decomposition completed"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)