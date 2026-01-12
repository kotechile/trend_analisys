
import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.supabase_singleton import get_supabase_client
from src.core.config import get_settings

async def check_config():
    print("Locked & Loaded: Checking LLM Configuration...")
    try:
        supabase = get_supabase_client()
        print("✅ Supabase client initialized")
        
        # Check providers
        print("\n🔍 Checking llm_providers table...")
        response = supabase.table('llm_providers').select('*').eq('is_active', True).execute()
        if not response.data:
            print("❌ No active LLM provider found!")
        else:
            for p in response.data:
                model_name = p.get('model_name') or p.get('name')
                # User correction: field is api_keys_id
                api_key_id = p.get('api_keys_id') or p.get('api_key_id') 
                print(f"Active Provider Config: (Model: {model_name}, ApiKeyID: {api_key_id})")
                
                # Infer provider for CLIENT selection (not key lookup)
                provider_type = 'openai' # Default
                if model_name:
                    model_lower = model_name.lower()
                    if 'gpt' in model_lower:
                        provider_type = 'openai'
                    elif 'deepseek' in model_lower:
                        provider_type = 'deepseek'
                    elif 'gemini' in model_lower or 'google' in model_lower:
                        provider_type = 'gemini'
                    elif 'claude' in model_lower:
                        provider_type = 'anthropic'
                    elif 'kimi' in model_lower or 'moonshoot' in model_lower:
                        provider_type = 'moonshoot'
                        
                print(f"   ↳ 🔮 Inferred Client: {provider_type}")
                
                # Check API key using ID
                api_key_found = False
                if api_key_id:
                    print(f"\n🔍 Checking api_keys table for ID: {api_key_id}...")
                    try:
                        key_res = supabase.table('api_keys').select('id, key_value, is_active').eq('id', api_key_id).execute()
                        if key_res.data:
                             print(f"✅ Found Linked API Key via ID")
                             api_key_found = True
                        else:
                             print(f"❌ API Key ID {api_key_id} not found in api_keys table")
                    except Exception as e:
                        print(f"   ⚠️ Error checking ID: {e}")
                else:
                    print(f"❌ Active provider has no api_key_id set")
                
                # Fallback if ID lookup failed
                if not api_key_found:
                    print(f"⚠️ Falling back to provider-based key lookup for: {provider_type}")
                    print(f"\n🔍 Checking api_keys for provider: {provider_type}...")
                    key_res = supabase.table('api_keys').select('id, provider, is_active').eq('provider', provider_type).eq('is_active', True).execute()
                    if key_res.data:
                        print(f"✅ Active API key found for {provider_type} (Fallback)")
                    else:
                         print(f"❌ No active API key found for {provider_type}")
        
        print("\n🔍 Dumping all API Keys (provider names only)...")
        keys = supabase.table('api_keys').select('*').execute()
        for k in keys.data:
            print(f"🔑 Key ID: {k.get('id')}, Provider: {k.get('provider')}, Active: {k.get('is_active')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_config())
