# Data Model: Frontend Issues Fix

**Feature**: Frontend Issues Fix  
**Date**: 2025-01-27  
**Status**: Complete

## Frontend State Entities

### WorkflowSession
Represents a user's progress through the enhanced research workflow.

**Fields**:
- `id: string` - Unique session identifier
- `userId: string` - User who owns the session
- `currentStep: WorkflowStep` - Current step in the workflow
- `progressPercentage: number` - Overall progress (0-100)
- `createdAt: string` - Session creation timestamp
- `updatedAt: string` - Last update timestamp
- `completedAt?: string` - Completion timestamp (if completed)

**Relationships**:
- `topicDecomposition?: TopicDecomposition` - Associated topic decomposition
- `affiliateOffers: AffiliateOffer[]` - Selected affiliate offers
- `trendAnalysis?: TrendAnalysis` - Trend analysis results
- `contentIdeas: ContentIdea[]` - Generated content ideas
- `keywordClusters: KeywordCluster[]` - Keyword clustering results
- `externalToolResults: ExternalToolResult[]` - External tool data

### TopicDecomposition
Represents the AI-generated subtopics from a user's search query.

**Fields**:
- `id: string` - Unique decomposition identifier
- `searchQuery: string` - Original user search query
- `subtopics: Subtopic[]` - Generated subtopics
- `createdAt: string` - Creation timestamp
- `userId: string` - User who requested decomposition

**Validation Rules**:
- `searchQuery` must be non-empty string (min 3 characters)
- `subtopics` must contain at least 3 items
- Each subtopic must have valid name and description

### Subtopic
Represents an individual subtopic generated from the main query.

**Fields**:
- `name: string` - Subtopic name
- `description: string` - Detailed description
- `relevanceScore: number` - Relevance score (0-1)
- `selected: boolean` - Whether user selected this subtopic

**Validation Rules**:
- `name` must be non-empty string (max 100 characters)
- `description` must be non-empty string (max 500 characters)
- `relevanceScore` must be between 0 and 1

### AffiliateOffer
Represents a monetization opportunity found through research.

**Fields**:
- `id: string` - Unique offer identifier
- `name: string` - Offer name
- `description: string` - Offer description
- `commission: string` - Commission rate/amount
- `category: string` - Offer category
- `difficulty: string` - Difficulty level (easy/medium/hard)
- `link?: string` - Direct link to offer
- `instructions?: string` - Instructions for access
- `selected: boolean` - Whether user selected this offer
- `createdAt: string` - Creation timestamp

**Validation Rules**:
- `name` must be non-empty string (max 200 characters)
- `description` must be non-empty string (max 1000 characters)
- `commission` must be non-empty string
- `category` must be one of predefined categories
- `difficulty` must be one of: easy, medium, hard

### TrendAnalysis
Represents trend analysis results for selected subtopics.

**Fields**:
- `id: string` - Unique analysis identifier
- `subtopicIds: string[]` - Analyzed subtopic IDs
- `trendData: TrendData[]` - Trend data points
- `insights: string[]` - Generated insights
- `createdAt: string` - Creation timestamp
- `userId: string` - User who requested analysis

**Validation Rules**:
- `subtopicIds` must contain at least one valid ID
- `trendData` must contain valid data points
- `insights` must be non-empty array

### TrendData
Represents individual trend data points.

**Fields**:
- `keyword: string` - Trend keyword
- `searchVolume: number` - Search volume
- `trendDirection: string` - Direction (rising/falling/stable)
- `competition: string` - Competition level (low/medium/high)
- `opportunityScore: number` - Opportunity score (0-100)
- `timeframe: string` - Analysis timeframe

### ContentIdea
Represents generated content ideas with enhanced keywords.

**Fields**:
- `id: string` - Unique idea identifier
- `title: string` - Content title
- `description: string` - Content description
- `contentType: string` - Type (blog_post/software_idea)
- `targetAudience: string` - Target audience
- `keywords: string[]` - Associated keywords
- `affiliateOffers: string[]` - Related affiliate offer IDs
- `priority: string` - Priority level (high/medium/low)
- `status: string` - Status (draft/in_progress/completed)
- `createdAt: string` - Creation timestamp

**Validation Rules**:
- `title` must be non-empty string (max 200 characters)
- `description` must be non-empty string (max 1000 characters)
- `contentType` must be one of: blog_post, software_idea
- `priority` must be one of: high, medium, low
- `status` must be one of: draft, in_progress, completed

### KeywordCluster
Represents clustered keywords from external tool data.

**Fields**:
- `id: string` - Unique cluster identifier
- `name: string` - Cluster name
- `keywords: string[]` - Keywords in cluster
- `avgVolume: number` - Average search volume
- `avgDifficulty: number` - Average difficulty score
- `avgCPC: number` - Average cost per click
- `selected: boolean` - Whether user selected this cluster
- `createdAt: string` - Creation timestamp

### ExternalToolResult
Represents data imported from external keyword research tools.

**Fields**:
- `id: string` - Unique result identifier
- `toolName: string` - Source tool (semrush/ahrefs/ubersuggest)
- `keywords: KeywordData[]` - Keyword data
- `importedAt: string` - Import timestamp
- `userId: string` - User who imported data

### KeywordData
Represents individual keyword data from external tools.

**Fields**:
- `keyword: string` - Keyword text
- `searchVolume: number` - Monthly search volume
- `difficulty: number` - Keyword difficulty score
- `cpc: number` - Cost per click
- `competition: string` - Competition level
- `trend: string` - Trend direction
- `clusterId?: string` - Associated cluster ID

## UI State Entities

### TabState
Represents the state of the main application tabs.

**Fields**:
- `activeTab: number` - Currently active tab index
- `tabData: TabData[]` - Data for each tab
- `loading: boolean` - Whether any tab is loading
- `error?: string` - Error message if any

### TabData
Represents data for an individual tab.

**Fields**:
- `id: string` - Tab identifier
- `label: string` - Tab display label
- `component: string` - Component to render
- `data: any` - Tab-specific data
- `loading: boolean` - Whether tab is loading
- `error?: string` - Tab-specific error

### WorkflowStepState
Represents the state of the enhanced workflow.

**Fields**:
- `currentStep: WorkflowStep` - Current workflow step
- `completedSteps: WorkflowStep[]` - Completed steps
- `stepData: Record<WorkflowStep, any>` - Data for each step
- `isLoading: boolean` - Whether workflow is processing
- `error?: string` - Workflow error message

## State Transitions

### WorkflowSession States
1. **Created** → User starts new workflow session
2. **In Progress** → User is actively working through steps
3. **Paused** → User temporarily stops workflow
4. **Completed** → User finishes all workflow steps
5. **Cancelled** → User abandons workflow

### WorkflowStep States
1. **Not Started** → Step not yet initiated
2. **Loading** → Step is processing
3. **Completed** → Step finished successfully
4. **Error** → Step failed with error
5. **Skipped** → User skipped this step

## Data Validation Rules

### Global Validation
- All string fields must be non-empty (unless optional)
- All numeric fields must be within valid ranges
- All date fields must be valid ISO 8601 strings
- All array fields must contain valid items

### Workflow-Specific Validation
- Workflow sessions must have valid user ID
- Topic decompositions must have valid search query
- Affiliate offers must have valid commission information
- Content ideas must have valid title and description
- Keyword clusters must contain at least one keyword

## Data Relationships

### One-to-Many Relationships
- User → WorkflowSessions
- WorkflowSession → AffiliateOffers
- WorkflowSession → ContentIdeas
- WorkflowSession → KeywordClusters
- WorkflowSession → ExternalToolResults
- TopicDecomposition → Subtopics
- KeywordCluster → Keywords

### Many-to-Many Relationships
- ContentIdeas ↔ AffiliateOffers (through affiliate offer IDs)
- KeywordClusters ↔ Keywords (through cluster membership)

## Performance Considerations

### State Optimization
- Use React.memo for expensive components
- Implement useMemo for computed values
- Use useCallback for event handlers
- Implement virtual scrolling for large lists

### Data Loading
- Lazy load tab content
- Implement pagination for large datasets
- Use React Query for API caching
- Implement optimistic updates where appropriate