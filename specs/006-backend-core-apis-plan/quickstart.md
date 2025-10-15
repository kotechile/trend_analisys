# Quickstart: Enhanced Research Workflow Integration

## Overview
This quickstart demonstrates the complete enhanced research workflow integration, allowing users to upload CSV trend data, select trends, generate keywords, and integrate with external tools.

## Prerequisites
- TrendTap API running and accessible
- Valid authentication token
- CSV file with trend data (optional)
- External tool results file (optional)

## Workflow Steps

### Step 1: Create Workflow Session
Create a new workflow session to track progress through the enhanced research workflow.

```bash
curl -X POST "https://api.trendtap.com/v1/workflow/sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_name": "Q4 2024 Content Strategy",
    "description": "Research workflow for Q4 content planning"
  }'
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user123",
  "session_name": "Q4 2024 Content Strategy",
  "current_step": "upload_csv",
  "progress_percentage": 0,
  "status": "active",
  "created_at": "2024-01-27T10:00:00Z"
}
```

### Step 2: Upload CSV Trend Data (Optional)
Upload a CSV file with trend data for manual trend analysis.

```bash
curl -X POST "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000/csv-upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@trends.csv" \
  -F 'column_mapping={
    "trend_name": "Trend Name",
    "trend_description": "Description", 
    "trend_category": "Category",
    "search_volume": "Volume",
    "competition_level": "Competition",
    "date": "Date"
  }'
```

**Expected Response:**
```json
{
  "upload_id": "upload_123",
  "processing_status": "completed",
  "row_count": 150,
  "trends_available": 150,
  "message": "CSV processed successfully"
}
```

### Step 3: Get Available Trends
Retrieve all available trends from both LLM analysis and CSV uploads.

```bash
curl -X GET "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000/trends?source=all&category=technology&min_volume=1000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "trends": [
    {
      "id": "trend_1",
      "trend_name": "AI Content Generation",
      "trend_description": "Automated content creation using AI",
      "trend_category": "technology",
      "search_volume": 5000,
      "competition_level": "medium",
      "source": "llm_analysis",
      "date": "2024-01-27"
    }
  ],
  "total": 1,
  "filters_applied": {
    "source": "all",
    "category": "technology",
    "min_volume": 1000
  }
}
```

### Step 4: Select Trends for Content Generation
Select specific trends for keyword generation and content strategy.

```bash
curl -X POST "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000/trends" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trend_ids": ["trend_1", "trend_2", "trend_3"]
  }'
```

**Expected Response:**
```json
{
  "selected_trends": [
    {
      "id": "selection_1",
      "trend_name": "AI Content Generation",
      "trend_description": "Automated content creation using AI",
      "trend_category": "technology",
      "search_volume": 5000,
      "competition_level": "medium",
      "source": "llm_analysis",
      "selected_at": "2024-01-27T10:15:00Z"
    }
  ],
  "total_selected": 1
}
```

### Step 5: Generate Seed Keywords
Generate seed keywords based on selected trends and content ideas.

```bash
curl -X POST "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000/keywords/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_ideas": [
      "How to use AI for content creation",
      "Best AI writing tools comparison",
      "AI content optimization strategies"
    ],
    "max_keywords": 100,
    "include_long_tail": true,
    "include_question_keywords": true
  }'
```

**Expected Response:**
```json
{
  "keywords": [
    {
      "keyword": "AI content generation tools",
      "search_volume": 2500,
      "difficulty": 0.6,
      "cpc": 2.50,
      "competition": "medium",
      "intent": "commercial",
      "source": "generated"
    }
  ],
  "total_generated": 100,
  "generation_time": 15.2
}
```

### Step 6: Export Keywords for External Tools
Export generated keywords in formats suitable for external keyword research tools.

```bash
curl -X GET "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000/keywords/export?format=ahrefs&include_metrics=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o keywords_ahrefs.csv
```

**Expected Response:** CSV file with keywords formatted for Ahrefs import.

### Step 7: Upload External Tool Results
Upload and process results from external keyword research tools.

```bash
curl -X POST "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000/external-upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@ahrefs_results.csv" \
  -F "tool_type=ahrefs" \
  -F 'column_mapping={
    "keyword": "Keyword",
    "volume": "Search Volume",
    "difficulty": "KD",
    "cpc": "CPC",
    "competition": "Competition"
  }'
```

**Expected Response:**
```json
{
  "upload_id": "external_upload_123",
  "tool_type": "ahrefs",
  "keywords_processed": 500,
  "processing_status": "completed",
  "message": "External tool results processed successfully"
}
```

### Step 8: Get Keyword Clusters
Retrieve keyword clustering results for content strategy generation.

```bash
curl -X GET "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000/clusters?min_cluster_size=5&search_intent=commercial" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "clusters": [
    {
      "id": "cluster_1",
      "cluster_name": "AI Writing Tools",
      "cluster_description": "Keywords related to AI-powered writing tools",
      "keywords": ["AI writing assistant", "automated content creation", "AI copywriting tools"],
      "cluster_size": 15,
      "search_intent": "commercial",
      "content_theme": "Tool Reviews and Comparisons",
      "priority_score": 0.85
    }
  ],
  "total_clusters": 8,
  "clustering_algorithm": "K-means"
}
```

### Step 9: Complete Workflow Session
Mark the workflow session as completed.

```bash
curl -X PUT "https://api.trendtap.com/v1/workflow/sessions/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_step": "analyze_results",
    "progress_percentage": 100,
    "status": "completed",
    "completed_steps": ["upload_csv", "select_trends", "generate_keywords", "export_keywords", "upload_external", "analyze_results"]
  }'
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "validation_error",
  "message": "Invalid CSV format or column mapping",
  "details": {
    "field": "column_mapping.trend_name",
    "issue": "Required column not found in CSV"
  }
}
```

**404 Not Found:**
```json
{
  "error": "not_found",
  "message": "Workflow session not found",
  "details": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**413 Payload Too Large:**
```json
{
  "error": "file_too_large",
  "message": "CSV file exceeds maximum size limit",
  "details": {
    "max_size": "10MB",
    "actual_size": "15MB"
  }
}
```

## Performance Expectations

- **CSV Upload**: < 5 seconds for files up to 10MB
- **Trend Selection**: < 1 second for up to 1000 trends
- **Keyword Generation**: < 30 seconds for 100 keywords
- **External Upload**: < 10 seconds for files up to 5MB
- **Keyword Clustering**: < 60 seconds for 1000 keywords
- **Total Workflow**: < 15 minutes end-to-end

## Testing Checklist

- [ ] Create workflow session successfully
- [ ] Upload CSV with valid format and mapping
- [ ] Upload CSV with invalid format (should fail gracefully)
- [ ] Retrieve trends with various filters
- [ ] Select trends and verify selections
- [ ] Generate keywords with different parameters
- [ ] Export keywords in different formats
- [ ] Upload external tool results
- [ ] Get keyword clusters with filters
- [ ] Complete workflow session
- [ ] Handle errors gracefully at each step
- [ ] Verify data persistence across steps
- [ ] Test with large datasets (1000+ trends/keywords)