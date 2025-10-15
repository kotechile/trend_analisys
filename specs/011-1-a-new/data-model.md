# Data Model: Keyword Analysis with Ahrefs Data

## Core Entities

### Keyword
**Purpose**: Represents an individual keyword with its metrics and analysis results

**Attributes**:
- `id`: UUID (primary key)
- `keyword`: string (the actual keyword phrase)
- `search_volume`: integer (monthly search volume)
- `keyword_difficulty`: float (0-100 difficulty score)
- `cpc`: float (cost per click in USD, nullable)
- `search_intent`: string (parsed from Ahrefs comma-separated tags)
- `primary_intent`: string (mapped to: Informational, Commercial, Navigational, Transactional)
- `opportunity_score`: float (0-100 calculated score)
- `category`: string (High, Medium, Low opportunity)
- `created_at`: timestamp
- `updated_at`: timestamp

**Validation Rules**:
- `search_volume` >= 0
- `keyword_difficulty` between 0 and 100
- `cpc` >= 0 (nullable for missing data)
- `primary_intent` must be one of: Informational, Commercial, Navigational, Transactional
- `opportunity_score` between 0 and 100

**State Transitions**:
- Created → Analyzed (when opportunity score is calculated)
- Analyzed → Categorized (when category is assigned)

### KeywordAnalysisReport
**Purpose**: Contains the complete analysis results for a set of keywords

**Attributes**:
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users)
- `filename`: string (original uploaded filename)
- `total_keywords`: integer (number of keywords analyzed)
- `high_opportunity_count`: integer (keywords in High category)
- `medium_opportunity_count`: integer (keywords in Medium category)
- `low_opportunity_count`: integer (keywords in Low category)
- `total_search_volume`: integer (sum of all search volumes)
- `average_difficulty`: float (mean keyword difficulty)
- `average_cpc`: float (mean CPC across keywords)
- `created_at`: timestamp
- `updated_at`: timestamp
- `expires_at`: timestamp (90 days from creation)

**Validation Rules**:
- `total_keywords` > 0
- `high_opportunity_count` + `medium_opportunity_count` + `low_opportunity_count` = `total_keywords`
- `total_search_volume` >= 0
- `average_difficulty` between 0 and 100
- `average_cpc` >= 0
- `expires_at` = `created_at` + 90 days

### ContentOpportunity
**Purpose**: Links keywords to content ideas with SEO optimization scores

**Attributes**:
- `id`: UUID (primary key)
- `keyword_id`: UUID (foreign key to Keyword)
- `report_id`: UUID (foreign key to KeywordAnalysisReport)
- `content_format`: string (suggested content type)
- `seo_score`: float (0-100 SEO optimization score)
- `priority_rank`: integer (ranking within report)
- `content_suggestion`: text (specific content idea)
- `created_at`: timestamp

**Validation Rules**:
- `content_format` must be one of: how-to-guide, comparison-post, list-article, beginner-guide, tool-review
- `seo_score` between 0 and 100
- `priority_rank` > 0

**Relationships**:
- Belongs to Keyword (many-to-one)
- Belongs to KeywordAnalysisReport (many-to-one)

### SEOContentIdea
**Purpose**: Enhanced content idea with intelligent keyword selection and optimization guidance

**Attributes**:
- `id`: UUID (primary key)
- `report_id`: UUID (foreign key to KeywordAnalysisReport)
- `title`: string (content idea title)
- `content_type`: string (article, software review, comparison, etc.)
- `primary_keywords`: array of strings (5-10 main target keywords)
- `secondary_keywords`: array of strings (supporting terms)
- `seo_optimization_score`: float (0-100 SEO optimization score)
- `traffic_potential_score`: float (0-100 traffic potential score)
- `total_search_volume`: integer (combined search volume of selected keywords)
- `average_difficulty`: float (average difficulty of selected keywords)
- `average_cpc`: float (average CPC of selected keywords)
- `optimization_tips`: array of strings (actionable optimization guidance)
- `content_outline`: text (suggested content structure)
- `created_at`: timestamp

**Validation Rules**:
- `primary_keywords` must contain 5-10 keywords
- `secondary_keywords` must contain 3-8 keywords
- `seo_optimization_score` between 0 and 100
- `traffic_potential_score` between 0 and 100
- `total_search_volume` >= 0
- `average_difficulty` between 0 and 100
- `average_cpc` >= 0

**Relationships**:
- Belongs to KeywordAnalysisReport (many-to-one)
- References multiple Keywords (many-to-many via primary_keywords and secondary_keywords)

### AhrefsExportFile
**Purpose**: Represents the uploaded file and its metadata

**Attributes**:
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users)
- `filename`: string (original filename)
- `file_size`: integer (size in bytes)
- `file_type`: string (MIME type)
- `upload_status`: string (pending, processing, completed, failed)
- `processing_started_at`: timestamp
- `processing_completed_at`: timestamp
- `error_message`: text (if processing failed)
- `created_at`: timestamp

**Validation Rules**:
- `file_size` > 0 and <= 10MB
- `file_type` must be 'text/tab-separated-values' or 'text/plain'
- `upload_status` must be one of: pending, processing, completed, failed

**State Transitions**:
- pending → processing (when analysis starts)
- processing → completed (when analysis succeeds)
- processing → failed (when analysis fails)

## Relationships

### Primary Relationships
- **User** → **KeywordAnalysisReport** (one-to-many)
- **KeywordAnalysisReport** → **Keyword** (one-to-many)
- **KeywordAnalysisReport** → **ContentOpportunity** (one-to-many)
- **Keyword** → **ContentOpportunity** (one-to-many)
- **User** → **AhrefsExportFile** (one-to-many)

### Secondary Relationships
- **KeywordAnalysisReport** → **AhrefsExportFile** (one-to-one, via user_id and filename)

## Data Flow

1. **File Upload**: AhrefsExportFile created with pending status
2. **File Processing**: Status changes to processing, keywords extracted from TSV
3. **Analysis**: Keywords analyzed, opportunity scores calculated, intent tags parsed
4. **Report Generation**: KeywordAnalysisReport created with summary statistics
5. **Content Opportunities**: ContentOpportunity records created for high-priority keywords
6. **Completion**: AhrefsExportFile status updated to completed

## Indexes and Performance

### Recommended Indexes
- `keywords.keyword` (for search functionality)
- `keywords.opportunity_score` (for sorting and filtering)
- `keywords.category` (for filtering by opportunity level)
- `keywords.primary_intent` (for intent-based filtering)
- `keyword_analysis_reports.user_id` (for user-specific queries)
- `keyword_analysis_reports.created_at` (for chronological queries)
- `keyword_analysis_reports.expires_at` (for cleanup queries)

### Performance Considerations
- Batch insert keywords for large datasets
- Use database transactions for report generation
- Implement pagination for keyword lists
- Cache frequently accessed report summaries
- Schedule cleanup job for expired reports (90-day retention)

## Intent Mapping Logic

### Ahrefs Intent Tags → Primary Intent
- "Informational" → Informational
- "Commercial" → Commercial  
- "Navigational" → Navigational
- "Transactional" → Transactional
- Default (if no match) → Informational

### Intent Tag Parsing
1. Split comma-separated tags from Ahrefs
2. Map first tag to primary intent category
3. Store full intent string for reference
4. Handle missing or malformed intent data gracefully