/**
 * Lazy Components
 * Code-split page components for better performance
 */

import React, { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// Lazy load page components
export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyAffiliateResearch = lazy(() => import('../pages/AffiliateResearch'));
export const LazyEnhancedWorkflow = lazy(() => import('./workflow/EnhancedWorkflow'));
export const LazyTrendValidation = lazy(() => import('../pages/TrendValidation'));
export const LazyIdeaBurst = lazy(() => import('../pages/EnhancedIdeaBurst'));
export const LazyKeywordsArmoury = lazy(() => import('../pages/keywords_armoury'));
export const LazyCalendar = lazy(() => import('../pages/Calendar'));
export const LazySettings = lazy(() => import('../pages/Settings'));

// Wrapped components with Suspense
export const Dashboard = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDashboard {...props} />
  </Suspense>
);

export const AffiliateResearch = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAffiliateResearch {...props} />
  </Suspense>
);

export const EnhancedWorkflow = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyEnhancedWorkflow {...props} />
  </Suspense>
);

export const TrendValidation = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyTrendValidation {...props} />
  </Suspense>
);

export const IdeaBurst = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyIdeaBurst {...props} />
  </Suspense>
);

export const KeywordsArmoury = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyKeywordsArmoury {...props} />
  </Suspense>
);

export const Calendar = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyCalendar {...props} />
  </Suspense>
);

export const Settings = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazySettings {...props} />
  </Suspense>
);
