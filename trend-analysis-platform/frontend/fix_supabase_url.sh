#!/bin/bash
# Fix Supabase URL in frontend .env file

cd "$(dirname "$0")"

echo "🔧 Fixing Supabase URL in frontend .env file..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Supabase Configuration (Self-hosted on Hostinger/Coolify)
VITE_SUPABASE_URL=https://sbcontent.aichieve.net
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NDYxMjY2MCwiZXhwIjo0OTIwMjg2MjYwLCJyb2xlIjoiYW5vbiJ9.4z_OjFo4hYnh1RpOVGWJYWGWW1dWfSUtKs5w06H9PYI

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=TrendTap
VITE_DEBUG=true
EOF
    echo "✅ Created .env file"
else
    # Update existing .env file
    if grep -q "sbdomain.aichieve.net" .env 2>/dev/null; then
        echo "Updating sbdomain.aichieve.net to sbcontent.aichieve.net..."
        sed -i '' 's|sbdomain\.aichieve\.net|sbcontent.aichieve.net|g' .env
        echo "✅ Updated .env file"
    else
        # Check if URL is set correctly
        if grep -q "VITE_SUPABASE_URL=https://sbcontent.aichieve.net" .env 2>/dev/null; then
            echo "✅ URL is already correct"
        else
            echo "⚠️ URL might not be set correctly. Please check .env file"
        fi
    fi
fi

echo ""
echo "Current VITE_SUPABASE_URL:"
grep VITE_SUPABASE_URL .env | head -1

echo ""
echo "🔄 Please restart the frontend service to apply changes:"
echo "   1. Stop the current frontend (Ctrl+C)"
echo "   2. Run: npm run dev"





