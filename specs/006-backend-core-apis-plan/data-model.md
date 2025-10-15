# Data Model: Enhanced Research Workflow Integration

## New Entities

### TrendSelections
**Purpose**: Store user selections of trends for content generation workflow

**Fields**:
- `id` (Primary Key): Unique identifier
- `user_id` (Foreign Key): Reference to user
- `trend_analysis_id` (Foreign Key): Reference to trend analysis
- `trend_name` (String): Name of selected trend
- `trend_description` (Text): Description of trend
- `trend_category` (String): Category of trend
- `search_volume` (Integer): Search volume for trend
- `competition_level` (String): Competition level (low/medium/high)
- `source` (String): Source of trend (llm_analysis/csv_upload)
- `selected_at` (DateTime): When trend was selected
- `created_at` (DateTime): Record creation timestamp
- `updated_at` (DateTime): Record update timestamp

**Validation Rules**:
- `trend_name` is required and max 255 characters
- `trend_category` must be one of: technology, business, lifestyle, health, finance, entertainment
- `competition_level` must be one of: low, medium, high
- `source` must be one of: llm_analysis, csv_upload
- `search_volume` must be non-negative integer

**Relationships**:
- Belongs to User (many-to-one)
- Belongs to TrendAnalysis (many-to-one)

### KeywordClusters
**Purpose**: Store keyword clustering results for content strategy generation

**Fields**:
- `id` (Primary Key): Unique identifier
- `user_id` (Foreign Key): Reference to user
- `keyword_data_id` (Foreign Key): Reference to keyword data
- `cluster_name` (String): Name of cluster
- `cluster_description` (Text): Description of cluster
- `keywords` (JSON): Array of keywords in cluster
- `cluster_size` (Integer): Number of keywords in cluster
- `search_intent` (String): Primary search intent (informational/commercial/transactional)
- `content_theme` (String): Suggested content theme
- `priority_score` (Float): Priority score for content generation
- `created_at` (DateTime): Record creation timestamp
- `updated_at` (DateTime): Record update timestamp

**Validation Rules**:
- `cluster_name` is required and max 255 characters
- `keywords` must be non-empty JSON array
- `cluster_size` must be positive integer
- `search_intent` must be one of: informational, commercial, transactional
- `priority_score` must be between 0.0 and 1.0

**Relationships**:
- Belongs to User (many-to-one)
- Belongs to KeywordData (many-to-one)

### WorkflowSessions
**Purpose**: Track workflow progress and enable error recovery

**Fields**:
- `id` (Primary Key): Unique identifier
- `user_id` (Foreign Key): Reference to user
- `session_name` (String): Name of workflow session
- `current_step` (String): Current workflow step
- `progress_percentage` (Integer): Progress percentage (0-100)
- `workflow_data` (JSON): Workflow state data
- `completed_steps` (JSON): Array of completed steps
- `error_message` (Text): Last error message if any
- `status` (String): Session status (active/completed/failed/paused)
- `created_at` (DateTime): Session creation timestamp
- `updated_at` (DateTime): Session update timestamp
- `completed_at` (DateTime): Session completion timestamp

**Validation Rules**:
- `session_name` is required and max 255 characters
- `current_step` must be one of: upload_csv, select_trends, generate_keywords, export_keywords, upload_external, analyze_results
- `progress_percentage` must be between 0 and 100
- `status` must be one of: active, completed, failed, paused

**Relationships**:
- Belongs to User (many-to-one)

## Enhanced Entities

### KeywordData (Enhanced)
**Purpose**: Extend existing keyword data with external tool source tracking

**New Fields**:
- `external_tool_source` (String): Source of keyword data (dataforseo/ahrefs/semrush/ubersuggest)
- `external_tool_metrics` (JSON): Additional metrics from external tool
- `cluster_id` (Foreign Key): Reference to keyword cluster

**Validation Rules**:
- `external_tool_source` must be one of: dataforseo, ahrefs, semrush, ubersuggest, manual
- `external_tool_metrics` must be valid JSON object

### TrendAnalysis (Enhanced)
**Purpose**: Extend existing trend analysis with CSV upload support

**New Fields**:
- `csv_upload_id` (String): Reference to uploaded CSV file
- `csv_columns` (JSON): Column mapping for CSV data
- `csv_row_count` (Integer): Number of rows in CSV
- `csv_processing_status` (String): Status of CSV processing

**Validation Rules**:
- `csv_upload_id` must be valid UUID if provided
- `csv_columns` must be valid JSON object if provided
- `csv_row_count` must be non-negative integer
- `csv_processing_status` must be one of: pending, processing, completed, failed

## State Transitions

### WorkflowSession Status Transitions
```
created → active → completed
  ↓        ↓         ↑
  └──→ failed ←──────┘
  ↓
paused → active
```

### CSV Processing Status Transitions
```
pending → processing → completed
  ↓          ↓           ↑
  └──→ failed ←──────────┘
```

## Data Relationships

```
User
├── TrendSelections (1:N)
├── KeywordClusters (1:N)
├── WorkflowSessions (1:N)
├── TrendAnalysis (1:N) [existing]
└── KeywordData (1:N) [existing]

TrendAnalysis
├── TrendSelections (1:N)
└── KeywordData (1:N) [existing]

KeywordData
└── KeywordClusters (1:N)

WorkflowSession
├── TrendAnalysis (1:1) [via workflow_data]
└── KeywordData (1:N) [via workflow_data]
```

## Indexes

### Performance Indexes
- `trend_selections_user_id_idx` on `trend_selections(user_id)`
- `trend_selections_trend_analysis_id_idx` on `trend_selections(trend_analysis_id)`
- `keyword_clusters_user_id_idx` on `keyword_clusters(user_id)`
- `keyword_clusters_keyword_data_id_idx` on `keyword_clusters(keyword_data_id)`
- `workflow_sessions_user_id_idx` on `workflow_sessions(user_id)`
- `workflow_sessions_status_idx` on `workflow_sessions(status)`

### Composite Indexes
- `trend_selections_user_trend_idx` on `trend_selections(user_id, trend_analysis_id)`
- `keyword_clusters_user_keyword_idx` on `keyword_clusters(user_id, keyword_data_id)`