# Data Model: Complete Dataflow Persistence in Supabase

**Feature**: Complete Dataflow Persistence in Supabase  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

This data model extends the existing Supabase schema to ensure complete dataflow persistence for the trend analysis platform. The model maintains referential integrity between research topics, subtopics, trend analyses, and content ideas while preserving existing functionality.

## Core Entities

### Research Topic
Represents the main research subject that users investigate.

**Table**: `research_topics`

**Fields**:
- `id: UUID` - Primary key, auto-generated
- `user_id: UUID` - Foreign key to users table, NOT NULL
- `title: VARCHAR(255)` - Research topic title, NOT NULL
- `description: TEXT` - Detailed description of the research topic
- `status: VARCHAR(50)` - Status (active, completed, archived), DEFAULT 'active'
- `created_at: TIMESTAMP WITH TIME ZONE` - Creation timestamp, DEFAULT NOW()
- `updated_at: TIMESTAMP WITH TIME ZONE` - Last update timestamp, DEFAULT NOW()
- `version: INTEGER` - Version number for optimistic concurrency control, DEFAULT 1

**Validation Rules**:
- `title` must be non-empty and max 255 characters
- `description` must be max 5000 characters
- `status` must be one of: active, completed, archived
- `version` must be positive integer

**Relationships**:
- One-to-many with `topic_decompositions`
- One-to-many with `workflow_sessions`

### Enhanced Topic Decomposition
Represents the decomposition of a research topic into subtopics, including the original topic as a subtopic.

**Table**: `topic_decompositions` (enhanced existing table)

**Fields**:
- `id: UUID` - Primary key, auto-generated
- `user_id: UUID` - Foreign key to users table, NOT NULL
- `research_topic_id: UUID` - Foreign key to research_topics table, NOT NULL
- `search_query: TEXT` - Original search query, NOT NULL
- `subtopics: JSONB` - Array of subtopic objects, NOT NULL
- `original_topic_included: BOOLEAN` - Whether original topic is included as subtopic, DEFAULT TRUE
- `created_at: TIMESTAMP WITH TIME ZONE` - Creation timestamp, DEFAULT NOW()
- `updated_at: TIMESTAMP WITH TIME ZONE` - Last update timestamp, DEFAULT NOW()

**Validation Rules**:
- `search_query` must be non-empty and max 1000 characters
- `subtopics` must be non-empty array
- Each subtopic must have `name` and `description` fields
- `original_topic_included` must be TRUE

**Relationships**:
- Many-to-one with `research_topics`
- One-to-many with `trend_analyses`

### Enhanced Trend Analysis
Represents trend analysis results linked to specific subtopics.

**Table**: `trend_analyses` (enhanced existing table)

**Fields**:
- `id: UUID` - Primary key, auto-generated
- `user_id: UUID` - Foreign key to users table, NOT NULL
- `workflow_session_id: UUID` - Foreign key to workflow_sessions table, NOT NULL
- `topic_decomposition_id: UUID` - Foreign key to topic_decompositions table, NOT NULL
- `subtopic_name: VARCHAR(255)` - Name of the subtopic being analyzed, NOT NULL
- `analysis_name: VARCHAR(255)` - Name of the analysis, NOT NULL
- `description: VARCHAR(1000)` - Analysis description
- `keywords: JSONB` - Array of keywords, DEFAULT '[]'
- `timeframe: VARCHAR(50)` - Analysis timeframe, DEFAULT '12m'
- `geo: VARCHAR(10)` - Geographic region, DEFAULT 'US'
- `trend_data: JSONB` - Trend analysis results, DEFAULT '{}'
- `analysis_results: JSONB` - Detailed analysis results, DEFAULT '{}'
- `insights: JSONB` - Generated insights, DEFAULT '{}'
- `source: VARCHAR(50)` - Data source, DEFAULT 'google_trends'
- `status: VARCHAR(50)` - Analysis status, DEFAULT 'pending'
- `error_message: VARCHAR(1000)` - Error message if failed
- `processing_time_ms: INTEGER` - Processing time in milliseconds
- `api_calls_made: INTEGER` - Number of API calls made, DEFAULT 0
- `cache_hit: BOOLEAN` - Whether result was from cache, DEFAULT FALSE
- `created_at: TIMESTAMP WITH TIME ZONE` - Creation timestamp, DEFAULT NOW()
- `updated_at: TIMESTAMP WITH TIME ZONE` - Last update timestamp, DEFAULT NOW()
- `completed_at: TIMESTAMP WITH TIME ZONE` - Completion timestamp

**Validation Rules**:
- `subtopic_name` must be non-empty and max 255 characters
- `analysis_name` must be non-empty and max 255 characters
- `timeframe` must be one of: 1h, 4h, 1d, 7d, 30d, 90d, 12m, 5y, all
- `geo` must be valid country code
- `source` must be one of: google_trends, csv_upload, semrush, ahrefs, ubersuggest, fallback
- `status` must be one of: pending, in_progress, completed, failed

**Relationships**:
- Many-to-one with `topic_decompositions`
- One-to-many with `content_ideas`

### Enhanced Content Ideas
Represents content ideas generated from trend analysis with type classification.

**Table**: `content_ideas` (enhanced existing table)

**Fields**:
- `id: UUID` - Primary key, auto-generated
- `user_id: UUID` - Foreign key to users table, NOT NULL
- `workflow_session_id: UUID` - Foreign key to workflow_sessions table, NOT NULL
- `trend_analysis_id: UUID` - Foreign key to trend_analyses table, NOT NULL
- `research_topic_id: UUID` - Foreign key to research_topics table, NOT NULL
- `title: VARCHAR(500)` - Content idea title, NOT NULL
- `description: TEXT` - Content idea description
- `content_type: VARCHAR(50)` - Type of content, DEFAULT 'blog_post'
- `idea_type: VARCHAR(50)` - Classification of idea type, NOT NULL
- `status: VARCHAR(50)` - Content status, DEFAULT 'draft'
- `priority: VARCHAR(50)` - Content priority, DEFAULT 'medium'
- `target_audience: VARCHAR(255)` - Target audience
- `content_angle: VARCHAR(255)` - Content angle
- `key_points: JSONB` - Array of key points, DEFAULT '[]'
- `content_outline: JSONB` - Content outline, DEFAULT '[]'
- `primary_keyword: VARCHAR(255)` - Primary keyword, NOT NULL
- `secondary_keywords: JSONB` - Secondary keywords, DEFAULT '[]'
- `enhanced_keywords: JSONB` - Enhanced keywords, DEFAULT '[]'
- `keyword_difficulty: INTEGER` - Keyword difficulty (0-100)
- `search_volume: INTEGER` - Search volume
- `cpc: VARCHAR(20)` - Cost per click
- `affiliate_offers: JSONB` - Affiliate offers, DEFAULT '[]'
- `affiliate_links: JSONB` - Affiliate links, DEFAULT '[]'
- `monetization_strategy: TEXT` - Monetization strategy
- `expected_revenue: VARCHAR(20)` - Expected revenue
- `generation_prompt: TEXT` - Generation prompt used
- `generation_model: VARCHAR(100)` - AI model used
- `generation_parameters: JSONB` - Generation parameters, DEFAULT '{}'
- `generation_time_ms: INTEGER` - Generation time in milliseconds
- `readability_score: INTEGER` - Readability score (0-100)
- `seo_score: INTEGER` - SEO score (0-100)
- `engagement_score: INTEGER` - Engagement score (0-100)
- `quality_notes: TEXT` - Quality notes
- `target_publish_date: TIMESTAMP WITH TIME ZONE` - Target publish date
- `actual_publish_date: TIMESTAMP WITH TIME ZONE` - Actual publish date
- `publish_url: VARCHAR(500)` - Publish URL
- `word_count: INTEGER` - Word count
- `reading_time_minutes: INTEGER` - Reading time in minutes
- `tags: JSONB` - Tags array, DEFAULT '[]'
- `categories: JSONB` - Categories array, DEFAULT '[]'
- `created_at: TIMESTAMP WITH TIME ZONE` - Creation timestamp, DEFAULT NOW()
- `updated_at: TIMESTAMP WITH TIME ZONE` - Last update timestamp, DEFAULT NOW()

**Validation Rules**:
- `title` must be non-empty and max 500 characters
- `content_type` must be one of: blog_post, article, guide, review, tutorial, news, opinion, comparison, landing_page, product_page
- `idea_type` must be one of: trending, evergreen, seasonal, newsjacking, how_to, listicle, case_study, opinion, comparison, review
- `status` must be one of: draft, in_progress, completed, published, archived
- `priority` must be one of: low, medium, high, urgent
- `primary_keyword` must be non-empty and max 255 characters
- `keyword_difficulty` must be between 0 and 100
- `readability_score` must be between 0 and 100
- `seo_score` must be between 0 and 100
- `engagement_score` must be between 0 and 100

**Relationships**:
- Many-to-one with `trend_analyses`
- Many-to-one with `research_topics`

## Database Constraints

### Primary Keys
- All tables have UUID primary keys
- Primary keys are auto-generated using `gen_random_uuid()`

### Foreign Key Constraints
- `research_topics.user_id` → `users.id` (CASCADE DELETE)
- `topic_decompositions.user_id` → `users.id` (CASCADE DELETE)
- `topic_decompositions.research_topic_id` → `research_topics.id` (CASCADE DELETE)
- `trend_analyses.user_id` → `users.id` (CASCADE DELETE)
- `trend_analyses.workflow_session_id` → `workflow_sessions.id` (CASCADE DELETE)
- `trend_analyses.topic_decomposition_id` → `topic_decompositions.id` (CASCADE DELETE)
- `content_ideas.user_id` → `users.id` (CASCADE DELETE)
- `content_ideas.workflow_session_id` → `workflow_sessions.id` (CASCADE DELETE)
- `content_ideas.trend_analysis_id` → `trend_analyses.id` (CASCADE DELETE)
- `content_ideas.research_topic_id` → `research_topics.id` (CASCADE DELETE)

### Unique Constraints
- `research_topics(user_id, title)` - Unique research topic per user
- `topic_decompositions(research_topic_id, search_query)` - Unique decomposition per research topic

### Check Constraints
- `research_topics.status` IN ('active', 'completed', 'archived')
- `trend_analyses.timeframe` IN ('1h', '4h', '1d', '7d', '30d', '90d', '12m', '5y', 'all')
- `trend_analyses.source` IN ('google_trends', 'csv_upload', 'semrush', 'ahrefs', 'ubersuggest', 'fallback')
- `trend_analyses.status` IN ('pending', 'in_progress', 'completed', 'failed')
- `content_ideas.content_type` IN ('blog_post', 'article', 'guide', 'review', 'tutorial', 'news', 'opinion', 'comparison', 'landing_page', 'product_page')
- `content_ideas.idea_type` IN ('trending', 'evergreen', 'seasonal', 'newsjacking', 'how_to', 'listicle', 'case_study', 'opinion', 'comparison', 'review')
- `content_ideas.status` IN ('draft', 'in_progress', 'completed', 'published', 'archived')
- `content_ideas.priority` IN ('low', 'medium', 'high', 'urgent')

## Indexes

### Performance Indexes
- `idx_research_topics_user_id` ON `research_topics(user_id)`
- `idx_research_topics_status` ON `research_topics(status)`
- `idx_research_topics_created_at` ON `research_topics(created_at)`
- `idx_topic_decompositions_research_topic_id` ON `topic_decompositions(research_topic_id)`
- `idx_topic_decompositions_user_id` ON `topic_decompositions(user_id)`
- `idx_trend_analyses_topic_decomposition_id` ON `trend_analyses(topic_decomposition_id)`
- `idx_trend_analyses_subtopic_name` ON `trend_analyses(subtopic_name)`
- `idx_trend_analyses_status` ON `trend_analyses(status)`
- `idx_content_ideas_trend_analysis_id` ON `content_ideas(trend_analysis_id)`
- `idx_content_ideas_research_topic_id` ON `content_ideas(research_topic_id)`
- `idx_content_ideas_idea_type` ON `content_ideas(idea_type)`
- `idx_content_ideas_status` ON `content_ideas(status)`

### JSONB Indexes
- `idx_topic_decompositions_subtopics_gin` ON `topic_decompositions USING GIN (subtopics)`
- `idx_trend_analyses_keywords_gin` ON `trend_analyses USING GIN (keywords)`
- `idx_trend_analyses_trend_data_gin` ON `trend_analyses USING GIN (trend_data)`
- `idx_content_ideas_key_points_gin` ON `content_ideas USING GIN (key_points)`
- `idx_content_ideas_secondary_keywords_gin` ON `content_ideas USING GIN (secondary_keywords)`
- `idx_content_ideas_tags_gin` ON `content_ideas USING GIN (tags)`

## Row Level Security (RLS)

### Policies
All tables have RLS enabled with the following policies:

1. **Users can view their own data**:
   ```sql
   CREATE POLICY "Users can view their own data" ON table_name
       FOR SELECT USING (auth.uid() = user_id);
   ```

2. **Users can insert their own data**:
   ```sql
   CREATE POLICY "Users can insert their own data" ON table_name
       FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

3. **Users can update their own data**:
   ```sql
   CREATE POLICY "Users can update their own data" ON table_name
       FOR UPDATE USING (auth.uid() = user_id);
   ```

4. **Users can delete their own data**:
   ```sql
   CREATE POLICY "Users can delete their own data" ON table_name
       FOR DELETE USING (auth.uid() = user_id);
   ```

## Data Flow Relationships

```
Research Topic (1) → (N) Topic Decompositions
Topic Decomposition (1) → (N) Trend Analyses
Trend Analysis (1) → (N) Content Ideas
Research Topic (1) → (N) Content Ideas (direct relationship)
```

## State Transitions

### Research Topic States
- `active` → `completed` (when research is finished)
- `active` → `archived` (when research is no longer relevant)
- `completed` → `archived` (when research is outdated)

### Trend Analysis States
- `pending` → `in_progress` (when analysis starts)
- `in_progress` → `completed` (when analysis finishes successfully)
- `in_progress` → `failed` (when analysis encounters error)
- `failed` → `pending` (when retrying analysis)

### Content Idea States
- `draft` → `in_progress` (when content creation starts)
- `in_progress` → `completed` (when content is finished)
- `completed` → `published` (when content is published)
- `published` → `archived` (when content is no longer relevant)

## Data Validation Rules

### Business Rules
1. Research topics must have unique titles per user
2. Topic decompositions must include the original topic as a subtopic
3. Trend analyses must be linked to valid subtopics
4. Content ideas must be linked to valid trend analyses
5. All timestamps must be in UTC
6. Version numbers must increment on updates

### Data Integrity Rules
1. Foreign key constraints ensure referential integrity
2. Check constraints ensure valid enum values
3. NOT NULL constraints ensure required fields are populated
4. Unique constraints prevent duplicate data
5. Default values ensure consistent data state

This data model provides a robust foundation for complete dataflow persistence while maintaining data integrity and supporting the full research workflow.
