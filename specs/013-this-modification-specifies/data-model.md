# Data Model: DataForSEO API Integration

**Feature**: DataForSEO API Integration for Enhanced Trend Analysis and Keyword Research  
**Date**: 2025-01-14  
**Phase**: 1 - Design & Contracts

## Core Entities

### 1. TrendData
Represents keyword popularity trends over time and regional data from DataForSEO Trends API.

**Fields**:
- `keyword` (string, required): The keyword being analyzed
- `location` (string, required): Geographic location (e.g., "United States", "United Kingdom")
- `time_series` (array, required): Array of time-series data points
  - `date` (string, ISO 8601): Date of the data point
  - `value` (number): Search interest value (0-100 scale)
- `demographics` (object, optional): Demographic breakdown
  - `age_groups` (array): Age group data
  - `gender` (object): Gender distribution
- `related_queries` (array, optional): Related trending queries
- `created_at` (datetime): When the data was fetched
- `updated_at` (datetime): When the data was last updated

**Validation Rules**:
- `keyword` must not be empty and max 100 characters
- `location` must be a valid country name
- `time_series` must have at least 1 data point
- `value` in time_series must be between 0 and 100
- `date` must be valid ISO 8601 format

**State Transitions**:
- `pending` → `fetched` → `cached` → `expired` → `refreshed`

### 2. KeywordData
Represents keyword research data from DataForSEO Labs API.

**Fields**:
- `keyword` (string, required): The keyword being analyzed
- `search_volume` (number, optional): Monthly search volume
- `keyword_difficulty` (number, optional): Difficulty score (0-100)
- `cpc` (number, optional): Cost per click in USD
- `competition` (number, optional): Competition level (0-1)
- `competition_level` (string, optional): "LOW", "MEDIUM", "HIGH"
- `trends` (object, optional): 12-month trend data
  - `monthly_data` (array): Monthly search volume data
  - `trend_direction` (string): "RISING", "FALLING", "STABLE"
  - `trend_percentage` (number): Percentage change over 12 months
- `related_keywords` (array, optional): Related keyword suggestions
- `intent` (string, optional): Commercial intent ("INFORMATIONAL", "COMMERCIAL", "TRANSACTIONAL")
- `created_at` (datetime): When the data was fetched
- `updated_at` (datetime): When the data was last updated

**Validation Rules**:
- `keyword` must not be empty and max 100 characters
- `search_volume` must be non-negative integer
- `keyword_difficulty` must be between 0 and 100
- `cpc` must be non-negative number
- `competition` must be between 0 and 1
- `trend_percentage` must be a valid number

**State Transitions**:
- `pending` → `fetched` → `cached` → `expired` → `refreshed`

### 3. SubtopicData
Represents subtopics from affiliate research that serve as input for trend analysis.

**Fields**:
- `id` (string, required): Unique identifier
- `topic` (string, required): The subtopic name
- `source` (string, required): Source of the subtopic ("affiliate_research")
- `trend_data` (TrendData, optional): Associated trend data
- `related_subtopics` (array, optional): Related subtopic suggestions
- `trending_status` (string, optional): "TRENDING", "STABLE", "DECLINING"
- `growth_potential` (number, optional): Growth potential score (0-100)
- `created_at` (datetime): When the subtopic was created
- `updated_at` (datetime): When the subtopic was last updated

**Validation Rules**:
- `topic` must not be empty and max 200 characters
- `source` must be one of: "affiliate_research", "user_input", "api_suggestion"
- `trending_status` must be one of: "TRENDING", "STABLE", "DECLINING"
- `growth_potential` must be between 0 and 100

**State Transitions**:
- `created` → `analyzing` → `analyzed` → `suggested` → `accepted`/`rejected`

### 4. SeedKeywordData
Represents seed keywords from Idea Burst module for keyword research expansion.

**Fields**:
- `id` (string, required): Unique identifier
- `keyword` (string, required): The seed keyword
- `source` (string, required): Source of the keyword ("idea_burst", "user_input")
- `max_difficulty` (number, optional): Maximum keyword difficulty threshold
- `generated_keywords` (array, optional): Generated keyword suggestions
- `filters` (object, optional): Applied filters
  - `min_volume` (number): Minimum search volume
  - `max_difficulty` (number): Maximum keyword difficulty
  - `intent_types` (array): Allowed intent types
- `created_at` (datetime): When the keyword was created
- `updated_at` (datetime): When the keyword was last updated

**Validation Rules**:
- `keyword` must not be empty and max 100 characters
- `source` must be one of: "idea_burst", "user_input"
- `max_difficulty` must be between 0 and 100
- `min_volume` must be non-negative integer

**State Transitions**:
- `created` → `processing` → `generated` → `filtered` → `prioritized`

### 5. APICredentials
Represents DataForSEO API configuration stored in Supabase.

**Fields**:
- `id` (string, required): Unique identifier
- `provider` (string, required): API provider ("dataforseo")
- `base_url` (string, required): API base URL
- `key_value` (string, required): API key (encrypted)
- `is_active` (boolean, required): Whether the credentials are active
- `rate_limit` (number, optional): Rate limit per minute
- `quota_used` (number, optional): Quota used this month
- `quota_limit` (number, optional): Monthly quota limit
- `created_at` (datetime): When the credentials were created
- `updated_at` (datetime): When the credentials were last updated

**Validation Rules**:
- `provider` must be "dataforseo"
- `base_url` must be a valid URL
- `key_value` must not be empty
- `is_active` must be boolean
- `rate_limit` must be positive integer

**State Transitions**:
- `created` → `active` → `rate_limited` → `quota_exceeded` → `inactive`

## Relationships

### One-to-Many Relationships
- `SubtopicData` → `TrendData`: One subtopic can have multiple trend data points
- `SeedKeywordData` → `KeywordData`: One seed keyword can generate multiple keyword suggestions
- `APICredentials` → `TrendData`: API credentials used to fetch trend data
- `APICredentials` → `KeywordData`: API credentials used to fetch keyword data

### Many-to-Many Relationships
- `SubtopicData` ↔ `SubtopicData`: Subtopics can be related to other subtopics
- `KeywordData` ↔ `KeywordData`: Keywords can be related to other keywords

## Data Validation Rules

### Global Validation
1. All string fields must be trimmed and non-empty
2. All datetime fields must be valid ISO 8601 format
3. All numeric fields must be within specified ranges
4. All required fields must be present
5. All enum fields must match allowed values

### Business Logic Validation
1. `TrendData.value` must be between 0 and 100 (DataForSEO scale)
2. `KeywordData.keyword_difficulty` must be between 0 and 100
3. `KeywordData.competition` must be between 0 and 1
4. `SubtopicData.growth_potential` must be between 0 and 100
5. `SeedKeywordData.max_difficulty` must be between 0 and 100

## Data Storage Strategy

### Primary Storage
- **Supabase PostgreSQL**: All entities stored in normalized tables
- **Redis**: Cached API responses with TTL
- **File System**: Backup files for non-deletion compliance

### Caching Strategy
- **TrendData**: 24-hour TTL (daily updates sufficient)
- **KeywordData**: 6-hour TTL (more frequent updates needed)
- **API Errors**: 5-minute TTL (quick retry for transient errors)

### Backup Strategy
- **Database**: Automated daily backups via Supabase
- **Code**: Git-based version control
- **Configuration**: Environment variable backups

## Data Migration Strategy

### Phase 1: Backup Creation
1. Create timestamped backups of existing pages
2. Export current data to backup files
3. Verify backup integrity

### Phase 2: Schema Updates
1. Add new tables for DataForSEO entities
2. Create indexes for performance
3. Set up foreign key constraints

### Phase 3: Data Population
1. Migrate existing subtopics to new schema
2. Populate seed keywords from Idea Burst
3. Validate data integrity

### Phase 4: API Integration
1. Implement API client services
2. Create data fetching workflows
3. Set up error handling and retry logic

## Performance Considerations

### Database Indexes
- `TrendData.keyword` (for keyword lookups)
- `TrendData.location` (for regional filtering)
- `KeywordData.keyword` (for keyword searches)
- `KeywordData.keyword_difficulty` (for difficulty filtering)
- `SubtopicData.topic` (for topic searches)

### Query Optimization
- Use prepared statements for repeated queries
- Implement pagination for large result sets
- Use database views for complex aggregations
- Cache frequently accessed data

### API Rate Limiting
- Implement exponential backoff for rate-limited requests
- Use connection pooling for concurrent requests
- Monitor API usage and quota consumption
- Implement circuit breaker pattern for API failures
