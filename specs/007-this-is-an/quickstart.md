# Quickstart: Frontend Issues Fix

**Feature**: Frontend Issues Fix  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

This quickstart demonstrates how to fix the critical frontend issues and integrate the enhanced workflow functionality. The fixes address empty tabs, broken affiliate research, and proper integration of the new Enhanced Workflow component.

## Prerequisites

- Node.js 18+ installed
- React 18+ and TypeScript 4.9+
- Material-UI v5 components
- Backend API running on localhost:8000
- Supabase database configured

## Step 1: Install Dependencies

```bash
cd /Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/frontend
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install @mui/x-data-grid
npm install @tanstack/react-query
npm install axios
npm install react-router-dom
```

## Step 2: Fix Tab Navigation

### 2.1 Update App.tsx Routing

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import all page components
import Dashboard from './pages/Dashboard';
import AffiliateResearch from './pages/AffiliateResearch';
import EnhancedWorkflow from './components/workflow/EnhancedWorkflow';
import TrendValidation from './pages/TrendValidation';
import IdeaBurst from './pages/IdeaBurst';
import KeywordArmoury from './pages/KeywordArmoury';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

const theme = createTheme({
  // Your theme configuration
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/affiliate-research" element={<AffiliateResearch />} />
            <Route path="/integrated-workflow" element={<EnhancedWorkflow />} />
            <Route path="/trend-validation" element={<TrendValidation />} />
            <Route path="/idea-burst" element={<IdeaBurst />} />
            <Route path="/keyword-armoury" element={<KeywordArmoury />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### 2.2 Create Missing Page Components

```typescript
// src/pages/TrendValidation.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TrendValidation: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📈 Trend Validation
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Trend validation functionality coming soon!
        </Typography>
      </Paper>
    </Box>
  );
};

export default TrendValidation;
```

Repeat for other missing pages: `IdeaBurst.tsx`, `KeywordArmoury.tsx`, `Calendar.tsx`, `Settings.tsx`.

## Step 3: Fix Affiliate Research API Integration

### 3.1 Create API Service

```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### 3.2 Update Affiliate Research Component

```typescript
// src/pages/AffiliateResearch.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

const AffiliateResearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState('');

  const searchMutation = useMutation({
    mutationFn: async (data: { search_term: string; niche?: string }) => {
      const response = await api.post('/api/affiliate-research/search', data);
      return response.data;
    },
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchMutation.mutate({
        search_term: searchTerm,
        niche: niche || undefined,
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search form and results display */}
      {/* ... existing UI code ... */}
    </Box>
  );
};
```

## Step 4: Integrate Enhanced Workflow

### 4.1 Update Enhanced Workflow Context

```typescript
// src/contexts/EnhancedWorkflowContext.tsx
// Fix the initial step
const initialState: EnhancedWorkflowState = {
  // ... other state
  currentStep: WorkflowStep.TOPIC_DECOMPOSITION, // Changed from UPLOAD_CSV
  // ... rest of state
};
```

### 4.2 Create Workflow API Hooks

```typescript
// src/hooks/useWorkflow.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useWorkflowSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['workflow-session', sessionId],
    queryFn: async () => {
      const response = await api.get(`/api/workflow/sessions/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId,
  });
};

export const useTopicDecomposition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { searchQuery: string; sessionId: string }) => {
      const response = await api.post('/api/topic-decomposition', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['workflow-session', variables.sessionId]);
    },
  });
};
```

## Step 5: Test the Integration

### 5.1 Start Backend Server

```bash
cd /Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 5.2 Start Frontend Server

```bash
cd /Users/jorgefernandezilufi/Documents/_article_research/Trend_analisys-spec-kit/trend-analysis-platform/frontend
npm run dev
```

### 5.3 Test Each Tab

1. **Dashboard Tab**: Should load without errors
2. **Affiliate Research Tab**: Should allow search and display results
3. **Integrated Workflow Tab**: Should show enhanced workflow interface
4. **Other Tabs**: Should show placeholder content without errors

## Step 6: Verify Enhanced Workflow

### 6.1 Test Topic Decomposition

```bash
curl -X POST http://localhost:8000/api/topic-decomposition \
  -H "Content-Type: application/json" \
  -d '{
    "searchQuery": "Cars for the east coast",
    "sessionId": "test-session-123"
  }'
```

Expected response:
```json
{
  "id": "decomp-123",
  "searchQuery": "Cars for the east coast",
  "subtopics": [
    {
      "name": "Electric cars in California",
      "description": "Electric vehicle trends and opportunities",
      "relevanceScore": 0.95,
      "selected": false
    }
  ],
  "createdAt": "2025-01-27T10:00:00Z"
}
```

### 6.2 Test Affiliate Research

```bash
curl -X POST http://localhost:8000/api/affiliate-research \
  -H "Content-Type: application/json" \
  -d '{
    "subtopicIds": ["subtopic-1", "subtopic-2"],
    "sessionId": "test-session-123"
  }'
```

### 6.3 Test Complete Workflow

1. Navigate to "Integrated Workflow" tab
2. Enter search query: "Cars for the east coast"
3. Click "Start Workflow"
4. Verify each step loads correctly
5. Test topic decomposition
6. Test affiliate research
7. Test trend analysis
8. Test content generation

## Step 7: Error Handling

### 7.1 Add Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { Alert, Box, Button } from '@mui/material';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Something went wrong. Please refresh the page.
          </Alert>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

### 7.2 Add Loading States

```typescript
// src/components/LoadingSpinner.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: 3 
    }}>
      <CircularProgress />
      <Typography variant="body2" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
```

## Step 8: Performance Optimization

### 8.1 Implement Code Splitting

```typescript
// src/App.tsx
import React, { Suspense, lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AffiliateResearch = lazy(() => import('./pages/AffiliateResearch'));
const EnhancedWorkflow = lazy(() => import('./components/workflow/EnhancedWorkflow'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/affiliate-research" element={<AffiliateResearch />} />
          <Route path="/integrated-workflow" element={<EnhancedWorkflow />} />
          {/* ... other routes ... */}
        </Routes>
      </Router>
    </Suspense>
  );
}
```

### 8.2 Add React.memo to Components

```typescript
// src/components/workflow/TopicDecompositionStep.tsx
import React, { memo } from 'react';

const TopicDecompositionStep = memo(({ onNext, onBack }: Props) => {
  // Component implementation
});

export default TopicDecompositionStep;
```

## Expected Results

After completing this quickstart:

1. **All 8 tabs should be functional** - No more empty placeholder pages
2. **Affiliate Research should work** - Search functionality and API integration
3. **Enhanced Workflow should be integrated** - Complete 6-step workflow
4. **Error handling should be robust** - Graceful error states and recovery
5. **Performance should be optimized** - Fast loading and smooth interactions
6. **API integration should be seamless** - Proper data flow between frontend and backend

## Troubleshooting

### Common Issues

1. **Tabs not loading**: Check React Router configuration and component imports
2. **API errors**: Verify backend is running and CORS is configured
3. **Context errors**: Ensure EnhancedWorkflowProvider wraps the app
4. **Material-UI errors**: Check if all dependencies are installed
5. **TypeScript errors**: Verify type definitions and imports

### Debug Steps

1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Verify all imports are correct
4. Check if backend API endpoints match frontend calls
5. Verify environment variables are set correctly

## Next Steps

After fixing the frontend issues:

1. **Add comprehensive testing** - Unit tests for components, integration tests for workflow
2. **Implement user authentication** - Supabase auth integration
3. **Add data persistence** - Save workflow progress and results
4. **Optimize performance** - Bundle analysis and optimization
5. **Add monitoring** - Error tracking and performance monitoring