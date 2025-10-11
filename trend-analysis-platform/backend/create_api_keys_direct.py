#!/usr/bin/env python3
"""
Create API Keys table directly using Supabase SQL editor approach
"""

import os
import sys
import requests
import json

def create_api_keys_table_direct():
    """Create the api_keys table using direct SQL execution"""
    
    supabase_url = "https://bvsqnmkvbbvtrcomtvnc.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwNjIxNCwiZXhwIjoyMDc1MDgyMjE0fQ.T1Njr6eHmqCJQOAYlxaXE8N85z0MtUKGNuFB7pPoM-s"
    
    # SQL to create the table
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
        environment VARCHAR(20) DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production'))
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
    CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
    CREATE INDEX IF NOT EXISTS idx_api_keys_environment ON api_keys(environment);
    
    -- Enable RLS
    ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for service role
    CREATE POLICY "Service role can manage all API keys" ON api_keys
        FOR ALL USING (auth.role() = 'service_role');
    """
    
    try:
        # Execute SQL using Supabase REST API
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        # Use the rpc endpoint to execute SQL
        url = f"{supabase_url}/rest/v1/rpc/exec"
        payload = {"sql": create_table_sql}
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("✅ API keys table created successfully")
            
            # Now insert the API keys
            insert_keys()
            return True
        else:
            print(f"❌ Error creating table: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def insert_keys():
    """Insert API keys into the table"""
    
    supabase_url = "https://bvsqnmkvbbvtrcomtvnc.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwNjIxNCwiZXhwIjoyMDc1MDgyMjE0fQ.T1Njr6eHmqCJQOAYlxaXE8N85z0MtUKGNuFB7pPoM-s"
    
    # Read keys from .env file
    keys = {}
    env_file = ".env"
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    keys[key] = value
    
    # Define keys to insert
    key_data = [
        {
            'key_name': 'openai_api_key',
            'key_value': keys.get('OPENAI_API_KEY', ''),
            'provider': 'openai',
            'description': 'OpenAI API key for GPT models'
        },
        {
            'key_name': 'linkup_api_key',
            'key_value': keys.get('LINKUP_API_KEY', ''),
            'provider': 'linkup', 
            'description': 'LinkUp.so API key for affiliate offers'
        },
        {
            'key_name': 'anthropic_api_key',
            'key_value': keys.get('ANTHROPIC_API_KEY', ''),
            'provider': 'anthropic',
            'description': 'Anthropic API key for Claude models'
        },
        {
            'key_name': 'google_ai_api_key',
            'key_value': keys.get('GOOGLE_AI_API_KEY', ''),
            'provider': 'google',
            'description': 'Google AI API key for Gemini models'
        },
        {
            'key_name': 'deepseek_api_key',
            'key_value': keys.get('DEEPSEEK_API_KEY', ''),
            'provider': 'deepseek',
            'description': 'DeepSeek API key for DeepSeek models'
        }
    ]
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    for key_info in key_data:
        if key_info['key_value']:
            try:
                url = f"{supabase_url}/rest/v1/api_keys"
                response = requests.post(url, headers=headers, json=key_info)
                
                if response.status_code in [200, 201]:
                    print(f"✅ Inserted {key_info['key_name']}")
                else:
                    print(f"⚠️  {key_info['key_name']}: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"❌ Error inserting {key_info['key_name']}: {e}")
        else:
            print(f"⚠️  Skipping {key_info['key_name']} (no value)")

if __name__ == "__main__":
    success = create_api_keys_table_direct()
    sys.exit(0 if success else 1)

