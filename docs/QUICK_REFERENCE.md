# Quick Reference Guide

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Using Docker
npm run docker:up
```

## 📋 Core Workflow

1. **Phase 0**: Affiliate Research → Find affiliate programs
2. **Phase 1**: Trend Analysis → Analyze market trends  
3. **Keyword Refinement**: Upload and select keywords
4. **Phase 2**: Content Generation → Create content ideas
5. **Dashboard**: Manage and track everything

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: FastAPI + Python
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication
- **Deployment**: Vercel (frontend) + Render/Fly.io (backend)

## 📁 Key Directories

```
frontend/src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API calls
└── types/         # TypeScript definitions

backend/app/
├── api/           # API endpoints
├── services/      # Business logic
├── models/        # Database models
└── core/          # Configuration
```

## 🔧 Development Commands

```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend  
cd frontend
npm run dev

# Testing
npm run test
npm run test:backend
npm run test:frontend

# Code Quality
npm run lint
npm run format
```

## 📊 Database Schema

- `users` - User accounts
- `affiliate_research` - Phase 0 results
- `trend_analysis` - Phase 1 results  
- `keyword_data` - Keyword refinement
- `content_ideas` - Phase 2 results

## 🔑 Environment Variables

```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SECRET_KEY=your_secret_key

# Optional
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 📚 Key Documentation

- [Baseline Specification](BASELINE_SPECIFICATION.md) - Complete requirements
- [Development Guide](DEVELOPMENT_GUIDE.md) - Setup and workflow
- [Project Constitution](CONSTITUTION.md) - Core principles
- [Legacy Reference](../legacy-reference/README.md) - Original code

## 🎯 Next Steps

1. Set up Supabase project
2. Configure environment variables
3. Start with Phase 0 (Affiliate Research)
4. Follow the specification for each phase
5. Test thoroughly before moving to next phase
