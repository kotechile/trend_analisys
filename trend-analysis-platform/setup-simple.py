#!/usr/bin/env python3
"""
Simple Setup Script (No Docker Required)
Sets up TrendTap with a simple SQLite database for testing
"""
import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with simple configuration"""
    print("📝 Creating environment configuration...")
    
    env_content = """# Database Configuration (SQLite for simple setup)
DATABASE_URL=sqlite:///./trendtap.db
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM Provider Configuration (REQUIRED - Choose at least one)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
KIMI2_API_KEY=your-kimi2-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
QWEN_API_KEY=your-qwen-api-key

# External API Keys (Optional - for full functionality)
GOOGLE_TRENDS_API_KEY=your-google-trends-api-key
DATAFORSEO_LOGIN=your-dataforseo-login
DATAFORSEO_PASSWORD=your-dataforseo-password
SURFERSEO_API_KEY=your-surfer-seo-api-key
FRASE_API_KEY=your-frase-api-key
COSCHEULE_API_KEY=your-coschedule-api-key

# Social Media API Keys (Optional)
REDDIT_API_KEY=your-reddit-api-key
TWITTER_API_KEY=your-twitter-api-key
TIKTOK_API_KEY=your-tiktok-api-key

# Affiliate Network API Keys (Optional)
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

# Export Platform API Keys (Optional)
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

# Redis Configuration (Optional - will use in-memory fallback if not available)
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

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    try:
        # Install backend dependencies (minimal version)
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'backend/requirements-minimal.txt'], check=True)
        print("✅ Backend dependencies installed")
        
        # Install development dependencies
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'backend/requirements-dev.txt'], check=True)
        print("✅ Development dependencies installed")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def run_database_migrations():
    """Run database migrations"""
    print("🔄 Running database migrations...")
    
    try:
        # Change to backend directory
        os.chdir('backend')
        
        # Run Alembic migrations
        subprocess.run(['alembic', 'upgrade', 'head'], check=True)
        print("✅ Database migrations completed")
        
        # Change back to root directory
        os.chdir('..')
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to run migrations: {e}")
        # Change back to root directory
        os.chdir('..')
        return False

def create_admin_user():
    """Create default admin user"""
    print("👤 Creating admin user...")
    
    try:
        # Change to backend directory
        os.chdir('backend')
        
        # Import and run user creation
        sys.path.insert(0, str(Path('src')))
        from core.database_init import create_default_user
        
        create_default_user()
        print("✅ Admin user created")
        
        # Change back to root directory
        os.chdir('..')
        return True
    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")
        # Change back to root directory
        os.chdir('..')
        return False

def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    
    try:
        # Change to backend directory
        os.chdir('backend')
        
        sys.path.insert(0, str(Path('src')))
        from core.database import check_db_connection
        
        if check_db_connection():
            print("✅ Database connection successful")
            # Change back to root directory
            os.chdir('..')
            return True
        else:
            print("❌ Database connection failed")
            # Change back to root directory
            os.chdir('..')
            return False
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        # Change back to root directory
        os.chdir('..')
        return False

def start_development_server():
    """Start the development server"""
    print("🚀 Starting development server...")
    
    try:
        # Change to backend directory
        os.chdir('backend')
        
        # Start FastAPI server
        subprocess.run([
            sys.executable, '-m', 'uvicorn', 
            'src.main:app', 
            '--reload', 
            '--host', '0.0.0.0', 
            '--port', '8000'
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        return False
    finally:
        # Change back to root directory
        os.chdir('..')

def main():
    """Main setup function"""
    print("🚀 Setting up TrendTap (Simple Mode)")
    print("=" * 50)
    print("📝 This setup uses SQLite instead of PostgreSQL")
    print("📝 Redis features will use in-memory fallback")
    print("=" * 50)
    
    # Load environment variables
    if not create_env_file():
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Test database connection
    if not test_database_connection():
        print("❌ Database connection failed. Please check your setup.")
        return False
    
    # Run migrations
    if not run_database_migrations():
        return False
    
    # Create admin user
    if not create_admin_user():
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Backend setup complete!")
    print("=" * 50)
    print("✅ Dependencies installed")
    print("✅ Database connected and migrated")
    print("✅ Admin user created")
    print("\n🚀 Starting development server...")
    print("📱 Backend will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("🛑 Press Ctrl+C to stop the server")
    print("\n📝 Next steps:")
    print("1. Update API keys in .env file")
    print("2. In another terminal, run: cd frontend && npm install && npm run dev")
    print("3. Test the solution: python test-solution.py")
    
    # Start server
    start_development_server()
    
    return True

if __name__ == "__main__":
    import subprocess
    success = main()
    sys.exit(0 if success else 1)
