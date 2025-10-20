# Quickstart Guide: DataForSEO API Integration

**Feature**: DataForSEO API Integration for Enhanced Trend Analysis and Keyword Research  
**Date**: 2025-01-14  
**Phase**: 1 - Design & Contracts

## Overview

This quickstart guide demonstrates how to use the enhanced Trend Analysis and Keyword Research features powered by DataForSEO APIs. The integration provides rich graphical dashboards for trend visualization and intelligent keyword research with commercial intent prioritization.

## Prerequisites

1. **DataForSEO API Credentials**: Valid API key stored in Supabase `API_Keys` table
2. **Existing Subtopics**: Completed affiliate research with identified subtopics
3. **Seed Keywords**: Keywords from Idea Burst module for keyword research

## Setup Instructions

### 1. Configure DataForSEO API Credentials

```sql
-- Insert DataForSEO API credentials into Supabase
INSERT INTO api_keys (provider, base_url, key_value, is_active, created_at)
VALUES (
  'dataforseo',
  'https://api.dataforseo.com',
  'your_api_key_here',
  true,
  NOW()
);
```

### 2. Verify API Configuration

```bash
# Test API connectivity
curl -X GET "http://localhost:8000/api/v1/trend-analysis/dataforseo?subtopics=weight%20loss&location=United%20States" \
  -H "Authorization: Bearer your_jwt_token"
```

## User Scenarios

### Scenario 1: Enhanced Trend Analysis

**Goal**: Analyze trend data for affiliate research subtopics

**Steps**:
1. Navigate to "Trend Analysis - DataForSEO" page
2. Select subtopics from affiliate research results
3. Choose geographic location (default: United States)
4. Select time range (1m, 3m, 6m, 12m, 24m)
5. View rich graphical dashboard with trend visualizations

**Expected Result**: Interactive charts showing search interest over time, regional popularity, and demographic breakdowns

**API Call**:
```bash
curl -X GET "http://localhost:8000/api/v1/trend-analysis/dataforseo" \
  -H "Authorization: Bearer your_jwt_token" \
  -G -d "subtopics=weight loss,keto diet,fitness" \
  -d "location=United States" \
  -d "time_range=12m"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "keyword": "weight loss",
      "location": "United States",
      "time_series": [
        {"date": "2024-01-01", "value": 75},
        {"date": "2024-02-01", "value": 82}
      ],
      "demographics": {
        "age_groups": [
          {"age_range": "25-34", "percentage": 45},
          {"age_range": "35-44", "percentage": 35}
        ]
      },
      "related_queries": ["weight loss tips", "diet plans"]
    }
  ],
  "metadata": {
    "total_subtopics": 3,
    "analysis_date": "2025-01-14T10:00:00Z",
    "cache_status": "fresh"
  }
}
```

### Scenario 2: Subtopic Comparison

**Goal**: Compare trend data for multiple subtopics side-by-side

**Steps**:
1. Select 2-5 subtopics for comparison
2. Choose comparison metrics (growth rate, peak popularity, etc.)
3. View side-by-side trend visualizations
4. Identify top performers and growth leaders

**API Call**:
```bash
curl -X POST "http://localhost:8000/api/v1/trend-analysis/dataforseo/compare" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "subtopics": ["weight loss", "keto diet"],
    "location": "United States",
    "time_range": "12m"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "keyword": "weight loss",
      "time_series": [...]
    },
    {
      "keyword": "keto diet", 
      "time_series": [...]
    }
  ],
  "comparison_metrics": {
    "top_performer": "keto diet",
    "growth_leader": "weight loss",
    "average_trend": 75.5
  }
}
```

### Scenario 3: Trending Subtopic Suggestions

**Goal**: Discover new trending subtopics related to existing research

**Steps**:
1. Provide base subtopics from affiliate research
2. Set maximum number of suggestions (1-20)
3. Review suggested trending topics
4. Analyze growth potential and related queries

**API Call**:
```bash
curl -X POST "http://localhost:8000/api/v1/trend-analysis/dataforseo/suggestions" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "base_subtopics": ["weight loss", "fitness"],
    "max_suggestions": 10,
    "location": "United States"
  }'
```

**Response**:
```json
{
  "success": true,
  "suggestions": [
    {
      "topic": "intermittent fasting",
      "trending_status": "TRENDING",
      "growth_potential": 85,
      "related_queries": ["16:8 fasting", "OMAD diet"],
      "search_volume": 25000
    }
  ]
}
```

### Scenario 4: Enhanced Keyword Research

**Goal**: Generate prioritized keyword suggestions with commercial intent analysis

**Steps**:
1. Provide seed keywords from Idea Burst module
2. Set maximum keyword difficulty threshold
3. Configure minimum search volume
4. Select commercial intent types
5. Review prioritized keyword list

**API Call**:
```bash
curl -X POST "http://localhost:8000/api/v1/keyword-research/dataforseo" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "seed_keywords": ["weight loss tips", "diet plans"],
    "max_difficulty": 50,
    "min_volume": 100,
    "intent_types": ["COMMERCIAL", "TRANSACTIONAL"],
    "max_results": 100
  }'
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "keyword": "weight loss tips",
      "search_volume": 50000,
      "keyword_difficulty": 35,
      "cpc": 2.50,
      "competition": 0.65,
      "competition_level": "MEDIUM",
      "trends": {
        "trend_direction": "RISING",
        "trend_percentage": 15.5
      },
      "intent": "COMMERCIAL"
    }
  ],
  "metadata": {
    "total_keywords": 150,
    "filtered_keywords": 75,
    "average_difficulty": 35.2
  }
}
```

### Scenario 5: Keyword Prioritization

**Goal**: Prioritize keywords based on commercial intent and growth potential

**Steps**:
1. Select keywords from research results
2. Configure priority factors (CPC weight, volume weight, trend weight)
3. Generate prioritized keyword list
4. Review top opportunities

**API Call**:
```bash
curl -X POST "http://localhost:8000/api/v1/keyword-research/dataforseo/prioritize" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": [
      {
        "keyword": "weight loss tips",
        "search_volume": 50000,
        "cpc": 2.50,
        "trends": {"trend_percentage": 15.5}
      }
    ],
    "priority_factors": {
      "cpc_weight": 0.3,
      "volume_weight": 0.4,
      "trend_weight": 0.3
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "prioritized_keywords": [
    {
      "keyword": "weight loss tips",
      "search_volume": 50000,
      "cpc": 2.50,
      "priority_score": 85.5,
      "rank": 1
    }
  ]
}
```

## Error Handling

### Common Error Scenarios

1. **Rate Limit Exceeded (429)**
   ```json
   {
     "success": false,
     "error": "RATE_LIMIT_EXCEEDED",
     "message": "API rate limit exceeded. Please try again later.",
     "details": {
       "retry_after": 60,
       "quota_remaining": 0
     }
   }
   ```

2. **Invalid Parameters (400)**
   ```json
   {
     "success": false,
     "error": "INVALID_PARAMETERS",
     "message": "Invalid subtopics parameter. Must be non-empty array.",
     "details": {
       "field": "subtopics",
       "expected": "array of strings"
     }
   }
   ```

3. **API Unavailable (500)**
   ```json
   {
     "success": false,
     "error": "API_UNAVAILABLE",
     "message": "DataForSEO API is temporarily unavailable.",
     "details": {
       "retry_after": 300
     }
   }
   ```

## Testing Scenarios

### Integration Tests

1. **Test Trend Analysis Flow**
   - Verify subtopic trend data retrieval
   - Validate graphical dashboard rendering
   - Test comparison functionality

2. **Test Keyword Research Flow**
   - Verify seed keyword processing
   - Validate keyword filtering and prioritization
   - Test commercial intent analysis

3. **Test Error Handling**
   - Simulate API rate limiting
   - Test invalid parameter handling
   - Verify graceful degradation

### Performance Tests

1. **API Response Times**
   - Trend analysis: < 2 seconds
   - Keyword research: < 5 seconds
   - Comparison: < 3 seconds

2. **Concurrent Users**
   - Support 50+ concurrent users
   - Maintain < 200ms response times
   - Handle API rate limits gracefully

## Troubleshooting

### Common Issues

1. **No Trend Data Available**
   - Check if subtopics are too niche
   - Verify geographic location settings
   - Ensure API credentials are valid

2. **Empty Keyword Results**
   - Adjust difficulty and volume filters
   - Try broader seed keywords
   - Check API quota limits

3. **Slow Performance**
   - Enable caching for repeated requests
   - Reduce number of concurrent subtopics
   - Check API response times

### Debug Commands

```bash
# Check API status
curl -X GET "http://localhost:8000/api/v1/health/dataforseo"

# Verify credentials
curl -X GET "http://localhost:8000/api/v1/config/dataforseo"

# Test specific endpoint
curl -X GET "http://localhost:8000/api/v1/trend-analysis/dataforseo?subtopics=test" \
  -H "Authorization: Bearer your_jwt_token" \
  -v
```

## Next Steps

1. **Explore Advanced Features**
   - Demographic analysis
   - Regional trend comparisons
   - Custom priority scoring

2. **Integrate with Existing Workflows**
   - Connect with affiliate research
   - Link to content creation tools
   - Export data for external analysis

3. **Monitor Performance**
   - Track API usage and costs
   - Monitor response times
   - Analyze user engagement

## Support

For technical support or feature requests:
- Check the API documentation
- Review error logs in the application
- Contact the development team

---

*This quickstart guide provides a comprehensive overview of the DataForSEO API integration features. For detailed API specifications, see the contracts directory.*
