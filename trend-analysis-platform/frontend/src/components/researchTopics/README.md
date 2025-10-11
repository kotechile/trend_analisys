# Research Topics Components

This directory contains React components for managing research topics and their complete dataflow in the TrendTap platform.

## Overview

The Research Topics feature provides a comprehensive system for:
- Creating and managing research topics
- Decomposing topics into subtopics
- Performing trend analysis on subtopics
- Generating content ideas from trend analyses
- Tracking the complete dataflow from topic to content

## Components

### ResearchTopicForm
Form component for creating and editing research topics.

**Props:**
- `initialData?: Partial<ResearchTopicFormData>` - Initial form data
- `onSubmit: (data: ResearchTopicFormData) => void` - Submit handler
- `onCancel: () => void` - Cancel handler
- `isLoading?: boolean` - Loading state
- `mode?: 'create' | 'edit'` - Form mode

**Features:**
- Form validation with real-time error clearing
- Support for all research topic fields
- Loading states and error handling

### ResearchTopicCard
Individual card display for research topics with progress indicators.

**Props:**
- `topic: ResearchTopic` - Research topic data
- `onView: (topic: ResearchTopic) => void` - View handler
- `onEdit: (topic: ResearchTopic) => void` - Edit handler
- `onDelete: (topic: ResearchTopic) => void` - Delete handler
- `onArchive: (topic: ResearchTopic) => void` - Archive handler
- `onRestore: (topic: ResearchTopic) => void` - Restore handler
- `showActions?: boolean` - Show action buttons

**Features:**
- Progress indicators for dataflow completion
- Status chips and version display
- Action menu with context-sensitive options
- Responsive design

### ResearchTopicStats
Statistics overview component showing research topics metrics.

**Features:**
- Total topics count by status
- Completion and activity rates
- Dataflow statistics (subtopics, analyses, content ideas)
- Visual progress indicators
- Last activity tracking

### DataflowViewer
Complete dataflow visualization component.

**Props:**
- `topicId: string` - Research topic ID

**Features:**
- Tabbed interface for subtopics, trend analyses, and content ideas
- Real-time dataflow integrity checking
- Interactive subtopic details
- Progress tracking and validation

## Hooks

### useResearchTopics
Custom hooks for research topics operations.

**Available hooks:**
- `useResearchTopics(params?)` - List research topics
- `useResearchTopic(id)` - Get single research topic
- `useResearchTopicComplete(id)` - Get complete dataflow
- `useCreateResearchTopic()` - Create research topic mutation
- `useUpdateResearchTopic()` - Update research topic mutation
- `useDeleteResearchTopic()` - Delete research topic mutation
- `useArchiveResearchTopic()` - Archive research topic mutation
- `useRestoreResearchTopic()` - Restore research topic mutation
- `useDataflowProgress(id)` - Get dataflow progress
- `useDataflowIntegrity(id)` - Validate dataflow integrity
- `useResearchTopicForm(initialData?)` - Form management hook
- `useSubtopicForm()` - Subtopic form management hook

## Types

### ResearchTopic
Core research topic entity with metadata and versioning.

### ResearchTopicFormData
Form data structure for creating/editing research topics.

### SubtopicItem
Individual subtopic with name and description.

### TopicDecomposition
Complete topic decomposition with subtopics and metadata.

### TrendAnalysis
Trend analysis results linked to specific subtopics.

### ContentIdea
Generated content ideas with detailed specifications.

### ResearchTopicComplete
Complete dataflow including all related entities.

## Usage Examples

### Creating a Research Topic
```tsx
import { useCreateResearchTopic } from '../hooks/useResearchTopics';

function CreateTopicPage() {
  const createMutation = useCreateResearchTopic();

  const handleSubmit = async (data: ResearchTopicFormData) => {
    try {
      await createMutation.mutateAsync(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <ResearchTopicForm
      onSubmit={handleSubmit}
      onCancel={() => navigate('/topics')}
      isLoading={createMutation.isPending}
    />
  );
}
```

### Displaying Research Topics List
```tsx
import { useResearchTopics } from '../hooks/useResearchTopics';

function TopicsListPage() {
  const { data, isLoading, error } = useResearchTopics({
    status: ResearchTopicStatus.ACTIVE,
    page: 1,
    size: 10
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <Grid container spacing={2}>
      {data?.items.map(topic => (
        <Grid item xs={12} sm={6} md={4} key={topic.id}>
          <ResearchTopicCard
            topic={topic}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onRestore={handleRestore}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

### Viewing Complete Dataflow
```tsx
import { DataflowViewer } from '../components/researchTopics';

function TopicDetailPage({ topicId }: { topicId: string }) {
  return (
    <Box>
      <DataflowViewer topicId={topicId} />
    </Box>
  );
}
```

## Styling

Components use Material-UI theming and are fully responsive. Custom styling can be applied through the theme provider or component-specific CSS classes.

## Testing

All components include comprehensive unit tests covering:
- Rendering and user interactions
- Form validation and error handling
- API integration and error states
- Accessibility features

Run tests with:
```bash
npm test -- --testPathPattern=researchTopics
```

## Accessibility

Components follow WCAG 2.1 guidelines with:
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## Performance

Optimizations include:
- React Query for efficient data caching
- Lazy loading for large lists
- Memoized components to prevent unnecessary re-renders
- Optimistic updates for better UX
- Error boundaries for graceful error handling
