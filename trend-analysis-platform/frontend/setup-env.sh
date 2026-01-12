#!/bin/bash
# Setup .env file for frontend with Supabase configuration

cd "$(dirname "$0")"

echo "🔧 Setting up .env file for frontend..."

# Anon key from fix_supabase_url.sh (you may need to update this)
ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NDYxMjY2MCwiZXhwIjo0OTIwMjg2MjYwLCJyb2xlIjoiYW5vbiJ9.4z_OjFo4hYnh1RpOVGWJYWGWW1dWfSUtKs5w06H9PYI"

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Keeping existing .env file"
        exit 1
    fi
    echo "📝 Backing up existing .env to .env.backup"
    cp .env .env.backup
fi

# Create .env file
cat > .env << EOF
# Supabase Configuration (Self-hosted on Hostinger/Coolify)
VITE_SUPABASE_URL=https://sbcontent.aichieve.net
VITE_SUPABASE_ANON_KEY=${ANON_KEY}

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=content_generator
VITE_DEBUG=true
EOF

echo "✅ Created .env file"
echo ""
echo "📋 Current configuration:"
echo "   VITE_SUPABASE_URL: https://sbcontent.aichieve.net"
echo "   VITE_SUPABASE_ANON_KEY: ${ANON_KEY:0:50}..."
echo "   VITE_API_BASE_URL: http://localhost:8000"
echo ""
echo "🔄 Please restart your frontend dev server to apply changes:"
echo "   1. Stop the current frontend (Ctrl+C)"
echo "   2. Run: npm run dev"
echo ""
echo "⚠️  Note: If you still get 401 errors, the anon key might be incorrect."
echo "   You may need to get the correct key from your Supabase instance."

