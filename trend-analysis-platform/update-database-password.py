#!/usr/bin/env python3
"""
Update database password in .env file
"""

import os
import re

def update_password():
    """Update the database password in .env file"""
    
    print("🔐 Updating Database Password")
    print("=" * 40)
    
    # Check if .env exists
    if not os.path.exists('.env'):
        print("❌ .env file not found")
        return False
    
    # Read current .env
    with open('.env', 'r') as f:
        content = f.read()
    
    # Check if password needs to be updated
    if 'your-password' not in content:
        print("✅ Database password already configured")
        return True
    
    print("Please enter your Supabase database password:")
    print("(The password you set when creating the project)")
    password = input("Password: ").strip()
    
    if not password:
        print("❌ Password is required")
        return False
    
    # Update the password
    updated_content = content.replace('your-password', password)
    
    # Write back to .env
    with open('.env', 'w') as f:
        f.write(updated_content)
    
    print("✅ Database password updated successfully")
    return True

def main():
    success = update_password()
    
    if success:
        print("\n🧪 Testing connection...")
        os.system("python test-supabase-connection.py")
    else:
        print("\n❌ Failed to update password")

if __name__ == "__main__":
    main()


