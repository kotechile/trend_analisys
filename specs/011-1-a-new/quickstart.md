# Quickstart: Keyword Analysis with Ahrefs Data

## Overview
This quickstart guide demonstrates the complete workflow for uploading Ahrefs TSV keyword data, analyzing opportunities, and generating actionable content recommendations.

## Prerequisites
- Ahrefs keyword export file (TSV format)
- User account with authentication
- Web browser with JavaScript enabled

## Step-by-Step Workflow

### 1. Upload Keyword File
**Action**: Upload your Ahrefs TSV export file
**Expected Result**: File is validated and processing begins

```bash
# API Call
curl -X POST http://localhost:8000/api/v1/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@keywords.tsv" \
  -F "user_id=123e4567-e89b-12d3-a456-426614174000"

# Expected Response
{
  "file_id": "456e7890-e89b-12d3-a456-426614174001",
  "filename": "keywords.tsv",
  "file_size": 1024000,
  "status": "pending",
  "message": "File uploaded successfully"
}
```

### 2. Start Analysis
**Action**: Begin keyword analysis with opportunity scoring
**Expected Result**: Analysis process initiated with custom scoring weights

```bash
# API Call
curl -X POST http://localhost:8000/api/v1/analysis/456e7890-e89b-12d3-a456-426614174001/start \
  -H "Content-Type: application/json" \
  -d '{
    "scoring_weights": {
      "search_volume": 0.4,
      "keyword_difficulty": 0.3,
      "cpc": 0.2,
      "search_intent": 0.1
    }
  }'

# Expected Response
{
  "analysis_id": "789e0123-e89b-12d3-a456-426614174002",
  "file_id": "456e7890-e89b-12d3-a456-426614174001",
  "status": "started",
  "estimated_completion": "2024-12-19T15:30:00Z",
  "message": "Analysis started successfully"
}
```

### 3. Monitor Progress
**Action**: Check analysis progress
**Expected Result**: Real-time status updates

```bash
# API Call
curl -X GET http://localhost:8000/api/v1/analysis/789e0123-e89b-12d3-a456-426614174002/status

# Expected Response
{
  "analysis_id": "789e0123-e89b-12d3-a456-426614174002",
  "status": "processing",
  "progress": 75,
  "keywords_analyzed": 7500,
  "total_keywords": 10000,
  "started_at": "2024-12-19T15:00:00Z"
}
```

### 4. Retrieve Analysis Results
**Action**: Get complete analysis results
**Expected Result**: Comprehensive report with opportunities and recommendations

```bash
# API Call
curl -X GET "http://localhost:8000/api/v1/analysis/789e0123-e89b-12d3-a456-426614174002/results?limit=50&category=high&sort_by=opportunity_score&sort_order=desc"

# Expected Response
{
  "analysis_id": "789e0123-e89b-12d3-a456-426614174002",
  "summary": {
    "total_keywords": 10000,
    "high_opportunity_count": 1500,
    "medium_opportunity_count": 3500,
    "low_opportunity_count": 5000,
    "total_search_volume": 5000000,
    "average_difficulty": 45.2,
    "average_cpc": 2.15
  },
  "top_opportunities": {
    "high_opportunity_keywords": [
      {
        "keyword": "best project management tools",
        "search_volume": 12000,
        "keyword_difficulty": 35,
        "cpc": 4.50,
        "search_intent": "Informational,Commercial,Non-branded,Non-local",
        "primary_intent": "Informational",
        "opportunity_score": 87.5,
        "category": "high",
        "content_format": "list-article",
        "seo_score": 92
      }
    ],
    "quick_wins": [
      {
        "keyword": "how to use trello",
        "search_volume": 2500,
        "keyword_difficulty": 20,
        "cpc": 1.20,
        "search_intent": "Informational,Non-branded,Non-local",
        "primary_intent": "Informational",
        "opportunity_score": 78.3,
        "category": "high",
        "content_format": "how-to-guide",
        "seo_score": 85
      }
    ],
    "high_volume_targets": [
      {
        "keyword": "project management software",
        "search_volume": 45000,
        "keyword_difficulty": 65,
        "cpc": 5.80,
        "search_intent": "Commercial,Non-branded,Non-local",
        "primary_intent": "Commercial",
        "opportunity_score": 72.1,
        "category": "medium",
        "content_format": "comparison-post",
        "seo_score": 88
      }
    ]
  },
  "content_recommendations": {
    "how_to_guides": [
      "how to use trello",
      "how to manage remote teams",
      "how to track project progress"
    ],
    "comparison_posts": [
      "asana vs trello",
      "monday.com vs clickup",
      "notion vs airtable"
    ],
    "list_articles": [
      "best project management tools",
      "top productivity apps",
      "essential team collaboration software"
    ],
    "beginner_guides": [
      "project management for beginners",
      "getting started with agile",
      "team workflow basics"
    ],
    "tool_reviews": [
      "trello review",
      "asana features",
      "monday.com pricing"
    ]
  },
  "insights": [
    "Multiple low-competition keywords available for quick wins",
    "High commercial value keywords identified for monetization",
    "Strong opportunity for pillar content around project management",
    "Informational intent keywords dominate, ideal for blog content"
  ],
  "next_steps": [
    "Prioritize high-opportunity keywords for immediate content creation",
    "Create pillar content around project management software comparisons",
    "Develop quick-win content for low-difficulty keywords",
    "Plan content calendar based on search volume patterns"
  ],
  "seo_content_ideas": [
    {
      "id": "idea-001",
      "title": "Best Project Management Tools for Remote Teams in 2024",
      "content_type": "list-article",
      "primary_keywords": [
        "best project management tools",
        "remote team project management",
        "project management software",
        "team collaboration tools",
        "project management platforms"
      ],
      "secondary_keywords": [
        "remote work tools",
        "team productivity",
        "project tracking",
        "workflow management"
      ],
      "seo_optimization_score": 92,
      "traffic_potential_score": 88,
      "total_search_volume": 45000,
      "average_difficulty": 45,
      "average_cpc": 3.20,
      "optimization_tips": [
        "Include 'best project management tools' in your title and first paragraph",
        "Create comparison sections for commercial keywords like 'Asana vs Trello'",
        "Use secondary keywords like 'remote work tools' in H2 and H3 headings",
        "Include long-tail keywords in meta descriptions",
        "Add internal links to related project management guides"
      ],
      "content_outline": "Introduction → Top 10 Tools → Detailed Reviews → Comparison Table → Conclusion"
    }
  ]
}
```

### 5. Export Report
**Action**: Export analysis results in JSON format
**Expected Result**: Downloadable JSON report file

```bash
# API Call - JSON Export
curl -X GET "http://localhost:8000/api/v1/reports/789e0123-e89b-12d3-a456-426614174002/export?format=json&include_keywords=true&category_filter=high" \
  -o keyword_analysis_report.json

# Expected Response: Complete JSON report with all calculated fields and structured data
```

### 6. Get Content Opportunities
**Action**: Retrieve specific content opportunities
**Expected Result**: Actionable content ideas with SEO scores

```bash
# API Call
curl -X GET "http://localhost:8000/api/v1/reports/789e0123-e89b-12d3-a456-426614174002/content-opportunities?format=how-to-guide&min_seo_score=80"

# Expected Response
{
  "opportunities": [
    {
      "id": "opp-001",
      "keyword": "how to use trello",
      "content_format": "how-to-guide",
      "seo_score": 85,
      "priority_rank": 1,
      "content_suggestion": "Create a comprehensive guide on setting up Trello boards, managing tasks, and using power-ups for team collaboration",
      "opportunity_score": 78.3
    }
  ],
  "total_count": 25,
  "format_distribution": {
    "how_to_guide": 15,
    "comparison_post": 8,
    "list_article": 12,
    "beginner_guide": 5,
    "tool_review": 3
  }
}
```

## Success Criteria
- [ ] TSV file upload completes without errors
- [ ] Analysis processes all keywords successfully
- [ ] Opportunity scores are calculated correctly (0-100 range)
- [ ] Keywords are categorized appropriately (High/Medium/Low)
- [ ] Intent tags are parsed and mapped correctly
- [ ] Top opportunities are identified and ranked
- [ ] Content recommendations are generated
- [ ] JSON export works with all calculated fields
- [ ] Content opportunities are actionable and SEO-optimized

## Error Handling
- **File Upload Errors**: Invalid TSV format, size limits (>10MB), missing required columns
- **Analysis Errors**: Processing failures, data validation issues, intent parsing errors
- **Export Errors**: Missing data, invalid parameters
- **Authentication Errors**: Invalid user credentials, access denied

## Performance Expectations
- **File Processing**: 10MB files (50,000 keywords) in <30 seconds
- **API Response**: <200ms for standard operations
- **Memory Usage**: <500MB for largest files
- **Concurrent Users**: Support 100+ simultaneous analyses
- **Data Retention**: Automatic cleanup after 90 days