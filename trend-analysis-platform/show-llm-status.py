#!/usr/bin/env python3
"""
Show Current LLM Status
"""

import requests
import json

def main():
    print("🤖 Current LLM Provider Status")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:8000/api/admin/llm/providers", timeout=10)
        response.raise_for_status()
        providers = response.json()
        
        print(f"📊 Total Providers: {len(providers)}")
        print()
        
        for provider in providers:
            status_icon = "✅" if provider['is_default'] else "⚪"
            active_icon = "🟢" if provider['is_active'] else "🔴"
            
            print(f"{status_icon} {provider['name']}")
            print(f"   Type: {provider['provider_type']} | Model: {provider['model_name']}")
            print(f"   Status: {active_icon} {'Active' if provider['is_active'] else 'Inactive'}")
            print(f"   Default: {'Yes' if provider['is_default'] else 'No'}")
            print(f"   Priority: {provider['priority']}")
            print()
        
        # Show current default
        default_provider = next((p for p in providers if p['is_default']), None)
        if default_provider:
            print(f"🎯 ACTIVE LLM: {default_provider['name']}")
            print(f"   This is the LLM that will be used for topic analysis")
        else:
            print("⚠️  No default provider set!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()


