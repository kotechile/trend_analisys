#!/usr/bin/env python3
"""
Script to create the content_ideas table in Supabase
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Missing required Supabase environment variables")
    sys.exit(1)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def create_content_ideas_table():
    """Create the content_ideas table"""
    try:
        # First, check if table exists
        result = supabase.table("content_ideas").select("id").limit(1).execute()
        print("✅ content_ideas table already exists")
        return True
    except Exception as e:
        if "relation \"content_ideas\" does not exist" in str(e):
            print("📝 content_ideas table does not exist, creating...")
            
            # Create the table using raw SQL
            sql = """
            CREATE TABLE content_ideas (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                research_id VARCHAR(255) NOT NULL,
                ideas JSONB NOT NULL DEFAULT '[]'::jsonb,
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(research_id, user_id)
            );
            """
            
            try:
                # Execute raw SQL
                result = supabase.rpc('exec_sql', {'sql': sql}).execute()
                print("✅ content_ideas table created successfully")
                
                # Create indexes
                index_sql = """
                CREATE INDEX idx_content_ideas_research_id ON content_ideas(research_id);
                CREATE INDEX idx_content_ideas_user_id ON content_ideas(user_id);
                """
                supabase.rpc('exec_sql', {'sql': index_sql}).execute()
                print("✅ Indexes created successfully")
                
                # Enable RLS
                rls_sql = """
                ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
                """
                supabase.rpc('exec_sql', {'sql': rls_sql}).execute()
                print("✅ RLS enabled successfully")
                
                # Create RLS policies
                policies_sql = """
                CREATE POLICY "Users can view their own content ideas" ON content_ideas
                    FOR SELECT USING (auth.uid() = user_id);
                
                CREATE POLICY "Users can insert their own content ideas" ON content_ideas
                    FOR INSERT WITH CHECK (auth.uid() = user_id);
                
                CREATE POLICY "Users can update their own content ideas" ON content_ideas
                    FOR UPDATE USING (auth.uid() = user_id);
                
                CREATE POLICY "Users can delete their own content ideas" ON content_ideas
                    FOR DELETE USING (auth.uid() = user_id);
                """
                supabase.rpc('exec_sql', {'sql': policies_sql}).execute()
                print("✅ RLS policies created successfully")
                
                return True
                
            except Exception as create_error:
                print(f"❌ Failed to create table: {create_error}")
                return False
        else:
            print(f"❌ Error checking table: {e}")
            return False

if __name__ == "__main__":
    print("🚀 Creating content_ideas table...")
    success = create_content_ideas_table()
    if success:
        print("🎉 Table creation completed successfully!")
    else:
        print("💥 Table creation failed!")
        sys.exit(1)
