# Development Guide

This guide provides comprehensive instructions for setting up and developing the Trend Analysis Platform.

## Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+
- Docker and Docker Compose (optional)
- Git

## Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd trend-analysis-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

## Project Structure

```
trend-analysis-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── shared/                  # Shared code
├── docs/                   # Documentation
├── scripts/                # Development scripts
└── tests/                  # Integration tests
```

## Development Workflow

### Backend Development

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

4. **Run development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Run tests:**
   ```bash
   pytest
   ```

### Frontend Development

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm run test
   ```

## Code Quality

### Backend

- **Formatting:** `black .`
- **Import sorting:** `isort .`
- **Linting:** `flake8 .`
- **Type checking:** `mypy .`

### Frontend

- **Formatting:** `npm run format`
- **Linting:** `npm run lint`
- **Type checking:** `npm run type-check`

## Testing

### Backend Testing

```bash
cd backend
pytest                    # Run all tests
pytest --cov=app         # Run with coverage
pytest tests/test_api.py # Run specific test file
```

### Frontend Testing

```bash
cd frontend
npm run test             # Run all tests
npm run test:ci          # Run tests with coverage
```

### Integration Testing

```bash
npm run test:integration
```

## Docker Development

1. **Start all services:**
   ```bash
   npm run docker:up
   ```

2. **Stop services:**
   ```bash
   npm run docker:down
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Database Management

The project uses Supabase for database and authentication. Configure your Supabase project:

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys
3. Update your `.env` file with the credentials

## Legacy Code Reference

The `legacy-reference/python-code/` folder contains the original implementation that serves as a reference for the new architecture.

### How to Use Legacy Code

1. **Before implementing new features**, review the corresponding legacy files
2. **Understand the business logic** patterns from the original code
3. **Adapt the patterns** to the new FastAPI + React architecture
4. **Maintain data compatibility** where possible
5. **Do not copy code directly** - reimplement with modern patterns

### Key Reference Files

| Feature | Legacy File | Purpose |
|---------|-------------|---------|
| **Affiliate Research** | `affiliate_research_api.py` | API integration patterns |
| **Trend Analysis** | `enhanced_trend_research_with_bypass.py` | LLM integration and analysis |
| **Content Generation** | `blog_idea_generator.py` | Content idea generation logic |
| **Keyword Research** | `keyword_research_api.py` | Keyword processing patterns |
| **Database Integration** | `supabase_affiliate_storage.py` | Supabase integration examples |
| **Pytrends Integration** | `pytrends_enhanced_fixed.py` | Google Trends data handling |

### Guidelines for Using Legacy Code

- **Study the patterns**: Understand how the original code solved problems
- **Modernize the approach**: Use FastAPI patterns instead of Flask
- **Improve error handling**: Add proper exception handling and validation
- **Enhance security**: Implement proper authentication and authorization
- **Optimize performance**: Use async/await patterns where appropriate
- **Add testing**: Include comprehensive tests for all functionality

## Deployment

### Backend Deployment

1. **Build Docker image:**
   ```bash
   cd backend
   docker build -t trend-analysis-backend .
   ```

2. **Deploy to your platform:**
   - Render: Connect your GitHub repository
   - Fly.io: Use `fly deploy`
   - AWS/GCP: Use your preferred deployment method

### Frontend Deployment

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Backend: Change port in `uvicorn` command
   - Frontend: Change port in `vite.config.ts`

2. **Environment variables not loading:**
   - Ensure `.env` file is in the root directory
   - Check variable names match exactly

3. **Database connection issues:**
   - Verify Supabase credentials
   - Check network connectivity

### Getting Help

- Check the [Project Constitution](CONSTITUTION.md)
- Review existing issues on GitHub
- Create a new issue with detailed description

## Contributing

1. Follow the [Project Constitution](CONSTITUTION.md)
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request
