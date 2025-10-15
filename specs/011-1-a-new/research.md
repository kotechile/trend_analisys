# Research: Keyword Analysis with Ahrefs Data

## Research Objectives
- Determine optimal TSV parsing approach for Ahrefs export format
- Research best practices for keyword scoring algorithms
- Identify performance optimization strategies for large datasets
- Define content recommendation patterns
- Map Ahrefs intent tags to standard categories

## Key Research Areas

### 1. Ahrefs TSV Export Format Analysis
**Decision**: Support TSV format with specific Ahrefs columns (Keyword, Volume, Difficulty, CPC, Intents)
**Rationale**: Based on sample file analysis, Ahrefs exports use tab-separated values with specific column names and comma-separated intent tags
**Alternatives considered**: CSV parsing, JSON format - TSV chosen for exact Ahrefs compatibility

### 2. Keyword Scoring Algorithm Research
**Decision**: Weighted scoring system with normalized values (0-100 scale)
**Rationale**: 
- Search Volume (40%): Higher volume = more traffic potential
- Keyword Difficulty (30%): Lower difficulty = easier ranking
- CPC (20%): Higher CPC = commercial value
- Search Intent (10%): Informational intent preferred for content
**Alternatives considered**: Simple ranking, machine learning models - weighted approach chosen for interpretability

### 3. Performance Optimization for Large Datasets
**Decision**: Pandas-based processing with chunked file reading for files >10MB
**Rationale**: Pandas provides efficient data manipulation for numerical analysis with TSV support
**Alternatives considered**: 
- Pure Python loops (too slow for large datasets)
- Database processing (overkill for analysis)
- Streaming processing (complex for scoring algorithms)

### 4. Content Recommendation Patterns
**Decision**: Rule-based pattern matching for content format suggestions
**Rationale**: 
- "How to" keywords → How-to Guides
- "vs" or "vs" keywords → Comparison Posts  
- "best" or "top" keywords → List Articles
- "beginner" keywords → Beginner Guides
- Tool names → Tool Reviews
**Alternatives considered**: ML-based classification - rule-based chosen for simplicity and accuracy

### 4.1. Enhanced SEO Content Idea Generation
**Decision**: Intelligent keyword selection with primary/secondary categorization and optimization guidance
**Rationale**: 
- Select 5-10 best keywords as primary targets based on opportunity scores
- Choose 3-8 supporting secondary keywords for content depth
- Calculate SEO and traffic potential scores based on selected keyword metrics
- Generate actionable optimization tips for title, headings, and content structure
- Inject keyword-specific data (search volume, difficulty, CPC) into content ideas
**Alternatives considered**: 
- Simple keyword lists (lacks optimization guidance)
- Manual keyword selection (not scalable)
- Generic content suggestions (not SEO-optimized)

### 5. Intent Tag Mapping Strategy
**Decision**: Map Ahrefs comma-separated tags to primary intent categories
**Rationale**: 
- Ahrefs format: "Informational,Commercial,Non-branded,Non-local"
- System needs: "Informational", "Commercial", "Navigational", "Transactional"
- Mapping logic: Prioritize first intent tag, fallback to "Informational"
**Alternatives considered**: 
- Use all tags (too complex)
- Ignore intent (loses valuable data)
- Manual mapping (not scalable)

### 6. File Upload and Processing Strategy
**Decision**: Direct file upload to backend with immediate processing
**Rationale**: Simpler architecture, better user experience with immediate feedback
**Alternatives considered**: 
- Async processing with job queues (overkill for current scale)
- Client-side processing (limited by browser capabilities)

### 7. Data Storage Strategy
**Decision**: Store analysis results in Supabase with user association and 90-day retention
**Rationale**: Enables result persistence, sharing, and historical analysis with automatic cleanup
**Alternatives considered**: 
- In-memory only (loses results on refresh)
- File-based storage (less structured)
- Permanent storage (privacy concerns)

## Technical Decisions Summary

| Component | Decision | Rationale |
|-----------|----------|-----------|
| File Format | TSV parsing with pandas | Exact Ahrefs compatibility, efficient processing |
| Scoring | Weighted algorithm (40/30/20/10) | Balanced approach, interpretable results |
| Processing | Pandas + numpy for calculations | High performance for numerical operations |
| Storage | Supabase PostgreSQL with 90-day retention | Structured storage, user association, privacy compliance |
| UI | React with Material-UI | Modern, responsive interface |
| API | FastAPI with async support | High performance, automatic documentation |
| Intent Mapping | Rule-based tag parsing | Handles Ahrefs comma-separated format |

## Performance Considerations
- Target: Process 10MB files (50,000 keywords) in <30 seconds
- Memory usage: <500MB for largest expected files
- API response time: <200ms for analysis results
- File size limit: 10MB maximum upload

## Integration Points
- **File Upload**: Drag-and-drop interface with progress indicators
- **Analysis Engine**: Modular scoring system for easy algorithm updates
- **Report Generation**: Template-based report creation
- **Content Integration**: Seamless handoff to content idea generation
- **Intent Mapping**: Robust parsing of Ahrefs intent tags