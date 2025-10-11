#!/usr/bin/env python3
"""
Database Setup Script
Creates Supabase project and configures database
"""
import os
import sys
import subprocess
import json
from pathlib import Path

def check_supabase_cli():
    """Check if Supabase CLI is installed"""
    # Check for local supabase-cli first
    try:
        result = subprocess.run(['./supabase-cli', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Supabase CLI found: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    # Check for system-wide supabase
    try:
        result = subprocess.run(['supabase', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Supabase CLI found: {result.stdout.strip()}")
            return True
        else:
            print("❌ Supabase CLI not found")
            return False
    except FileNotFoundError:
        print("❌ Supabase CLI not installed")
        return False

def install_supabase_cli():
    """Install Supabase CLI"""
    print("📦 Installing Supabase CLI...")
    
    # Check if we're on macOS
    if sys.platform == "darwin":
        try:
            # Download and install Supabase CLI directly
            subprocess.run([
                'curl', '-L', 
                'https://github.com/supabase/cli/releases/download/v2.48.3/supabase_darwin_arm64.tar.gz',
                '|', 'tar', '-xz'
            ], shell=True, check=True)
            subprocess.run(['mv', 'supabase', './supabase-cli'], check=True)
            subprocess.run(['chmod', '+x', './supabase-cli'], check=True)
            print("✅ Supabase CLI installed locally")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install Supabase CLI")
            return False
    else:
        print("❌ Please install Supabase CLI manually: https://supabase.com/docs/guides/cli")
        return False

def create_supabase_project():
    """Create a new Supabase project"""
    print("🚀 Creating Supabase project...")
    
    # Determine which supabase command to use
    supabase_cmd = './supabase-cli' if os.path.exists('./supabase-cli') else 'supabase'
    
    # Initialize Supabase in the project
    try:
        subprocess.run([supabase_cmd, 'init'], check=True, cwd='.')
        print("✅ Supabase initialized")
    except subprocess.CalledProcessError:
        print("❌ Failed to initialize Supabase")
        return False
    
    # Start local Supabase
    try:
        print("🔄 Starting local Supabase...")
        subprocess.run([supabase_cmd, 'start'], check=True, cwd='.')
        print("✅ Local Supabase started")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to start local Supabase")
        return False

def get_database_url():
    """Get database URL from Supabase"""
    try:
        # Determine which supabase command to use
        supabase_cmd = './supabase-cli' if os.path.exists('./supabase-cli') else 'supabase'
        
        result = subprocess.run([supabase_cmd, 'status'], capture_output=True, text=True, cwd='.')
        if result.returncode == 0:
            # Parse the output to get database URL
            lines = result.stdout.split('\n')
            for line in lines:
                if 'DB URL' in line:
                    db_url = line.split('DB URL:')[1].strip()
                    return db_url
        return None
    except Exception as e:
        print(f"❌ Error getting database URL: {e}")
        return None

def create_env_file():
    """Create .env file with database configuration"""
    print("📝 Creating environment configuration...")
    
    db_url = get_database_url()
    if not db_url:
        print("❌ Could not get database URL")
        return False
    
    env_content = f"""# Database Configuration
DATABASE_URL={db_url}
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM Provider Configuration
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# External API Keys
GOOGLE_TRENDS_API_KEY=your-google-trends-api-key
DATAFORSEO_LOGIN=your-dataforseo-login
DATAFORSEO_PASSWORD=your-dataforseo-password
SURFERSEO_API_KEY=your-surfer-seo-api-key
FRASE_API_KEY=your-frase-api-key
COSCHEULE_API_KEY=your-coschedule-api-key

# Social Media API Keys
REDDIT_API_KEY=your-reddit-api-key
TWITTER_API_KEY=your-twitter-api-key
TIKTOK_API_KEY=your-tiktok-api-key

# Affiliate Network API Keys
SHAREASALE_API_KEY=your-shareasale-api-key
IMPACT_API_KEY=your-impact-api-key
AMAZON_ASSOCIATES_API_KEY=your-amazon-associates-api-key
CJ_AFFILIATE_API_KEY=your-cj-affiliate-api-key
PARTNERIZE_API_KEY=your-partnerize-api-key
RAKUTEN_ADVERTISING_API_KEY=your-rakuten-advertising-api-key
AWIN_API_KEY=your-awin-api-key
FLEXOFFERS_API_KEY=your-flexoffers-api-key
CLICKBANK_API_KEY=your-clickbank-api-key
DIGISTORE24_API_KEY=your-digistore24-api-key
EVERFLOW_API_KEY=your-everflow-api-key
ADMITAD_API_KEY=your-admitad-api-key
TRADETRACKER_API_KEY=your-tradetracker-api-key
WEBGAINS_API_KEY=your-webgains-api-key

# Export Platform API Keys
GOOGLE_DOCS_API_KEY=your-google-docs-api-key
NOTION_API_KEY=your-notion-api-key
WORDPRESS_API_KEY=your-wordpress-api-key

# Application Configuration
DEBUG=true
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Database Pool Configuration
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30
DB_POOL_RECYCLE=3600
DB_POOL_TIMEOUT=30

# Redis Configuration
REDIS_MAX_CONNECTIONS=20
REDIS_DB=0

# Security Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
"""
    
    # Create .env file
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created")
    print("⚠️  Please update the API keys in .env file with your actual keys")
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up TrendTap Database")
    print("=" * 50)
    
    # Check if Supabase CLI is installed
    if not check_supabase_cli():
        print("📦 Installing Supabase CLI...")
        if not install_supabase_cli():
            print("❌ Please install Supabase CLI manually and run this script again")
            return False
    
    # Create Supabase project
    if not create_supabase_project():
        print("❌ Failed to create Supabase project")
        return False
    
    # Create environment file
    if not create_env_file():
        print("❌ Failed to create environment file")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Database setup complete!")
    print("=" * 50)
    print("✅ Supabase project created and running locally")
    print("✅ Database URL configured")
    print("✅ Environment variables created")
    print("\n📝 Next steps:")
    print("1. Update API keys in .env file")
    print("2. Run: python backend/setup-env.py")
    print("3. Run: cd frontend && npm install")
    print("4. Run: npm run dev")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
