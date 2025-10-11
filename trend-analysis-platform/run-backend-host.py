#!/usr/bin/env python3
"""
Run TrendTap backend directly on host with Supabase database
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🚀 Starting TrendTap Backend on Host")
    print("=" * 50)
    
    # Set working directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    # Set environment variables
    env = os.environ.copy()
    env.update({
        "DATABASE_URL": "postgresql://postgres:hobnE8-pumqet-sywxab@db.bvsqnmkvbbvtrcomtvnc.supabase.co:5432/postgres",
        "REDIS_URL": "redis://localhost:6379/0",
        "JWT_SECRET_KEY": "your-super-secret-jwt-key-change-this-in-production",
        "JWT_ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
        "DEBUG": "true",
        "LOG_LEVEL": "INFO",
        "CORS_ORIGINS": "http://localhost:3000,http://localhost:5173"
    })
    
    print("📋 Environment configured:")
    print(f"   DATABASE_URL: {env['DATABASE_URL'][:50]}...")
    print(f"   REDIS_URL: {env['REDIS_URL']}")
    print(f"   DEBUG: {env['DEBUG']}")
    print()
    
    # Install dependencies if needed
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, env=env)
        print("✅ Dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return 1
    
    # Run database migrations
    print("🗄️  Running database migrations...")
    try:
        subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], 
                      check=True, env=env)
        print("✅ Database migrations completed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to run migrations: {e}")
        return 1
    
    # Start the backend server
    print("🌐 Starting backend server...")
    print("   Backend will be available at: http://localhost:8000")
    print("   API docs will be available at: http://localhost:8000/docs")
    print("   Press Ctrl+C to stop")
    print()
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "src.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], env=env)
    except KeyboardInterrupt:
        print("\n👋 Backend stopped")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"❌ Backend failed to start: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())


