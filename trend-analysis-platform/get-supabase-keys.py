#!/usr/bin/env python3
"""
Get the correct Supabase API keys
"""

def main():
    print("🔑 Getting Supabase API Keys")
    print("=" * 40)
    
    print("To get your correct API keys:")
    print("1. Go to: https://supabase.com/dashboard/project/bvsqnmkvbbvtrcomtvnc")
    print("2. Click 'Settings' in the left sidebar")
    print("3. Click 'API' in the settings menu")
    print("4. Copy the following keys:")
    print()
    print("   📋 Project URL:")
    print("   https://bvsqnmkvbbvtrcomtvnc.supabase.co")
    print()
    print("   📋 anon public key:")
    print("   (Copy from 'Project API keys' section)")
    print()
    print("   📋 service_role key:")
    print("   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwNjIxNCwiZXhwIjoyMDc1MDgyMjE0fQ.T1Njr6eHmqCJQOAYlxaXE8N85z0MtUKGNuFB7pPoM-s")
    print()
    print("5. Update your .env file with the correct anon key")
    print("6. Replace 'your-password' with your database password")
    print()
    print("Then run:")
    print("  python test-supabase-connection.py")
    print("  python create-supabase-tables.py")

if __name__ == "__main__":
    main()


