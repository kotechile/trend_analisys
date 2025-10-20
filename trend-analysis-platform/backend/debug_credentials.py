#!/usr/bin/env python3
"""
Debug DataForSEO credentials retrieval
"""

import asyncio
from src.dataforseo.database import DatabaseManager, DataForSEORepository

async def debug_credentials():
    try:
        # Initialize database manager
        db_manager = DatabaseManager()
        await db_manager.initialize()
        
        # Initialize repository
        repository = DataForSEORepository(db_manager)
        
        # Check raw credentials
        print("Checking raw credentials...")
        raw_creds = await repository.get_raw_api_credentials("dataforseo")
        print(f"Raw credentials: {raw_creds}")
        
        # Check structured credentials
        print("\nChecking structured credentials...")
        structured_creds = await repository.get_api_credentials("dataforseo")
        print(f"Structured credentials: {structured_creds}")
        
        # Check all api_keys
        print("\nChecking all api_keys...")
        client = db_manager.get_client()
        all_keys = client.table("api_keys").select("*").execute()
        print(f"All keys: {all_keys.data}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_credentials())
