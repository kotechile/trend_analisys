#!/usr/bin/env python3
"""
Create API Keys table in Supabase for secure key management
"""

import os
import sys
from supabase import create_client, Client

def create_api_keys_table():
    """Create the api_keys table in Supabase"""
    
    # Get Supabase credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials in environment variables")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        return False
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Create the api_keys table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS api_keys (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            key_name VARCHAR(100) NOT NULL UNIQUE,
            key_value TEXT NOT NULL,
            provider VARCHAR(50) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES users(id),
            environment VARCHAR(20) DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production'))
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
        CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
        CREATE INDEX IF NOT EXISTS idx_api_keys_environment ON api_keys(environment);
        
        -- Create RLS policies for security
        ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
        
        -- Policy: Only service role can access all keys
        CREATE POLICY "Service role can manage all API keys" ON api_keys
            FOR ALL USING (auth.role() = 'service_role');
        
        -- Policy: Users can only view their own keys (if any)
        CREATE POLICY "Users can view their own API keys" ON api_keys
            FOR SELECT USING (auth.uid() = created_by);
        
        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        CREATE TRIGGER update_api_keys_updated_at 
            BEFORE UPDATE ON api_keys 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """
        
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'sql': create_table_sql})
        print("✅ API keys table created successfully")
        
        # Insert some initial API keys from environment variables
        initial_keys = [
            {
                'key_name': 'openai_api_key',
                'key_value': os.getenv('OPENAI_API_KEY', ''),
                'provider': 'openai',
                'description': 'OpenAI API key for GPT models',
                'environment': 'production'
            },
            {
                'key_name': 'linkup_api_key', 
                'key_value': os.getenv('LINKUP_API_KEY', ''),
                'provider': 'linkup',
                'description': 'LinkUp.so API key for affiliate offers',
                'environment': 'production'
            },
            {
                'key_name': 'anthropic_api_key',
                'key_value': os.getenv('ANTHROPIC_API_KEY', ''),
                'provider': 'anthropic', 
                'description': 'Anthropic API key for Claude models',
                'environment': 'production'
            },
            {
                'key_name': 'google_ai_api_key',
                'key_value': os.getenv('GOOGLE_AI_API_KEY', ''),
                'provider': 'google',
                'description': 'Google AI API key for Gemini models',
                'environment': 'production'
            },
            {
                'key_name': 'deepseek_api_key',
                'key_value': os.getenv('DEEPSEEK_API_KEY', ''),
                'provider': 'deepseek',
                'description': 'DeepSeek API key for DeepSeek models',
                'environment': 'production'
            }
        ]
        
        # Insert keys (only if they have values)
        for key_data in initial_keys:
            if key_data['key_value']:
                try:
                    supabase.table('api_keys').insert(key_data).execute()
                    print(f"✅ Inserted {key_data['key_name']}")
                except Exception as e:
                    if "duplicate key" in str(e).lower():
                        print(f"⚠️  {key_data['key_name']} already exists, skipping")
                    else:
                        print(f"❌ Error inserting {key_data['key_name']}: {e}")
            else:
                print(f"⚠️  Skipping {key_data['key_name']} (no value in environment)")
        
        print("\n🎉 API keys table setup complete!")
        print("You can now manage API keys through the Supabase dashboard or API")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating API keys table: {e}")
        return False

if __name__ == "__main__":
    success = create_api_keys_table()
    sys.exit(0 if success else 1)

