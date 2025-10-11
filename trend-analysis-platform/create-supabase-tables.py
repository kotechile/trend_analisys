#!/usr/bin/env python3
"""
Create database tables in Supabase
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def create_tables():
    """Create all database tables"""
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in .env file")
        print("Please run: python setup-supabase-credentials.py")
        return False
    
    print(f"🔗 Connecting to Supabase...")
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
        
        # Import models
        sys.path.append('backend/src')
        from backend.src.models.llm_config import Base, LLMProvider, LLMConfiguration, LLMUsageLog, LLMProviderTest
        
        # Create all tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully")
        
        # Create sample data
        print("🌱 Creating sample LLM providers...")
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Check if providers already exist
        existing_providers = session.query(LLMProvider).count()
        if existing_providers > 0:
            print(f"ℹ️  {existing_providers} providers already exist, skipping sample data")
        else:
            # Create sample providers
            providers = [
                LLMProvider(
                    name='GPT-5 Mini',
                    provider_type='openai',
                    model_name='gpt-5-mini',
                    api_key_env_var='OPENAI_API_KEY',
                    max_tokens=4000,
                    temperature=0.7,
                    cost_per_1k_tokens=0.00015,
                    is_active=True,
                    is_default=True,
                    priority=100
                ),
                LLMProvider(
                    name='Gemini 2.5 Flash Lite',
                    provider_type='google',
                    model_name='gemini-2.5-flash-lite',
                    api_key_env_var='GOOGLE_API_KEY',
                    max_tokens=8000,
                    temperature=0.7,
                    cost_per_1k_tokens=0.0001,
                    is_active=True,
                    is_default=False,
                    priority=90
                ),
                LLMProvider(
                    name='Claude 3.5 Sonnet',
                    provider_type='anthropic',
                    model_name='claude-3-5-sonnet-20241022',
                    api_key_env_var='ANTHROPIC_API_KEY',
                    max_tokens=4000,
                    temperature=0.7,
                    cost_per_1k_tokens=0.003,
                    is_active=True,
                    is_default=False,
                    priority=80
                ),
                LLMProvider(
                    name='Gemini 2.5 Flash',
                    provider_type='google',
                    model_name='gemini-2.5-flash',
                    api_key_env_var='GOOGLE_API_KEY',
                    max_tokens=8000,
                    temperature=0.7,
                    cost_per_1k_tokens=0.0002,
                    is_active=True,
                    is_default=False,
                    priority=85
                )
            ]
            
            for provider in providers:
                session.add(provider)
            
            session.commit()
            print(f"✅ Created {len(providers)} sample LLM providers")
        
        # Create default configuration
        existing_config = session.query(LLMConfiguration).count()
        if existing_config == 0:
            config = LLMConfiguration(
                enable_llm_analysis=True,
                enable_auto_fallback=True,
                enable_cost_tracking=True,
                max_retry_attempts=3
            )
            session.add(config)
            session.commit()
            print("✅ Created default LLM configuration")
        
        session.close()
        
        print("\n🎉 Database setup complete!")
        print("\nYour Supabase project now has:")
        print("  ✅ LLM providers table")
        print("  ✅ LLM configurations table") 
        print("  ✅ LLM usage logs table")
        print("  ✅ LLM provider tests table")
        print("  ✅ Sample LLM providers")
        print("  ✅ Default configuration")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        print("\nTroubleshooting:")
        print("1. Check your database password in .env")
        print("2. Verify the DATABASE_URL format")
        print("3. Ensure the Supabase project is fully initialized")
        return False

def main():
    print("🗄️  Creating Supabase Tables for TrendTap")
    print("=" * 50)
    
    success = create_tables()
    
    if success:
        print("\n🚀 Ready to go!")
        print("Next: Restart the backend and test the admin page")
    else:
        print("\n💡 Please check the error messages above")

if __name__ == "__main__":
    main()
