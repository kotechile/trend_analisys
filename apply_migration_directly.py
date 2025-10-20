#!/usr/bin/env python3
"""
Apply migration directly using Supabase client
"""

import asyncio
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from the .env file in the backend directory
dotenv_path = os.path.join(os.path.dirname(__file__), 'trend-analysis-platform', 'backend', '.env')
load_dotenv(dotenv_path)

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials not found in .env file.")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger.info("✅ Supabase client created successfully")

async def apply_migration():
    """Apply the migration directly using SQL"""
    try:
        # Read the migration file
        migration_file = "/Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/supabase/migrations/20251018234115_add_missing_keyword_fields.sql"
        
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        logger.info("Applying migration to add missing keyword fields...")
        
        # Split the SQL into individual statements
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement:
                logger.info(f"Executing statement {i+1}/{len(statements)}")
                try:
                    # Execute each statement using rpc
                    result = supabase.rpc('exec_sql', {'sql': statement}).execute()
                    logger.info(f"✅ Statement {i+1} executed successfully")
                except Exception as e:
                    logger.warning(f"⚠️ Statement {i+1} failed (might already exist): {e}")
        
        logger.info("✅ Migration completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    asyncio.run(apply_migration())
