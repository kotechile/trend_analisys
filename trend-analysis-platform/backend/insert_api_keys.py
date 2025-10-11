#!/usr/bin/env python3
"""
Insert API keys into Supabase api_keys table
"""

import os
import sys
from supabase import create_client, Client

def insert_api_keys():
    """Insert API keys into Supabase"""
    
    # Get Supabase credentials
    supabase_url = "https://bvsqnmkvbbvtrcomtvnc.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwNjIxNCwiZXhwIjoyMDc1MDgyMjE0fQ.T1Njr6eHmqCJQOAYlxaXE8N85z0MtUKGNuFB7pPoM-s"
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Read keys from .env file
        env_file = ".env"
        keys = {}
        
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if '=' in line and not line.startswith('#'):
                        key, value = line.split('=', 1)
                        keys[key] = value
        
        # Define the keys we want to migrate
        key_mappings = [
            {
                'env_key': 'OPENAI_API_KEY',
                'key_name': 'openai_api_key',
                'provider': 'openai',
                'description': 'OpenAI API key for GPT models'
            },
            {
                'env_key': 'LINKUP_API_KEY', 
                'key_name': 'linkup_api_key',
                'provider': 'linkup',
                'description': 'LinkUp.so API key for affiliate offers'
            },
            {
                'env_key': 'ANTHROPIC_API_KEY',
                'key_name': 'anthropic_api_key',
                'provider': 'anthropic',
                'description': 'Anthropic API key for Claude models'
            },
            {
                'env_key': 'GOOGLE_AI_API_KEY',
                'key_name': 'google_ai_api_key',
                'provider': 'google',
                'description': 'Google AI API key for Gemini models'
            },
            {
                'env_key': 'DEEPSEEK_API_KEY',
                'key_name': 'deepseek_api_key',
                'provider': 'deepseek',
                'description': 'DeepSeek API key for DeepSeek models'
            }
        ]
        
        # Insert each key
        for mapping in key_mappings:
            env_key = mapping['env_key']
            key_name = mapping['key_name']
            provider = mapping['provider']
            description = mapping['description']
            
            if env_key in keys and keys[env_key]:
                key_data = {
                    'key_name': key_name,
                    'key_value': keys[env_key],
                    'provider': provider,
                    'description': description,
                    'is_active': True,
                    'environment': 'production'
                }
                
                try:
                    # Try to insert, or update if exists
                    result = supabase.table('api_keys').upsert(key_data, on_conflict='key_name').execute()
                    print(f"✅ Upserted {key_name}")
                except Exception as e:
                    print(f"❌ Error upserting {key_name}: {e}")
            else:
                print(f"⚠️  Skipping {key_name} (no value in .env)")
        
        print("\n🎉 API keys migration complete!")
        print("You can now remove sensitive keys from .env files")
        
        return True
        
    except Exception as e:
        print(f"❌ Error inserting API keys: {e}")
        return False

if __name__ == "__main__":
    success = insert_api_keys()
    sys.exit(0 if success else 1)

