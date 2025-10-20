# DataForSEO Integration Guide

## Overview

This guide provides comprehensive documentation for the DataForSEO integration in the Trend Analysis Platform. The integration enhances trend analysis and keyword research capabilities by leveraging DataForSEO's Trends and Labs APIs.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Setup and Configuration](#setup-and-configuration)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Database Schema](#database-schema)
7. [Caching Strategy](#caching-strategy)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

## Features

### Trend Analysis Enhancement
- **Rich Graphical Dashboards**: Interactive trend visualization with Recharts
- **Regional Analysis**: Location-based trend data with demographic insights
- **Subtopic Comparison**: Side-by-side comparison of multiple subtopics
- **Trending Suggestions**: AI-powered subtopic recommendations
- **Real-time Updates**: Live trend data with automatic refresh

### Keyword Research Enhancement
- **Commercial Intent Prioritization**: Intelligent keyword ranking based on commercial value
- **Advanced Filtering**: Multi-criteria keyword filtering and sorting
- **Trend Integration**: Keyword difficulty combined with trend data
- **Bulk Operations**: Efficient processing of large keyword sets
- **Export Capabilities**: Data export in multiple formats

## Architecture

### Backend Components

```
backend/src/dataforseo/
├── api_client.py          # DataForSEO API client
├── trend_service.py       # Trend analysis service
├── keyword_service.py     # Keyword research service
├── cache_service.py       # Redis caching service
├── error_service.py       # Error handling service
├── database.py            # Database integration
├── cache_integration.py   # Cache integration
├── api_integration.py     # API integration
├── database_utils.py      # Database utilities
└── performance_optimizer.py # Performance optimization
```

### Frontend Components

```
frontend/src/
├── pages/
│   ├── TrendAnalysisDataForSEO.tsx    # Enhanced trend analysis page
│   └── IdeaBurstDataForSEO.tsx        # Enhanced keyword research page
├── components/
│   ├── TrendAnalysis/
│   │   ├── TrendChart.tsx             # Trend visualization component
│   │   └── SubtopicComparison.tsx     # Subtopic comparison component
│   └── KeywordResearch/
│       ├── KeywordTable.tsx           # Keyword data table
│       └── KeywordFilters.tsx         # Advanced filtering component
├── hooks/
│   ├── useTrendAnalysis.ts            # Trend analysis hook
│   └── useKeywordResearch.ts          # Keyword research hook
├── services/dataforseo/
│   ├── trendAnalysisAPI.ts            # Trend analysis API client
│   └── keywordResearchAPI.ts          # Keyword research API client
└── types/dataforseo.ts                # TypeScript type definitions
```

## Setup and Configuration

### Prerequisites

1. **DataForSEO API Account**: Sign up at [DataForSEO](https://dataforseo.com/)
2. **Redis Server**: For caching (optional but recommended)
3. **PostgreSQL Database**: For data persistence
4. **Node.js 18+**: For frontend development
5. **Python 3.13+**: For backend development

### Environment Variables

```bash
# DataForSEO API Configuration
DATAFORSEO_API_URL=https://api.dataforseo.com/v3
DATAFORSEO_API_KEY=your_api_key_here

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/trend_analysis

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Cache TTL Settings
CACHE_TTL_TREND_DATA=86400      # 24 hours
CACHE_TTL_KEYWORD_DATA=21600    # 6 hours
CACHE_TTL_SUGGESTIONS=3600      # 1 hour

# Performance Settings
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30
RATE_LIMIT_REQUESTS_PER_MINUTE=100
```

### Database Setup

1. **Run Migrations**:
   ```bash
   cd backend
   python -m src.dataforseo.database_utils run_migration migrations/001_create_dataforseo_tables.sql
   python -m src.dataforseo.database_utils run_migration migrations/002_create_dataforseo_indexes.sql
   python -m src.dataforseo.database_utils run_migration migrations/003_create_dataforseo_constraints.sql
   ```

2. **Insert API Credentials**:
   ```sql
   INSERT INTO api_keys (base_url, key_value, provider, is_active)
   VALUES ('https://api.dataforseo.com/v3', 'your_api_key', 'dataforseo', true);
   ```

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Trend Analysis Endpoints

#### GET /api/v1/trend-analysis/dataforseo
Get trend data for specified subtopics.

**Parameters**:
- `subtopics` (string): Comma-separated list of subtopics
- `location` (string): Geographic location (e.g., "United States")
- `time_range` (string): Time range (1m, 3m, 6m, 12m, 24m)

**Response**:
```json
{
  "data": [
    {
      "subtopic": "weight loss",
      "location": "United States",
      "time_range": "12m",
      "average_interest": 65.5,
      "peak_interest": 85.2,
      "timeline_data": [
        {"date": "2024-01-01", "value": 60},
        {"date": "2024-01-02", "value": 65}
      ],
      "related_queries": ["keto diet", "intermittent fasting"],
      "demographic_data": {
        "age_groups": [
          {"age_range": "25-34", "percentage": 35}
        ],
        "gender_distribution": [
          {"gender": "Female", "percentage": 60}
        ],
        "interests": ["health", "fitness"]
      }
    }
  ],
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST /api/v1/trend-analysis/dataforseo/compare
Compare trends between multiple subtopics.

**Request Body**:
```json
{
  "subtopics": ["weight loss", "keto diet"],
  "location": "United States",
  "time_range": "12m"
}
```

#### POST /api/v1/trend-analysis/dataforseo/suggestions
Get trending subtopic suggestions.

**Request Body**:
```json
{
  "base_subtopics": ["weight loss"],
  "max_suggestions": 10,
  "location": "United States"
}
```

### Keyword Research Endpoints

#### POST /api/v1/keyword-research/dataforseo
Get keyword research data.

**Request Body**:
```json
{
  "seed_keywords": ["weight loss", "diet"],
  "max_difficulty": 70,
  "min_volume": 100,
  "intent_types": ["COMMERCIAL", "TRANSACTIONAL"],
  "max_results": 100
}
```

#### POST /api/v1/keyword-research/dataforseo/prioritize
Prioritize keywords based on commercial intent.

**Request Body**:
```json
{
  "keywords": [
    {
      "keyword": "weight loss program",
      "search_volume": 5000,
      "keyword_difficulty": 45,
      "cpc": 2.5,
      "competition_value": 60,
      "trend_percentage": 15.0,
      "intent_type": "COMMERCIAL"
    }
  ],
  "priority_factors": {
    "cpcWeight": 0.3,
    "volumeWeight": 0.4,
    "trendWeight": 0.3
  }
}
```

## Frontend Components

### TrendAnalysisDataForSEO

The main trend analysis page with enhanced DataForSEO integration.

**Key Features**:
- Interactive subtopic selection
- Real-time trend visualization
- Regional analysis controls
- Subtopic comparison dialog
- Trending suggestions panel

**Usage**:
```tsx
import TrendAnalysisDataForSEO from './pages/TrendAnalysisDataForSEO';

<TrendAnalysisDataForSEO />
```

### IdeaBurstDataForSEO

The enhanced keyword research page with commercial intent prioritization.

**Key Features**:
- Seed keyword input
- Advanced filtering options
- Keyword prioritization
- Export capabilities
- Performance metrics

**Usage**:
```tsx
import IdeaBurstDataForSEO from './pages/IdeaBurstDataForSEO';

<IdeaBurstDataForSEO />
```

### Custom Hooks

#### useTrendAnalysis

Hook for trend analysis functionality.

```tsx
import { useTrendAnalysis } from './hooks/useTrendAnalysis';

const {
  trendData,
  suggestions,
  loading,
  error,
  fetchTrendData,
  fetchSuggestions,
  compareTrends,
  clearError
} = useTrendAnalysis();
```

#### useKeywordResearch

Hook for keyword research functionality.

```tsx
import { useKeywordResearch } from './hooks/useKeywordResearch';

const {
  keywords,
  prioritizedKeywords,
  loading,
  error,
  fetchKeywords,
  prioritizeKeywords,
  clearError
} = useKeywordResearch();
```

## Database Schema

### Tables

#### trend_analysis_data
Stores trend analysis data from DataForSEO Trends API.

```sql
CREATE TABLE trend_analysis_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subtopic VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    time_range VARCHAR(20) NOT NULL,
    average_interest DECIMAL(10,2) NOT NULL DEFAULT 0,
    peak_interest DECIMAL(10,2) NOT NULL DEFAULT 0,
    timeline_data JSONB NOT NULL DEFAULT '[]',
    related_queries JSONB NOT NULL DEFAULT '[]',
    demographic_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### keyword_research_data
Stores keyword research data from DataForSEO Labs API.

```sql
CREATE TABLE keyword_research_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword VARCHAR(500) NOT NULL UNIQUE,
    search_volume INTEGER NOT NULL DEFAULT 0,
    keyword_difficulty INTEGER NOT NULL DEFAULT 0,
    cpc DECIMAL(10,2) NOT NULL DEFAULT 0,
    competition_value INTEGER NOT NULL DEFAULT 0,
    trend_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    intent_type VARCHAR(20) NOT NULL DEFAULT 'INFORMATIONAL',
    priority_score DECIMAL(5,2),
    related_keywords JSONB NOT NULL DEFAULT '[]',
    search_volume_trend JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### subtopic_suggestions
Stores trending subtopic suggestions and recommendations.

```sql
CREATE TABLE subtopic_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(255) NOT NULL UNIQUE,
    trending_status VARCHAR(20) NOT NULL DEFAULT 'STABLE',
    growth_potential DECIMAL(5,2) NOT NULL DEFAULT 0,
    search_volume INTEGER NOT NULL DEFAULT 0,
    related_queries JSONB NOT NULL DEFAULT '[]',
    competition_level VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    commercial_intent DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Views

#### trending_subtopics
View of trending subtopics with growth rates.

#### high_value_keywords
View of high-value keywords with priority scores.

#### api_performance_metrics
View of API performance metrics by endpoint and hour.

## Caching Strategy

### Cache TTL Settings

- **Trend Data**: 24 hours (86400 seconds)
- **Keyword Data**: 6 hours (21600 seconds)
- **Suggestions**: 1 hour (3600 seconds)
- **API Errors**: 5 minutes (300 seconds)
- **Computed Data**: 30 minutes (1800 seconds)

### Cache Keys

Cache keys follow the pattern: `dataforseo:{prefix}:{hash}`

Examples:
- `dataforseo:trend_data:abc123`
- `dataforseo:keyword_data:def456`
- `dataforseo:suggestions:ghi789`

### Cache Invalidation

- **Automatic**: Based on TTL
- **Manual**: Via API endpoints
- **Pattern-based**: Bulk invalidation by pattern

## Error Handling

### Error Types

1. **API Errors**: DataForSEO API failures
2. **Cache Errors**: Redis connection issues
3. **Database Errors**: PostgreSQL connection issues
4. **Validation Errors**: Input validation failures
5. **Rate Limit Errors**: API quota exceeded

### Error Response Format

```json
{
  "error": {
    "code": "API_ERROR",
    "message": "DataForSEO API request failed",
    "details": {
      "status_code": 429,
      "retry_after": 60
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Retry Logic

- **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s
- **Max Retries**: 3 attempts
- **Circuit Breaker**: 5 failures in 1 minute

## Performance Optimization

### Monitoring

The system includes comprehensive performance monitoring:

- **Operation Timing**: Track duration of all operations
- **Success Rates**: Monitor success/failure rates
- **Resource Usage**: Memory, CPU, and database usage
- **Cache Performance**: Hit/miss rates and TTL effectiveness

### Optimization Strategies

1. **Parallel Processing**: Concurrent API requests
2. **Intelligent Caching**: TTL optimization based on usage patterns
3. **Database Indexing**: Optimized queries with proper indexes
4. **Request Batching**: Group related requests
5. **Lazy Loading**: Load data on demand

### Performance Metrics

Access performance metrics via:

```bash
# Get overall performance summary
curl http://localhost:8000/api/v1/performance/summary

# Get specific operation metrics
curl http://localhost:8000/api/v1/performance/metrics?operation=api_call

# Get slow operations
curl http://localhost:8000/api/v1/performance/slow-operations
```

## Testing

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend tests
cd frontend
npm test

# Integration tests
cd backend
python -m pytest tests/integration/ -v

# Contract tests
cd backend
python -m pytest tests/contract/ -v
```

### Test Coverage

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All API endpoints
- **Contract Tests**: All external API contracts
- **Performance Tests**: Load and stress testing

## Troubleshooting

### Common Issues

#### 1. API Authentication Errors

**Error**: `401 Unauthorized`

**Solution**:
- Verify API key is correct
- Check API key is active in DataForSEO dashboard
- Ensure API key has required permissions

#### 2. Rate Limit Exceeded

**Error**: `429 Too Many Requests`

**Solution**:
- Implement request queuing
- Reduce concurrent requests
- Check rate limit settings

#### 3. Cache Connection Issues

**Error**: `Redis connection failed`

**Solution**:
- Verify Redis server is running
- Check Redis URL configuration
- Test Redis connection manually

#### 4. Database Connection Issues

**Error**: `Database connection failed`

**Solution**:
- Verify PostgreSQL is running
- Check database URL configuration
- Test database connection manually

### Debug Mode

Enable debug mode for detailed logging:

```bash
export DEBUG=true
export LOG_LEVEL=DEBUG
```

### Health Checks

Check system health:

```bash
# Overall health
curl http://localhost:8000/health

# Database health
curl http://localhost:8000/health/database

# Cache health
curl http://localhost:8000/health/cache

# API health
curl http://localhost:8000/health/api
```

### Logs

View logs for debugging:

```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# API logs
tail -f logs/api.log
```

## Support

For additional support:

1. **Documentation**: Check this guide and inline code comments
2. **Issues**: Report bugs via GitHub issues
3. **Community**: Join our Discord community
4. **Email**: Contact support@trendanalysis.com

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial DataForSEO integration
- Trend analysis enhancement
- Keyword research enhancement
- Performance optimization
- Comprehensive testing suite
