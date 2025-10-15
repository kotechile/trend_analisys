# 🚀 Idea Burst Quick Start Guide

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional, for containerized deployment) - [Download here](https://docker.com/)

## 🏃‍♂️ Quick Start (5 minutes)

### 1. Clone and Setup Database

```bash
# Navigate to the project directory
cd trend-analysis-platform

# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Setup database and environment
python setup-database.py
```

This will:
- ✅ Install Supabase CLI
- ✅ Create a local Supabase project
- ✅ Generate `.env` file with all required environment variables
- ✅ Start local PostgreSQL and Redis

### 2. Configure API Keys

Edit the `.env` file and add your API keys:

```bash
# Required: Choose at least one LLM provider
OPENAI_API_KEY=your-openai-api-key-here
# OR
ANTHROPIC_API_KEY=your-anthropic-api-key-here
# OR  
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Optional: External services (for full functionality)
GOOGLE_TRENDS_API_KEY=your-google-trends-key
DATAFORSEO_LOGIN=your-dataforseo-login
DATAFORSEO_PASSWORD=your-dataforseo-password
```

### 3. Start Backend

```bash
cd backend
python setup-env.py
```

This will:
- ✅ Install Python dependencies
- ✅ Run database migrations
- ✅ Create admin user (email: admin@trendtap.com, password: admin123)
- ✅ Start backend server at http://localhost:8000

### 4. Start Frontend

```bash
cd frontend
node setup-frontend.js
```

This will:
- ✅ Install Node.js dependencies
- ✅ Create frontend environment configuration
- ✅ Start frontend server at http://localhost:5173

## 🎯 Test the Application

### 1. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 2. Login

Use the default admin credentials:
- **Email**: admin@trendtap.com
- **Password**: admin123

### 3. Test Core Features

1. **Affiliate Research**: Search for affiliate programs
2. **Trend Analysis**: Analyze keyword trends
3. **Keyword Management**: Upload CSV files with keywords
4. **Content Generation**: Generate content ideas
5. **Software Ideas**: Generate software solution ideas
6. **Calendar**: Manage content calendar

## 🔧 Configuration Options

### LLM Provider Selection

The system supports multiple LLM providers. Set your preferred provider in `.env`:

```bash
# Set default LLM provider
DEFAULT_LLM_PROVIDER=openai  # or anthropic, google_ai

# Configure specific provider settings
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

### Database Configuration

The system uses Supabase (PostgreSQL) by default. You can also use:

```bash
# Custom PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/trendtap

# Custom Redis
REDIS_URL=redis://localhost:6379/0
```

### Feature Flags

Control features via environment variables:

```bash
# Enable/disable features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_TOOLS=true
VITE_ENABLE_MOCK_DATA=false
```

## 🐳 Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### 2. Access Services

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📊 Monitoring and Health Checks

### Backend Health

```bash
# Check backend health
curl http://localhost:8000/health

# Detailed health check
curl http://localhost:8000/health/detailed
```

### Database Status

```bash
# Check database connection
curl http://localhost:8000/health/database

# Check Redis connection
curl http://localhost:8000/health/redis
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Restart Supabase
   supabase stop
   supabase start
   ```

2. **Port Already in Use**
   ```bash
   # Kill processes on ports
   lsof -ti:8000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

3. **API Keys Not Working**
   - Check `.env` file has correct API keys
   - Verify API keys are valid and have sufficient credits
   - Check API key permissions

4. **Frontend Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs
npm run dev 2>&1 | tee frontend.log
```

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
DEBUG=false
LOG_LEVEL=WARNING
CORS_ORIGINS=https://yourdomain.com
SECRET_KEY=your-super-secure-secret-key
```

### 2. Database Migration

```bash
# Run production migrations
alembic upgrade head
```

### 3. Build for Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
pip install -r requirements.txt
```

## 📚 API Documentation

### Authentication

All API endpoints (except health checks) require authentication:

```bash
# Get access token
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@trendtap.com", "password": "admin123"}'

# Use token in requests
curl -X GET http://localhost:8000/api/v1/affiliate/search \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Key Endpoints

- `POST /api/v1/affiliate/search` - Search affiliate programs
- `POST /api/v1/trends/analyze` - Analyze keyword trends
- `POST /api/v1/keywords/upload` - Upload keyword CSV
- `POST /api/v1/content/generate` - Generate content ideas
- `POST /api/v1/software/generate` - Generate software ideas
- `GET /api/v1/calendar/entries` - Get calendar entries

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify API keys are correct and valid

## 🎉 Success!

You should now have Idea Burst running locally with:
- ✅ User authentication system
- ✅ Affiliate research capabilities
- ✅ Trend analysis tools
- ✅ Keyword management
- ✅ Content generation
- ✅ Software idea generation
- ✅ Content calendar
- ✅ Full API documentation

Happy trend hunting! 🚀
