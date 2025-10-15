# Quickstart: Complete Dataflow Persistence in Supabase

**Feature**: Complete Dataflow Persistence in Supabase  
**Date**: 2025-01-27  
**Status**: Ready for Implementation

## Overview

This quickstart guide demonstrates how to use the complete dataflow persistence feature in the trend analysis platform. The feature ensures all research data (topics, subtopics, trend analyses, content ideas) is automatically saved in Supabase with proper relationships and data integrity.

## Prerequisites

- Active Supabase project with database configured
- Valid authentication token
- API access to the trend analysis platform

## Quick Start Steps

### 1. Create a Research Topic

Start by creating a new research topic that will serve as the foundation for your research workflow.

```bash
curl -X POST "https://api.trendanalysis.com/v1/research-topics" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sustainable Fashion Trends",
    "description": "Research on emerging sustainable fashion trends and consumer behavior"
  }'
```

**Expected Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "987fcdeb-51a2-43d1-9f12-345678901234",
  "title": "Sustainable Fashion Trends",
  "description": "Research on emerging sustainable fashion trends and consumer behavior",
  "status": "active",
  "created_at": "2025-01-27T10:00:00Z",
  "updated_at": "2025-01-27T10:00:00Z",
  "version": 1
}
```

### 2. Decompose Topic into Subtopics

Break down your research topic into specific subtopics, including the original topic as a subtopic.

```bash
curl -X POST "https://api.trendanalysis.com/v1/research-topics/123e4567-e89b-12d3-a456-426614174000/subtopics" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "search_query": "sustainable fashion trends",
    "subtopics": [
      {
        "name": "sustainable fashion trends",
        "description": "General overview of sustainable fashion trends"
      },
      {
        "name": "eco-friendly materials",
        "description": "Trends in sustainable and eco-friendly fashion materials"
      },
      {
        "name": "circular fashion",
        "description": "Circular fashion economy and recycling trends"
      },
      {
        "name": "sustainable fashion brands",
        "description": "Leading sustainable fashion brands and their strategies"
      },
      {
        "name": "consumer behavior",
        "description": "How consumers are adopting sustainable fashion"
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "data": [
    {
      "name": "sustainable fashion trends",
      "description": "General overview of sustainable fashion trends"
    },
    {
      "name": "eco-friendly materials",
      "description": "Trends in sustainable and eco-friendly fashion materials"
    },
    {
      "name": "circular fashion",
      "description": "Circular fashion economy and recycling trends"
    },
    {
      "name": "sustainable fashion brands",
      "description": "Leading sustainable fashion brands and their strategies"
    },
    {
      "name": "consumer behavior",
      "description": "How consumers are adopting sustainable fashion"
    }
  ]
}
```

### 3. Perform Trend Analysis

Analyze trends for specific subtopics to gather data and insights.

```bash
curl -X POST "https://api.trendanalysis.com/v1/trend-analyses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_decomposition_id": "456e7890-e89b-12d3-a456-426614174001",
    "subtopic_name": "eco-friendly materials",
    "analysis_name": "Eco-Friendly Materials Trend Analysis",
    "description": "Analysis of trending eco-friendly materials in fashion",
    "keywords": ["eco-friendly materials", "sustainable textiles", "organic cotton", "recycled fabrics"],
    "timeframe": "12m",
    "geo": "US"
  }'
```

**Expected Response**:
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "user_id": "987fcdeb-51a2-43d1-9f12-345678901234",
  "topic_decomposition_id": "456e7890-e89b-12d3-a456-426614174001",
  "subtopic_name": "eco-friendly materials",
  "analysis_name": "Eco-Friendly Materials Trend Analysis",
  "description": "Analysis of trending eco-friendly materials in fashion",
  "keywords": ["eco-friendly materials", "sustainable textiles", "organic cotton", "recycled fabrics"],
  "timeframe": "12m",
  "geo": "US",
  "trend_data": {
    "search_volume": 12500,
    "trend_score": 85,
    "related_queries": ["organic cotton clothing", "recycled polyester", "bamboo fabric"]
  },
  "analysis_results": {
    "insights": ["Growing interest in organic cotton", "Recycled materials gaining popularity"],
    "recommendations": ["Focus on organic cotton content", "Highlight recycling benefits"]
  },
  "insights": {
    "key_trends": ["Rising demand for transparency", "Consumer education importance"],
    "opportunities": ["Educational content", "Product transparency"]
  },
  "source": "google_trends",
  "status": "completed",
  "processing_time_ms": 2500,
  "api_calls_made": 3,
  "cache_hit": false,
  "created_at": "2025-01-27T10:05:00Z",
  "updated_at": "2025-01-27T10:05:02Z",
  "completed_at": "2025-01-27T10:05:02Z"
}
```

### 4. Generate Content Ideas

Create content ideas based on the trend analysis results.

```bash
curl -X POST "https://api.trendanalysis.com/v1/content-ideas" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trend_analysis_id": "789e0123-e89b-12d3-a456-426614174002",
    "research_topic_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "The Complete Guide to Eco-Friendly Fashion Materials",
    "description": "Comprehensive guide covering all sustainable fashion materials",
    "content_type": "guide",
    "idea_type": "evergreen",
    "primary_keyword": "eco-friendly fashion materials",
    "secondary_keywords": ["sustainable textiles", "organic cotton", "recycled fabrics"],
    "target_audience": "eco-conscious consumers",
    "content_angle": "Educational and informative",
    "key_points": [
      "Overview of sustainable materials",
      "Benefits of each material type",
      "How to identify quality sustainable fashion",
      "Brand recommendations"
    ]
  }'
```

**Expected Response**:
```json
{
  "id": "abc12345-e89b-12d3-a456-426614174003",
  "user_id": "987fcdeb-51a2-43d1-9f12-345678901234",
  "trend_analysis_id": "789e0123-e89b-12d3-a456-426614174002",
  "research_topic_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "The Complete Guide to Eco-Friendly Fashion Materials",
  "description": "Comprehensive guide covering all sustainable fashion materials",
  "content_type": "guide",
  "idea_type": "evergreen",
  "status": "draft",
  "priority": "medium",
  "target_audience": "eco-conscious consumers",
  "content_angle": "Educational and informative",
  "key_points": [
    "Overview of sustainable materials",
    "Benefits of each material type",
    "How to identify quality sustainable fashion",
    "Brand recommendations"
  ],
  "content_outline": [
    "Introduction to sustainable fashion",
    "Material types and benefits",
    "Quality indicators",
    "Brand spotlights",
    "Conclusion and next steps"
  ],
  "primary_keyword": "eco-friendly fashion materials",
  "secondary_keywords": ["sustainable textiles", "organic cotton", "recycled fabrics"],
  "enhanced_keywords": ["organic cotton clothing", "recycled polyester", "bamboo fabric"],
  "keyword_difficulty": 45,
  "search_volume": 12500,
  "cpc": "$2.50",
  "readability_score": 85,
  "seo_score": 92,
  "engagement_score": 78,
  "created_at": "2025-01-27T10:10:00Z",
  "updated_at": "2025-01-27T10:10:00Z"
}
```

### 5. Retrieve Complete Dataflow

Get the complete research workflow with all related data.

```bash
curl -X GET "https://api.trendanalysis.com/v1/research-topics/123e4567-e89b-12d3-a456-426614174000/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "research_topic": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "987fcdeb-51a2-43d1-9f12-345678901234",
    "title": "Sustainable Fashion Trends",
    "description": "Research on emerging sustainable fashion trends and consumer behavior",
    "status": "active",
    "created_at": "2025-01-27T10:00:00Z",
    "updated_at": "2025-01-27T10:00:00Z",
    "version": 1
  },
  "subtopics": [
    {
      "name": "sustainable fashion trends",
      "description": "General overview of sustainable fashion trends"
    },
    {
      "name": "eco-friendly materials",
      "description": "Trends in sustainable and eco-friendly fashion materials"
    },
    {
      "name": "circular fashion",
      "description": "Circular fashion economy and recycling trends"
    },
    {
      "name": "sustainable fashion brands",
      "description": "Leading sustainable fashion brands and their strategies"
    },
    {
      "name": "consumer behavior",
      "description": "How consumers are adopting sustainable fashion"
    }
  ],
  "trend_analyses": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "subtopic_name": "eco-friendly materials",
      "analysis_name": "Eco-Friendly Materials Trend Analysis",
      "status": "completed",
      "trend_data": {
        "search_volume": 12500,
        "trend_score": 85
      },
      "created_at": "2025-01-27T10:05:00Z"
    }
  ],
  "content_ideas": [
    {
      "id": "abc12345-e89b-12d3-a456-426614174003",
      "title": "The Complete Guide to Eco-Friendly Fashion Materials",
      "content_type": "guide",
      "idea_type": "evergreen",
      "status": "draft",
      "primary_keyword": "eco-friendly fashion materials",
      "created_at": "2025-01-27T10:10:00Z"
    }
  ]
}
```

## Key Features Demonstrated

### 1. Automatic Data Persistence
- All research data is automatically saved to Supabase
- No manual save operations required
- Data is preserved across sessions

### 2. Referential Integrity
- Research topics link to subtopics
- Subtopics link to trend analyses
- Trend analyses link to content ideas
- All relationships are maintained automatically

### 3. Complete Dataflow Retrieval
- Single API call retrieves entire research workflow
- Includes all related subtopics, analyses, and content ideas
- Maintains data relationships and hierarchy

### 4. Error Handling
- Graceful handling of partial failures
- Clear error messages for troubleshooting
- Data integrity maintained even during errors

### 5. Version Control
- Research topics have version tracking
- Optimistic concurrency control prevents conflicts
- Change history can be tracked

## Error Scenarios

### Database Connection Lost
If the database connection is lost during data persistence:

```json
{
  "error": "database_connection_failed",
  "message": "Unable to save data to database. Please try again.",
  "partial_success": {
    "research_topic": "saved",
    "subtopics": "failed",
    "trend_analyses": "not_attempted"
  }
}
```

### Version Conflict
If another user updates the research topic:

```json
{
  "error": "version_conflict",
  "message": "Research topic has been updated by another user",
  "current_version": 2,
  "provided_version": 1
}
```

### Validation Error
If required fields are missing:

```json
{
  "error": "validation_failed",
  "message": "Invalid request data",
  "details": {
    "title": "Title is required",
    "description": "Description must be less than 5000 characters"
  }
}
```

## Best Practices

### 1. Data Organization
- Use descriptive titles for research topics
- Include detailed descriptions for context
- Organize subtopics logically

### 2. Error Handling
- Always check response status codes
- Handle partial success scenarios
- Implement retry logic for transient failures

### 3. Performance
- Use pagination for large datasets
- Cache frequently accessed data
- Minimize API calls with bulk operations

### 4. Security
- Always use HTTPS for API calls
- Store authentication tokens securely
- Implement proper access controls

## Next Steps

1. **Implement the API endpoints** according to the contracts
2. **Create database migrations** for the new schema
3. **Add comprehensive tests** for all scenarios
4. **Update the frontend** to use the new persistence features
5. **Monitor performance** and optimize as needed

This quickstart demonstrates the complete dataflow persistence feature, showing how research data flows from topics through subtopics to trend analyses and finally to content ideas, all while maintaining data integrity and relationships in Supabase.
