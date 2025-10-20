#!/usr/bin/env python3
"""
DataForSEO Migration Runner

This script runs all DataForSEO migrations in the correct order.
Run this script from the backend directory.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.dataforseo.database_utils import db_utils

async def main():
    """Run all DataForSEO migrations"""
    print("🚀 Starting DataForSEO migrations...")
    
    try:
        # Initialize database manager
        await db_utils.db_manager.initialize()
        print("✅ Database connection initialized")
        
        # Run all migrations
        success = await db_utils.run_all_migrations()
        
        if success:
            print("🎉 All DataForSEO migrations completed successfully!")
            
            # Get database stats
            stats = await db_utils.get_database_stats()
            print("\n📊 Database Statistics:")
            print(f"Trend Analysis Data: {stats.get('trend_analysis_data', {}).get('total_records', 0)} records")
            print(f"Keyword Research Data: {stats.get('keyword_research_data', {}).get('total_records', 0)} records")
            print(f"Subtopic Suggestions: {stats.get('subtopic_suggestions', {}).get('total_records', 0)} records")
            print(f"API Logs: {stats.get('api_logs', {}).get('total_requests', 0)} requests")
            
        else:
            print("❌ Migration failed. Check the logs for details.")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        sys.exit(1)
    
    finally:
        # Close database connection
        await db_utils.db_manager.close()
        print("🔌 Database connection closed")

if __name__ == "__main__":
    asyncio.run(main())
