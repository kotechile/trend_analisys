#!/usr/bin/env python3
"""
Startup script for TrendTap API with Research Topics integration
This script initializes the FastAPI application with all research topics functionality
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the src directory to the Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

# Set environment variables if not already set
os.environ.setdefault("SUPABASE_URL", "https://your-project.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "your-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")

def main():
    """Start the FastAPI application with research topics integration"""
    print("🚀 Starting TrendTap API with Research Topics Integration")
    print("=" * 60)
    
    # Import the main app
    try:
        from src.main import app
        print("✅ Application imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import application: {e}")
        return
    
    # Print available routes
    print("\n📋 Available API Routes:")
    print("-" * 30)
    
    # Research Topics routes
    print("Research Topics:")
    print("  POST   /api/research-topics/")
    print("  GET    /api/research-topics/")
    print("  GET    /api/research-topics/{id}")
    print("  PUT    /api/research-topics/{id}")
    print("  DELETE /api/research-topics/{id}")
    print("  GET    /api/research-topics/{id}/complete")
    print("  GET    /api/research-topics/{id}/stats")
    print("  POST   /api/research-topics/{id}/subtopics")
    print("  GET    /api/research-topics/{id}/subtopics")
    print("  PUT    /api/research-topics/{id}/archive")
    print("  PUT    /api/research-topics/{id}/restore")
    print("  GET    /api/research-topics/search")
    print("  GET    /api/research-topics/stats/overview")
    
    # Other existing routes
    print("\nOther Routes:")
    print("  GET    /")
    print("  GET    /supabase-health")
    print("  GET    /docs")
    print("  GET    /redoc")
    
    print("\n" + "=" * 60)
    print("🌐 Starting server on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 ReDoc Documentation: http://localhost:8000/redoc")
    print("=" * 60)
    
    # Start the server
    try:
        uvicorn.run(
            "src.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server failed to start: {e}")

if __name__ == "__main__":
    main()
