#!/usr/bin/env python3
"""
Setup Supabase credentials for TrendTap
"""

import os

def create_env_file():
    """Create .env file with Supabase credentials"""
    
    print("🔧 Setting up Supabase credentials...")
    
    # Your Supabase project details
    project_id = "bvsqnmkvbbvtrcomtvnc"
    project_url = f"https://{project_id}.supabase.co"
    service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwNjIxNCwiZXhwIjoyMDc1MDgyMjE0fQ.T1Njr6eHmqCJQOAYlxaXE8N85z0MtUKGNuFB7pPoM-s"
    
    # Get database password from user
    print(f"\n📝 Your Supabase project: {project_url}")
    print("Please enter your database password (the one you set when creating the project):")
    db_password = input("Database password: ").strip()
    
    if not db_password:
        print("❌ Database password is required")
        return False
    
    # Create .env content
    env_content = f"""# Supabase Configuration
SUPABASE_URL={project_url}
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3FubWt2YmJ2dHJjb210dm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDYyMTQsImV4cCI6MjA3NTA4MjIxNH0.placeholder
SUPABASE_SERVICE_ROLE_KEY={service_role_key}

# Database Configuration
DATABASE_URL=postgresql://postgres:{db_password}@db.{project_id}.supabase.co:5432/postgres

# LLM Configuration (add your API keys)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
GOOGLE_API_KEY=your-google-key-here

# Redis (for local development)
REDIS_URL=redis://localhost:6379
"""
    
    # Write .env file
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def main():
    print("🚀 TrendTap Supabase Setup")
    print("=" * 40)
    
    success = create_env_file()
    
    if success:
        print("\n🎉 Setup complete!")
        print("\nNext steps:")
        print("1. Add your LLM API keys to the .env file")
        print("2. Test connection: python test-supabase-connection.py")
        print("3. Create tables: python create-supabase-tables.py")
        print("4. Restart backend: docker-compose restart backend")
        print("5. Test admin page: http://localhost:3000/admin/llm")
    else:
        print("\n❌ Setup failed. Please try again.")

if __name__ == "__main__":
    main()


