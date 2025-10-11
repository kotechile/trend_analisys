#!/usr/bin/env python3
"""
Change Active LLM Provider Script
Allows you to easily switch between different LLM providers
"""

import requests
import json
import sys
from typing import List, Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8000"
API_ENDPOINT = f"{BACKEND_URL}/api/admin/llm/providers"

def get_providers() -> List[Dict[str, Any]]:
    """Get all LLM providers from the backend"""
    try:
        response = requests.get(API_ENDPOINT, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching providers: {e}")
        return []

def display_providers(providers: List[Dict[str, Any]]):
    """Display available providers in a nice format"""
    print("\n🤖 Available LLM Providers:")
    print("=" * 60)
    
    for i, provider in enumerate(providers, 1):
        status_icon = "✅" if provider['is_default'] else "⚪"
        active_icon = "🟢" if provider['is_active'] else "🔴"
        
        print(f"{i}. {status_icon} {provider['name']}")
        print(f"   Type: {provider['provider_type']} | Model: {provider['model_name']}")
        print(f"   Status: {active_icon} {'Active' if provider['is_active'] else 'Inactive'}")
        print(f"   Priority: {provider['priority']} | Requests: {provider['total_requests']}")
        print(f"   Cost: ${provider['total_cost']:.4f}")
        print()

def change_default_provider(providers: List[Dict[str, Any]], new_default_name: str):
    """Change the default provider (simulated - would need API endpoint)"""
    print(f"\n🔄 Changing default provider to: {new_default_name}")
    
    # Find the provider
    target_provider = None
    for provider in providers:
        if provider['name'].lower() == new_default_name.lower():
            target_provider = provider
            break
    
    if not target_provider:
        print(f"❌ Provider '{new_default_name}' not found!")
        return False
    
    if target_provider['is_default']:
        print(f"✅ {new_default_name} is already the default provider!")
        return True
    
    print(f"⚠️  Note: This would require a database update or API endpoint.")
    print(f"   To change via SQL:")
    print(f"   UPDATE llm_providers SET is_default = false;")
    print(f"   UPDATE llm_providers SET is_default = true WHERE name = '{new_default_name}';")
    
    return True

def test_provider(provider_name: str):
    """Test a specific provider with a sample request"""
    print(f"\n🧪 Testing {provider_name}...")
    
    test_data = {
        "topic": "eco friendly homes",
        "provider_id": None  # Will use default
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/topic-analysis/analyze",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {provider_name} test successful!")
            print(f"   Analysis: {result.get('analysis', 'N/A')[:100]}...")
        else:
            print(f"❌ {provider_name} test failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ {provider_name} test error: {e}")

def main():
    """Main function"""
    print("🚀 TrendTap LLM Provider Manager")
    print("=" * 40)
    
    # Get providers
    providers = get_providers()
    if not providers:
        print("❌ No providers found. Make sure the backend is running.")
        sys.exit(1)
    
    # Display providers
    display_providers(providers)
    
    # Show current default
    default_provider = next((p for p in providers if p['is_default']), None)
    if default_provider:
        print(f"🎯 Current Default: {default_provider['name']}")
    else:
        print("⚠️  No default provider set!")
    
    # Interactive menu
    while True:
        print("\n📋 Options:")
        print("1. Change default provider")
        print("2. Test current default")
        print("3. Test specific provider")
        print("4. Show provider details")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            provider_name = input("Enter provider name: ").strip()
            change_default_provider(providers, provider_name)
            
        elif choice == "2":
            if default_provider:
                test_provider(default_provider['name'])
            else:
                print("❌ No default provider set!")
                
        elif choice == "3":
            provider_name = input("Enter provider name to test: ").strip()
            test_provider(provider_name)
            
        elif choice == "4":
            display_providers(providers)
            
        elif choice == "5":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()


