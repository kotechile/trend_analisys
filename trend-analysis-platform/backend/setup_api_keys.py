#!/usr/bin/env python3
"""
Setup API keys in Supabase - simpler approach
"""

import os
import sys
from supabase import create_client, Client

def setup_api_keys():
    """Setup API keys in Supabase"""
    
    supabase_url = "https://bvsqnmkvbbvtrcomtvnc.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwNjIxNCwiZXhwIjoyMDc1MDgyMjE0fQ.T1Njr6eHmqCJQOAYlxaXE8N85z0MtUKGNuFB7pPoM-s"
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # First, let's try to create the table using a simple approach
        print("\n📋 Please run this SQL in your Supabase SQL Editor:")
        print("=" * 60)
        print("""
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL UNIQUE,
    key_value TEXT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environment VARCHAR(20) DEFAULT 'production'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage all API keys" ON api_keys
    FOR ALL USING (auth.role() = 'service_role');
        """)
        print("=" * 60)
        
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
        
        # Prepare key data
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
        
        print("\n📝 After creating the table, run this to insert keys:")
        print("=" * 60)
        
        for key_info in key_data:
            if key_info['key_value']:
                print(f"""
INSERT INTO api_keys (key_name, key_value, provider, description, is_active, environment)
VALUES ('{key_info['key_name']}', '{key_info['key_value']}', '{key_info['provider']}', '{key_info['description']}', true, 'production')
ON CONFLICT (key_name) DO UPDATE SET 
    key_value = EXCLUDED.key_value,
    updated_at = NOW();""")
            else:
                print(f"-- Skipping {key_info['key_name']} (no value in .env)")
        
        print("=" * 60)
        print("\n🎯 Once the table is created and keys are inserted, we can update the config to use Supabase!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = setup_api_keys()
    sys.exit(0 if success else 1)

