#!/usr/bin/env python3
"""
Remove intent_type constraint from keyword_research_data table
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), 'trend-analysis-platform', 'backend', '.env')
load_dotenv(dotenv_path)

# Database credentials
DB_HOST = os.getenv("SUPABASE_DB_HOST")
DB_NAME = os.getenv("SUPABASE_DB_NAME") 
DB_USER = os.getenv("SUPABASE_DB_USER")
DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")
DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")

if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
    print("❌ Database credentials not found in .env file.")
    print("Required: SUPABASE_DB_HOST, SUPABASE_DB_NAME, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD")
    sys.exit(1)

try:
    # Connect to PostgreSQL database
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    
    # Check if constraint exists
    cursor.execute("""
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'keyword_research_data' 
        AND constraint_name = 'keyword_research_data_intent_type_check'
    """)
    
    constraint_exists = cursor.fetchone()
    
    if constraint_exists:
        print(f"✅ Found constraint: {constraint_exists[0]}")
        
        # Remove the constraint
        cursor.execute("ALTER TABLE keyword_research_data DROP CONSTRAINT keyword_research_data_intent_type_check;")
        print("✅ Successfully removed intent_type constraint")
    else:
        print("ℹ️  Constraint does not exist (may have been already removed)")
    
    # Verify constraint is removed
    cursor.execute("""
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'keyword_research_data' 
        AND constraint_name = 'keyword_research_data_intent_type_check'
    """)
    
    constraint_still_exists = cursor.fetchone()
    
    if not constraint_still_exists:
        print("✅ Verification: Constraint successfully removed")
    else:
        print("❌ Verification: Constraint still exists")
    
    cursor.close()
    conn.close()
    
    print("🎉 Database constraint removal completed successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
