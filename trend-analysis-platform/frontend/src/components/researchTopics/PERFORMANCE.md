# Research Topics Performance Guide

This document outlines performance optimizations and best practices for the Research Topics feature.

## Performance Metrics

### Target Metrics
- **Initial Load Time**: < 2 seconds
- **API Response Time**: < 200ms
- **Time to Interactive**: < 3 seconds
- **Bundle Size Impact**: < 50KB gzipped
- **Memory Usage**: < 100MB for 1000+ topics

### Current Performance
- ✅ Lazy loading implemented
- ✅ React Query caching active
- ✅ Memoized components
- ✅ Optimistic updates
- ✅ Error boundaries

## Optimization Strategies

### 1. Code Splitting

#### Route-based Splitting
```typescript
// Lazy load the Research Topics page
const ResearchTopics = lazy(() => import('./pages/ResearchTopics'));

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ResearchTopics />
</Suspense>
```

#### Component-based Splitting
```typescript
// Lazy load heavy components
const DataflowViewer = lazy(() => import('./DataflowViewer'));
const ResearchTopicStats = lazy(() => import('./ResearchTopicStats'));
```

### 2. Data Fetching Optimization

#### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

#### Pagination Strategy
```typescript
// Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedTopicList = ({ topics }) => (
  <List
    height={600}
    itemCount={topics.length}
    itemSize={200}
    itemData={topics}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <ResearchTopicCard topic={data[index]} />
      </div>
    )}
  </List>
);
```

### 3. Component Optimization

#### Memoization
```typescript
// Memoize expensive components
const ResearchTopicCard = memo(({ topic, onView, onEdit }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return (
    prevProps.topic.id === nextProps.topic.id &&
    prevProps.topic.updated_at === nextProps.topic.updated_at
  );
});

// Memoize expensive calculations
const progressPercentage = useMemo(() => {
  return calculateProgress(dataflow);
}, [dataflow.subtopics, dataflow.trend_analyses, dataflow.content_ideas]);
```

#### Callback Optimization
```typescript
// Memoize event handlers
const handleView = useCallback((topic: ResearchTopic) => {
  setSelectedTopic(topic);
  setShowDataflowDialog(true);
}, []);

const handleEdit = useCallback((topic: ResearchTopic) => {
  setEditingTopic(topic);
  setShowEditDialog(true);
}, []);
```

### 4. State Management

#### Local State Optimization
```typescript
// Use useReducer for complex state
const [state, dispatch] = useReducer(topicReducer, initialState);

// Batch state updates
const updateMultipleFields = useCallback((updates) => {
  dispatch({ type: 'BATCH_UPDATE', payload: updates });
}, []);
```

#### Context Optimization
```typescript
// Split contexts to prevent unnecessary re-renders
const TopicsContext = createContext();
const TopicsActionsContext = createContext();

// Memoize context values
const contextValue = useMemo(() => ({
  topics: state.topics,
  loading: state.loading
}), [state.topics, state.loading]);
```

### 5. Rendering Optimization

#### Conditional Rendering
```typescript
// Use early returns to prevent unnecessary renders
const ResearchTopicCard = ({ topic, showActions }) => {
  if (!topic) return null;
  
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
};
```

#### List Optimization
```typescript
// Use React.memo for list items
const TopicListItem = memo(({ topic, onSelect }) => (
  <ListItem onClick={() => onSelect(topic.id)}>
    <ListItemText primary={topic.title} />
  </ListItem>
));

// Implement virtualization for large lists
const VirtualizedList = ({ items, renderItem }) => (
  <FixedSizeList
    height={400}
    itemCount={items.length}
    itemSize={50}
  >
    {({ index, style }) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    )}
  </FixedSizeList>
);
```

### 6. Bundle Optimization

#### Tree Shaking
```typescript
// Import only what you need
import { Button, TextField } from '@mui/material';
// Instead of: import * as MUI from '@mui/material';
```

#### Dynamic Imports
```typescript
// Load heavy dependencies on demand
const loadChartLibrary = () => import('chart.js');

const ChartComponent = () => {
  const [Chart, setChart] = useState(null);
  
  useEffect(() => {
    loadChartLibrary().then(({ Chart: ChartClass }) => {
      setChart(() => ChartClass);
    });
  }, []);
  
  return Chart ? <Chart /> : <LoadingSpinner />;
};
```

### 7. Network Optimization

#### Request Batching
```typescript
// Batch multiple requests
const batchRequests = async (requests) => {
  const promises = requests.map(request => 
    apiClient(request.endpoint, request.data)
  );
  return Promise.all(promises);
};
```

#### Request Deduplication
```typescript
// Use React Query's built-in deduplication
const { data } = useQuery({
  queryKey: ['research-topic', id],
  queryFn: () => researchTopicsService.getResearchTopic(id),
  staleTime: 5 * 60 * 1000
});
```

### 8. Memory Management

#### Cleanup Effects
```typescript
useEffect(() => {
  const subscription = subscribeToUpdates();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

#### Image Optimization
```typescript
// Lazy load images
const LazyImage = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
};
```

## Performance Monitoring

### Metrics Collection
```typescript
// Performance monitoring
const usePerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);
};
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Check for duplicate dependencies
npx duplicate-package-checker-webpack-plugin
```

### Runtime Monitoring
```typescript
// Monitor component render times
const withPerformanceMonitoring = (Component) => {
  return (props) => {
    const startTime = performance.now();
    
    useEffect(() => {
      const endTime = performance.now();
      console.log(`${Component.name} render time: ${endTime - startTime}ms`);
    });
    
    return <Component {...props} />;
  };
};
```

## Best Practices

### 1. Component Design
- Keep components small and focused
- Use composition over inheritance
- Implement proper error boundaries
- Use TypeScript for type safety

### 2. State Management
- Minimize state updates
- Use local state when possible
- Implement proper state normalization
- Avoid unnecessary re-renders

### 3. Data Fetching
- Use React Query for caching
- Implement proper loading states
- Handle errors gracefully
- Use optimistic updates

### 4. User Experience
- Show loading indicators
- Implement skeleton screens
- Use progressive loading
- Provide feedback for user actions

### 5. Testing
- Write performance tests
- Monitor bundle size
- Test on slow devices
- Use performance profiling tools

## Troubleshooting

### Common Issues

#### Slow Initial Load
- Check bundle size
- Implement code splitting
- Optimize images and assets
- Use CDN for static assets

#### Slow API Responses
- Implement caching
- Use request deduplication
- Optimize database queries
- Consider pagination

#### Memory Leaks
- Clean up event listeners
- Cancel pending requests
- Clear timers and intervals
- Use proper dependency arrays

#### Slow Renders
- Use React.memo
- Optimize re-render triggers
- Implement virtualization
- Profile with React DevTools

### Debugging Tools
- React DevTools Profiler
- Chrome DevTools Performance
- Webpack Bundle Analyzer
- Lighthouse Performance Audit

## Monitoring and Alerts

### Performance Budgets
```json
{
  "budgets": [
    {
      "type": "bundle",
      "name": "main",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "initial",
      "maximumWarning": "2s",
      "maximumError": "4s"
    }
  ]
}
```

### Automated Testing
```typescript
// Performance tests
describe('Performance', () => {
  it('should load within performance budget', async () => {
    const startTime = performance.now();
    
    render(<ResearchTopics />);
    await waitFor(() => {
      expect(screen.getByText('Research Topics')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(2000);
  });
});
```

This performance guide ensures the Research Topics feature maintains optimal performance while providing a smooth user experience.
