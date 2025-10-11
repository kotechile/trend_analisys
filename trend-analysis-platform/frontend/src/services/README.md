# Research Topics API Service

This document describes the Research Topics API service and its integration with the backend.

## Overview

The `researchTopicsService` provides a complete interface for managing research topics and their associated dataflow entities. It handles all API communication with the backend using the configured API client.

## Service Architecture

```
researchTopicsService
├── Research Topics CRUD
├── Topic Decomposition Operations
├── Trend Analysis Operations
├── Content Ideas Operations
└── Utility Methods
```

## API Endpoints

### Research Topics

#### Create Research Topic
```typescript
POST /api/research-topics/
```
**Request Body:** `ResearchTopicCreate`
**Response:** `ResearchTopic`

#### Get Research Topic
```typescript
GET /api/research-topics/{id}
```
**Response:** `ResearchTopic`

#### Update Research Topic
```typescript
PUT /api/research-topics/{id}
```
**Request Body:** `ResearchTopicUpdate`
**Response:** `ResearchTopic`

#### Delete Research Topic
```typescript
DELETE /api/research-topics/{id}
```
**Response:** `void`

#### List Research Topics
```typescript
GET /api/research-topics/
```
**Query Parameters:**
- `status?: ResearchTopicStatus`
- `page?: number`
- `size?: number`
- `order_by?: string`
- `order_direction?: 'asc' | 'desc'`

**Response:** `ResearchTopicListResponse`

#### Search Research Topics
```typescript
GET /api/research-topics/search
```
**Query Parameters:**
- `query: string`
- `page?: number`
- `size?: number`

**Response:** `ResearchTopicListResponse`

#### Get Complete Dataflow
```typescript
GET /api/research-topics/{id}/complete
```
**Response:** `ResearchTopicComplete`

#### Get Research Topic Stats
```typescript
GET /api/research-topics/{id}/stats
```
**Response:** `ResearchTopicStats`

#### Get Overview Stats
```typescript
GET /api/research-topics/stats/overview
```
**Response:** `ResearchTopicStats`

#### Archive Research Topic
```typescript
PUT /api/research-topics/{id}/archive
```
**Response:** `ResearchTopic`

#### Restore Research Topic
```typescript
PUT /api/research-topics/{id}/restore
```
**Response:** `ResearchTopic`

### Topic Decompositions

#### Create Subtopics
```typescript
POST /api/research-topics/{id}/subtopics
```
**Request Body:** `TopicDecompositionCreate`
**Response:** `TopicDecomposition`

#### Get Subtopics
```typescript
GET /api/research-topics/{id}/subtopics
```
**Response:** `TopicDecomposition`

#### Update Topic Decomposition
```typescript
PUT /api/topic-decompositions/{id}
```
**Request Body:** `TopicDecompositionUpdate`
**Response:** `TopicDecomposition`

#### Delete Topic Decomposition
```typescript
DELETE /api/topic-decompositions/{id}
```
**Response:** `void`

#### List Topic Decompositions
```typescript
GET /api/topic-decompositions/
```
**Query Parameters:**
- `research_topic_id?: string`
- `page?: number`
- `size?: number`
- `order_by?: string`
- `order_direction?: 'asc' | 'desc'`

**Response:** `TopicDecompositionListResponse`

#### Get Topic Decomposition Stats
```typescript
GET /api/topic-decompositions/stats
```
**Response:** `TopicDecompositionStats`

#### Analyze Subtopics
```typescript
GET /api/topic-decompositions/analyze
```
**Response:** `SubtopicAnalysis[]`

#### Search Subtopics
```typescript
GET /api/topic-decompositions/search
```
**Query Parameters:**
- `query: string`
- `page?: number`
- `size?: number`

**Response:** `any[]`

### Trend Analyses

#### Create Trend Analysis
```typescript
POST /api/trend-analyses/
```
**Request Body:** `TrendAnalysisCreate`
**Response:** `TrendAnalysis`

#### Get Trend Analysis
```typescript
GET /api/trend-analyses/{id}
```
**Response:** `TrendAnalysis`

#### Update Trend Analysis
```typescript
PUT /api/trend-analyses/{id}
```
**Request Body:** `TrendAnalysisUpdate`
**Response:** `TrendAnalysis`

#### Delete Trend Analysis
```typescript
DELETE /api/trend-analyses/{id}
```
**Response:** `void`

#### List Trend Analyses
```typescript
GET /api/trend-analyses/
```
**Query Parameters:**
- `topic_decomposition_id?: string`
- `subtopic_name?: string`
- `status?: TrendAnalysisStatus`
- `page?: number`
- `size?: number`
- `order_by?: string`
- `order_direction?: 'asc' | 'desc'`

**Response:** `TrendAnalysisListResponse`

#### Get Trend Analysis Stats
```typescript
GET /api/trend-analyses/stats
```
**Response:** `TrendAnalysisStats`

#### Search Trend Analyses
```typescript
GET /api/trend-analyses/search
```
**Query Parameters:**
- `query: string`
- `page?: number`
- `size?: number`

**Response:** `TrendAnalysisListResponse`

#### Get Trend Analyses by Subtopic
```typescript
GET /api/trend-analyses/subtopic
```
**Query Parameters:**
- `subtopic_name: string`

**Response:** `TrendAnalysis[]`

#### Get Trend Analyses by Research Topic
```typescript
GET /api/trend-analyses/research-topic
```
**Query Parameters:**
- `research_topic_id: string`

**Response:** `TrendAnalysis[]`

### Content Ideas

#### Create Content Idea
```typescript
POST /api/content-ideas/
```
**Request Body:** `ContentIdeaCreate`
**Response:** `ContentIdea`

#### Get Content Idea
```typescript
GET /api/content-ideas/{id}
```
**Response:** `ContentIdea`

#### Update Content Idea
```typescript
PUT /api/content-ideas/{id}
```
**Request Body:** `ContentIdeaUpdate`
**Response:** `ContentIdea`

#### Delete Content Idea
```typescript
DELETE /api/content-ideas/{id}
```
**Response:** `void`

#### List Content Ideas
```typescript
GET /api/content-ideas/
```
**Query Parameters:**
- `filters?: ContentIdeaFilter`
- `page?: number`
- `size?: number`
- `order_by?: string`
- `order_direction?: 'asc' | 'desc'`

**Response:** `ContentIdeaListResponse`

#### Search Content Ideas
```typescript
POST /api/content-ideas/search
```
**Request Body:** `ContentIdeaSearch`
**Response:** `ContentIdeaListResponse`

#### Get Content Idea Stats
```typescript
GET /api/content-ideas/stats
```
**Response:** `ContentIdeaStats`

#### Get Content Ideas by Research Topic
```typescript
GET /api/content-ideas/research-topic
```
**Query Parameters:**
- `research_topic_id: string`

**Response:** `ContentIdea[]`

#### Get Content Ideas by Trend Analysis
```typescript
GET /api/content-ideas/trend-analysis
```
**Query Parameters:**
- `trend_analysis_id: string`

**Response:** `ContentIdea[]`

#### Bulk Create Content Ideas
```typescript
POST /api/content-ideas/bulk
```
**Request Body:** `ContentIdeaCreate[]`
**Response:** `ContentIdea[]`

## Utility Methods

### getDataflowProgress(topicId: string)
Calculates the completion percentage of a research topic's dataflow.

**Returns:**
```typescript
{
  hasSubtopics: boolean;
  hasTrendAnalyses: boolean;
  hasContentIdeas: boolean;
  progressPercentage: number;
}
```

### validateDataflowIntegrity(topicId: string)
Validates the integrity of a research topic's dataflow.

**Returns:**
```typescript
{
  isValid: boolean;
  issues: string[];
}
```

## Error Handling

The service includes comprehensive error handling:

- **Network Errors**: Automatically retried with exponential backoff
- **Validation Errors**: Detailed error messages for form validation
- **Authentication Errors**: Redirected to login page
- **Server Errors**: Graceful degradation with user-friendly messages

## Caching Strategy

The service uses React Query for intelligent caching:

- **Stale Time**: 5 minutes for list queries, 2 minutes for detail queries
- **Cache Time**: 10 minutes for all queries
- **Background Refetch**: Automatic refetch on window focus
- **Optimistic Updates**: Immediate UI updates for mutations

## Authentication

All API calls include authentication headers automatically via the API client interceptor.

## Type Safety

The service is fully typed with TypeScript, providing:
- Compile-time type checking
- IntelliSense support
- Runtime type validation
- API contract enforcement

## Usage Examples

### Basic CRUD Operations
```typescript
import { researchTopicsService } from './services/researchTopicsService';

// Create a research topic
const topic = await researchTopicsService.createResearchTopic({
  title: 'AI Research',
  description: 'Research on AI trends',
  status: ResearchTopicStatus.ACTIVE
});

// Get a research topic
const topic = await researchTopicsService.getResearchTopic('topic-id');

// Update a research topic
const updatedTopic = await researchTopicsService.updateResearchTopic('topic-id', {
  title: 'Updated AI Research',
  version: 1
});

// Delete a research topic
await researchTopicsService.deleteResearchTopic('topic-id');
```

### Advanced Operations
```typescript
// Get complete dataflow
const dataflow = await researchTopicsService.getCompleteDataflow('topic-id');

// Check dataflow progress
const progress = await researchTopicsService.getDataflowProgress('topic-id');
console.log(`Progress: ${progress.progressPercentage}%`);

// Validate dataflow integrity
const integrity = await researchTopicsService.validateDataflowIntegrity('topic-id');
if (!integrity.isValid) {
  console.log('Issues:', integrity.issues);
}
```

### Error Handling
```typescript
try {
  const topic = await researchTopicsService.createResearchTopic(data);
  // Handle success
} catch (error) {
  if (error.response?.status === 400) {
    // Handle validation error
    console.error('Validation error:', error.response.data);
  } else if (error.response?.status === 401) {
    // Handle authentication error
    redirectToLogin();
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Testing

The service includes comprehensive unit tests covering:
- All API endpoints
- Error handling scenarios
- Utility method functionality
- Type safety validation

Run tests with:
```bash
npm test -- --testPathPattern=researchTopicsService
```
