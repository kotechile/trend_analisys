# Data Model: Trend Analysis & Content Generation Platform

## Entity Overview

The platform manages six core entities that represent the complete content creation workflow from affiliate research to content generation.

## Core Entities

### 1. User
**Purpose**: Represents content creators using the platform
**Key Attributes**:
- `id`: UUID (Primary Key)
- `email`: String (Unique, Required)
- `full_name`: String (Required)
- `password_hash`: String (Required, Encrypted)
- `email_verified`: Boolean (Default: false)
- `profile_data`: JSONB (Optional user preferences)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `last_login`: Timestamp (Optional)

**Validation Rules**:
- Email must be valid format
- Password must meet security requirements (min 8 chars, complexity)
- Full name must be 2-100 characters

**Relationships**:
- One-to-Many with AffiliateResearch
- One-to-Many with TrendAnalysis
- One-to-Many with KeywordData
- One-to-Many with ContentIdeas

### 2. AffiliateResearch
**Purpose**: Represents research sessions for finding affiliate programs
**Key Attributes**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `topic`: String (Required, 3-200 characters)
- `status`: Enum (pending, completed, failed)
- `search_query`: String (Optional, refined search terms)
- `results`: JSONB (Affiliate program data)
- `metadata`: JSONB (Search parameters, filters applied)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `completed_at`: Timestamp (Optional)

**Validation Rules**:
- Topic must be 3-200 characters
- Status must be valid enum value
- Results must be valid JSON structure

**Relationships**:
- Many-to-One with User
- One-to-Many with TrendAnalysis

### 3. TrendAnalysis
**Purpose**: Represents trend analysis sessions with topics, trend data, and LLM-generated insights
**Key Attributes**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `affiliate_research_id`: UUID (Foreign Key to AffiliateResearch, Optional)
- `topics`: JSONB (Array of topics to analyze)
- `trend_data`: JSONB (Raw trend data from APIs)
- `llm_analysis`: JSONB (LLM-generated insights and analysis)
- `sub_topics`: JSONB (Identified sub-topics)
- `content_opportunities`: JSONB (Identified content opportunities)
- `market_insights`: JSONB (Competitive analysis and insights)
- `status`: Enum (pending, processing, completed, failed)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `completed_at`: Timestamp (Optional)

**Validation Rules**:
- Topics must be non-empty array
- Status must be valid enum value
- All JSONB fields must be valid JSON structures

**Relationships**:
- Many-to-One with User
- Many-to-One with AffiliateResearch
- One-to-Many with KeywordData

### 4. KeywordData
**Purpose**: Represents keyword research data including search volumes, difficulties, and selected keywords
**Key Attributes**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `trend_analysis_id`: UUID (Foreign Key to TrendAnalysis, Optional)
- `keywords`: JSONB (Array of keyword objects)
- `search_volumes`: JSONB (Search volume data)
- `difficulties`: JSONB (Keyword difficulty scores)
- `selected_keywords`: JSONB (User-selected keywords)
- `performance_metrics`: JSONB (Keyword performance data)
- `upload_source`: Enum (file_upload, manual_entry, api_import)
- `file_name`: String (Optional, original filename)
- `status`: Enum (pending, processing, completed, failed)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Validation Rules**:
- Keywords must be non-empty array
- Search volumes and difficulties must be valid JSON structures
- Upload source must be valid enum value

**Relationships**:
- Many-to-One with User
- Many-to-One with TrendAnalysis
- One-to-Many with ContentIdeas

### 5. ContentIdeas
**Purpose**: Represents generated content ideas with titles, outlines, SEO recommendations, and scheduling information
**Key Attributes**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `keyword_data_id`: UUID (Foreign Key to KeywordData, Optional)
- `ideas`: JSONB (Array of content idea objects)
- `titles`: JSONB (Generated title suggestions)
- `outlines`: JSONB (Content outlines and structure)
- `seo_recommendations`: JSONB (SEO optimization suggestions)
- `target_audience`: JSONB (Audience profiles and personas)
- `content_type`: Enum (article, guide, review, tutorial, listicle)
- `priority_score`: Float (0.0-1.0, content priority ranking)
- `status`: Enum (draft, scheduled, published, archived)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Validation Rules**:
- Ideas must be non-empty array
- Priority score must be between 0.0 and 1.0
- Content type must be valid enum value
- All JSONB fields must be valid JSON structures

**Relationships**:
- Many-to-One with User
- Many-to-One with KeywordData
- One-to-Many with ContentCalendar

### 6. ContentCalendar
**Purpose**: Represents scheduled content with deadlines, status, and publishing information
**Key Attributes**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `content_idea_id`: UUID (Foreign Key to ContentIdeas)
- `scheduled_date`: Date (Required)
- `scheduled_time`: Time (Optional)
- `publishing_platform`: String (Optional, e.g., "WordPress", "Medium")
- `publishing_url`: String (Optional)
- `status`: Enum (scheduled, in_progress, published, cancelled)
- `notes`: Text (Optional, user notes)
- `reminder_sent`: Boolean (Default: false)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `published_at`: Timestamp (Optional)

**Validation Rules**:
- Scheduled date must be in the future
- Status must be valid enum value
- Publishing URL must be valid URL format if provided

**Relationships**:
- Many-to-One with User
- Many-to-One with ContentIdeas

## Database Schema Design

### Table Creation Order
1. `users` (no dependencies)
2. `affiliate_research` (depends on users)
3. `trend_analysis` (depends on users, affiliate_research)
4. `keyword_data` (depends on users, trend_analysis)
5. `content_ideas` (depends on users, keyword_data)
6. `content_calendar` (depends on users, content_ideas)

### Indexes
- `users.email` (Unique index)
- `affiliate_research.user_id` (Foreign key index)
- `affiliate_research.topic` (Search index)
- `trend_analysis.user_id` (Foreign key index)
- `trend_analysis.affiliate_research_id` (Foreign key index)
- `keyword_data.user_id` (Foreign key index)
- `keyword_data.trend_analysis_id` (Foreign key index)
- `content_ideas.user_id` (Foreign key index)
- `content_ideas.keyword_data_id` (Foreign key index)
- `content_calendar.user_id` (Foreign key index)
- `content_calendar.content_idea_id` (Foreign key index)
- `content_calendar.scheduled_date` (Date range queries)

### Row Level Security (RLS) Policies
- All tables have RLS enabled
- Users can only access their own data
- Admin users can access all data
- Service accounts have limited access

## Data Validation Rules

### User Data
- Email: Valid email format, unique across platform
- Password: Minimum 8 characters, must contain uppercase, lowercase, number, special character
- Full name: 2-100 characters, no special characters except spaces and hyphens

### Affiliate Research
- Topic: 3-200 characters, no HTML tags
- Status: Must be one of: pending, completed, failed
- Results: Must be valid JSON with required fields

### Trend Analysis
- Topics: Non-empty array, each topic 3-200 characters
- Status: Must be one of: pending, processing, completed, failed
- All JSONB fields: Must be valid JSON structures

### Keyword Data
- Keywords: Non-empty array, each keyword 1-100 characters
- Upload source: Must be one of: file_upload, manual_entry, api_import
- Status: Must be one of: pending, processing, completed, failed

### Content Ideas
- Ideas: Non-empty array with required fields
- Priority score: Float between 0.0 and 1.0
- Content type: Must be one of: article, guide, review, tutorial, listicle
- Status: Must be one of: draft, scheduled, published, archived

### Content Calendar
- Scheduled date: Must be in the future
- Status: Must be one of: scheduled, in_progress, published, cancelled
- Publishing URL: Must be valid URL format if provided

## State Transitions

### Affiliate Research Status
- `pending` → `completed` (research successful)
- `pending` → `failed` (research failed)
- `failed` → `pending` (retry research)

### Trend Analysis Status
- `pending` → `processing` (analysis started)
- `processing` → `completed` (analysis successful)
- `processing` → `failed` (analysis failed)
- `failed` → `pending` (retry analysis)

### Keyword Data Status
- `pending` → `processing` (data processing started)
- `processing` → `completed` (processing successful)
- `processing` → `failed` (processing failed)
- `failed` → `pending` (retry processing)

### Content Ideas Status
- `draft` → `scheduled` (content scheduled)
- `scheduled` → `published` (content published)
- `scheduled` → `draft` (content unscheduled)
- `published` → `archived` (content archived)

### Content Calendar Status
- `scheduled` → `in_progress` (content being worked on)
- `in_progress` → `published` (content published)
- `scheduled` → `cancelled` (content cancelled)
- `in_progress` → `cancelled` (content cancelled)

## Data Relationships Summary

```
User (1) ──→ (M) AffiliateResearch
User (1) ──→ (M) TrendAnalysis
User (1) ──→ (M) KeywordData
User (1) ──→ (M) ContentIdeas
User (1) ──→ (M) ContentCalendar

AffiliateResearch (1) ──→ (M) TrendAnalysis
TrendAnalysis (1) ──→ (M) KeywordData
KeywordData (1) ──→ (M) ContentIdeas
ContentIdeas (1) ──→ (M) ContentCalendar
```

## Performance Considerations

### Query Optimization
- Use proper indexes for foreign keys and search fields
- Implement pagination for large result sets
- Use database views for complex queries
- Optimize JSONB queries with GIN indexes

### Data Archiving
- Archive old completed analyses after 1 year
- Archive cancelled content calendar entries after 6 months
- Implement soft delete for user data
- Regular cleanup of temporary data

### Caching Strategy
- Cache frequently accessed user data
- Cache trend analysis results for 24 hours
- Cache affiliate research results for 7 days
- Implement Redis for session and temporary data
