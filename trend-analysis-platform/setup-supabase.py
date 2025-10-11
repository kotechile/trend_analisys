#!/usr/bin/env python3
"""
Setup script to create Supabase project and configure database
"""

import os
import sys
import subprocess
import time

def run_command(cmd, check=True):
    """Run a command and return the result"""
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return e

def main():
    print("🚀 Setting up Supabase for TrendTap...")
    print("=" * 50)
    
    # Check if Supabase CLI is available
    print("1. Checking Supabase CLI...")
    result = run_command("npx supabase --version", check=False)
    if result.returncode != 0:
        print("❌ Supabase CLI not found. Installing...")
        run_command("npm install -g @supabase/supabase-js")
    
    print("✅ Supabase CLI ready")
    
    # Create a new Supabase project
    print("\n2. Creating Supabase project...")
    print("📝 You'll need to:")
    print("   1. Go to https://supabase.com/dashboard")
    print("   2. Click 'New Project'")
    print("   3. Choose your organization")
    print("   4. Enter project name: 'trendtap'")
    print("   5. Enter database password (save this!)")
    print("   6. Choose region closest to you")
    print("   7. Click 'Create new project'")
    print("   8. Wait for project to be ready (2-3 minutes)")
    
    # Get project details from user
    print("\n3. After creating the project, please provide:")
    project_url = input("   Project URL (e.g., https://xyz.supabase.co): ").strip()
    if not project_url:
        print("❌ Project URL is required")
        return
    
    # Extract project reference from URL
    project_ref = project_url.split('//')[1].split('.')[0]
    
    # Get API key
    print("\n4. Get your API key:")
    print("   - Go to Settings > API")
    print("   - Copy the 'anon' public key")
    api_key = input("   API Key: ").strip()
    if not api_key:
        print("❌ API key is required")
        return
    
    # Get database password
    db_password = input("   Database password: ").strip()
    if not db_password:
        print("❌ Database password is required")
        return
    
    # Create environment file
    print("\n5. Creating environment configuration...")
    env_content = f"""# Supabase Configuration
SUPABASE_URL={project_url}
SUPABASE_ANON_KEY={api_key}
SUPABASE_SERVICE_ROLE_KEY={api_key}  # Use service role key for admin operations

# Database Configuration
DATABASE_URL=postgresql://postgres:{db_password}@db.{project_ref}.supabase.co:5432/postgres

# LLM Configuration (add your API keys)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
GOOGLE_API_KEY=your-google-key-here

# Redis (for local development)
REDIS_URL=redis://localhost:6379
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Environment file created")
    
    # Test database connection
    print("\n6. Testing database connection...")
    try:
        from sqlalchemy import create_engine
        from sqlalchemy import text
        
        engine = create_engine(f"postgresql://postgres:{db_password}@db.{project_ref}.supabase.co:5432/postgres")
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please check your credentials and try again")
        return
    
    # Create database tables
    print("\n7. Creating database tables...")
    try:
        # Import our models
        sys.path.append('backend/src')
        from models.llm_config import Base
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return
    
    # Create sample data
    print("\n8. Creating sample LLM providers...")
    try:
        from models.llm_config import LLMProvider
        from sqlalchemy.orm import sessionmaker
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Create sample providers
        providers = [
            {
                'name': 'GPT-5 Mini',
                'provider_type': 'openai',
                'model_name': 'gpt-5-mini',
                'api_key_env_var': 'OPENAI_API_KEY',
                'max_tokens': 4000,
                'temperature': 0.7,
                'cost_per_1k_tokens': 0.00015,
                'is_active': True,
                'is_default': True,
                'priority': 100
            },
            {
                'name': 'Gemini 2.5 Flash Lite',
                'provider_type': 'google',
                'model_name': 'gemini-2.5-flash-lite',
                'api_key_env_var': 'GOOGLE_API_KEY',
                'max_tokens': 8000,
                'temperature': 0.7,
                'cost_per_1k_tokens': 0.0001,
                'is_active': True,
                'is_default': False,
                'priority': 90
            },
            {
                'name': 'Claude 3.5 Sonnet',
                'provider_type': 'anthropic',
                'model_name': 'claude-3-5-sonnet-20241022',
                'api_key_env_var': 'ANTHROPIC_API_KEY',
                'max_tokens': 4000,
                'temperature': 0.7,
                'cost_per_1k_tokens': 0.003,
                'is_active': True,
                'is_default': False,
                'priority': 80
            }
        ]
        
        for provider_data in providers:
            provider = LLMProvider(**provider_data)
            session.add(provider)
        
        session.commit()
        print("✅ Sample LLM providers created")
        
    except Exception as e:
        print(f"❌ Failed to create sample data: {e}")
        return
    
    print("\n" + "=" * 50)
    print("🎉 Supabase setup complete!")
    print("\nNext steps:")
    print("1. Add your API keys to the .env file")
    print("2. Update backend/src/core/database.py to use the new DATABASE_URL")
    print("3. Restart the backend: docker-compose restart backend")
    print("4. Test the admin LLM page: http://localhost:3000/admin/llm")
    print("\nYour Supabase project:")
    print(f"   URL: {project_url}")
    print(f"   Project Ref: {project_ref}")
    print(f"   Database: PostgreSQL with native UUID support")

if __name__ == "__main__":
    main()


