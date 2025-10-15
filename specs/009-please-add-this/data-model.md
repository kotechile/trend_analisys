# Data Model: Google Autocomplete Integration

## Core Entities

### EnhancedSubtopic
Represents a topic subdivision enhanced with autocomplete validation and relevance scoring.

**Fields**:
- `id: string` - Unique identifier
- `title: string` - The subtopic title/name
- `search_volume_indicators: string[]` - Metrics indicating search popularity
- `autocomplete_suggestions: string[]` - Related search suggestions from Google
- `relevance_score: number` - Calculated relevance score (0.0-1.0)
- `source: string` - Data source: 'llm', 'autocomplete', or 'hybrid'
- `created_at: datetime` - Creation timestamp
- `updated_at: datetime` - Last update timestamp

**Validation Rules**:
- `title` must be non-empty and between 3-100 characters
- `relevance_score` must be between 0.0 and 1.0
- `source` must be one of: 'llm', 'autocomplete', 'hybrid'
- `search_volume_indicators` must be non-empty array
- `autocomplete_suggestions` must be array of non-empty strings

**State Transitions**:
- `created` → `enhanced` (when autocomplete data added)
- `enhanced` → `validated` (when user confirms selection)

### AutocompleteResult
Represents the response from Google Autocomplete API for a specific query.

**Fields**:
- `query: string` - Original search query
- `suggestions: string[]` - List of autocomplete suggestions
- `total_suggestions: number` - Count of suggestions returned
- `processing_time: number` - Time taken to fetch suggestions (seconds)
- `timestamp: datetime` - When the request was made
- `success: boolean` - Whether the request was successful
- `error_message?: string` - Error details if request failed

**Validation Rules**:
- `query` must be non-empty and between 1-200 characters
- `suggestions` must be array of non-empty strings
- `total_suggestions` must equal length of suggestions array
- `processing_time` must be positive number
- `success` must be boolean

**State Transitions**:
- `pending` → `success` (when API returns data)
- `pending` → `failed` (when API fails)
- `success` → `cached` (when result is cached)

### MethodComparison
Represents side-by-side analysis of different decomposition approaches.

**Fields**:
- `id: string` - Unique identifier
- `original_query: string` - The topic being analyzed
- `llm_only_results: EnhancedSubtopic[]` - Results from LLM-only approach
- `autocomplete_only_results: EnhancedSubtopic[]` - Results from autocomplete-only approach
- `hybrid_results: EnhancedSubtopic[]` - Results from hybrid approach
- `comparison_metrics: ComparisonMetrics` - Performance and quality metrics
- `created_at: datetime` - Creation timestamp

**Validation Rules**:
- `original_query` must be non-empty
- All results arrays must contain valid EnhancedSubtopic objects
- `comparison_metrics` must be valid ComparisonMetrics object

### ComparisonMetrics
Represents performance and quality metrics for method comparison.

**Fields**:
- `llm_processing_time: number` - Time for LLM-only approach
- `autocomplete_processing_time: number` - Time for autocomplete-only approach
- `hybrid_processing_time: number` - Time for hybrid approach
- `llm_relevance_avg: number` - Average relevance score for LLM results
- `autocomplete_relevance_avg: number` - Average relevance score for autocomplete results
- `hybrid_relevance_avg: number` - Average relevance score for hybrid results
- `total_suggestions_found: number` - Total unique suggestions across all methods

**Validation Rules**:
- All processing times must be positive numbers
- All relevance averages must be between 0.0 and 1.0
- `total_suggestions_found` must be non-negative integer

### SearchVolumeIndicator
Represents metrics derived from autocomplete data that suggest topic popularity.

**Fields**:
- `indicator_type: string` - Type of indicator (e.g., 'high_search_volume', 'trending', 'commercial_intent')
- `confidence_level: number` - Confidence in the indicator (0.0-1.0)
- `description: string` - Human-readable description of the indicator
- `source_data: string[]` - Raw data that led to this indicator

**Validation Rules**:
- `indicator_type` must be one of: 'high_search_volume', 'trending', 'commercial_intent', 'low_competition'
- `confidence_level` must be between 0.0 and 1.0
- `description` must be non-empty string
- `source_data` must be non-empty array

## Entity Relationships

### EnhancedSubtopic Relationships
- **Belongs to**: TopicDecomposition (many-to-one)
- **Has many**: SearchVolumeIndicator (one-to-many)
- **References**: AutocompleteResult (many-to-one, optional)

### AutocompleteResult Relationships
- **Has many**: EnhancedSubtopic (one-to-many)
- **Belongs to**: TopicDecomposition (many-to-one)

### MethodComparison Relationships
- **Contains**: EnhancedSubtopic (one-to-many, three collections)
- **Belongs to**: TopicDecomposition (one-to-one)

## Data Flow

### 1. Topic Decomposition Request
```
User Input → EnhancedTopicDecompositionService → Google Autocomplete API
                                                      ↓
LLM Processing ← Enhanced Prompt (with autocomplete context)
                                                      ↓
Hybrid Enhancement → EnhancedSubtopic[] → User Selection
```

### 2. Method Comparison Request
```
User Input → Parallel Processing:
├── LLM-only decomposition
├── Autocomplete-only decomposition  
└── Hybrid decomposition
                    ↓
MethodComparison → ComparisonMetrics → User Review
```

### 3. Caching Strategy
```
AutocompleteResult → In-memory cache (TTL: 1 hour)
EnhancedSubtopic → Database persistence
MethodComparison → Database persistence (TTL: 24 hours)
```

## Validation Rules

### Input Validation
- All user inputs must be sanitized and validated
- Query length limits: 1-200 characters
- Rate limiting: Max 10 requests per minute per user
- Timeout limits: 10 seconds per autocomplete request

### Data Quality Rules
- Minimum 3 suggestions required for valid autocomplete result
- Relevance scores must be calculated consistently
- Source attribution must be accurate and traceable
- Error states must be properly handled and logged

### Business Rules
- Hybrid approach always preferred when both sources available
- Fallback to LLM-only when autocomplete fails
- User selection overrides automatic scoring
- Method comparison available for all decomposition requests

## Performance Considerations

### Caching Strategy
- **AutocompleteResult**: 1 hour TTL, LRU eviction
- **EnhancedSubtopic**: Persistent storage, indexed by query
- **MethodComparison**: 24 hour TTL, user-specific

### Indexing Requirements
- `EnhancedSubtopic.title` - Full-text search index
- `EnhancedSubtopic.relevance_score` - Descending order index
- `AutocompleteResult.query` - Exact match index
- `MethodComparison.original_query` - Full-text search index

### Query Optimization
- Batch autocomplete requests where possible
- Parallel processing for method comparison
- Lazy loading for large suggestion lists
- Pagination for result sets > 50 items

## Security Considerations

### Data Privacy
- No personal information stored in autocomplete results
- Query sanitization to prevent injection attacks
- Rate limiting to prevent abuse

### API Security
- User agent rotation to avoid detection
- Request timeout and retry limits
- Error message sanitization
- Input validation and sanitization

### Access Control
- User-specific result caching
- Session-based rate limiting
- Audit logging for all requests
- Error monitoring and alerting

