/**
 * useTrends hook for trend analysis management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trendService } from '../services/trendService';
import {
  TrendAnalysisRequest,
  TrendAnalysisResponse,
  TrendAnalysisUpdate,
  TrendAnalysisQuery,
  TrendForecastResponse,
  ApiResult
} from '../types/api';

export const useTrends = () => {
  const queryClient = useQueryClient();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  // Start trend analysis
  const startAnalysisMutation = useMutation({
    mutationFn: (request: TrendAnalysisRequest) => 
      trendService.startAnalysis(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['trend-analyses'] });
        setSelectedAnalysis(data.data.id);
      }
    },
  });

  // Get analysis by ID
  const useAnalysis = (analysisId: string) => {
    return useQuery({
      queryKey: ['trend-analysis', analysisId],
      queryFn: () => trendService.getAnalysis(analysisId),
      enabled: !!analysisId,
    });
  };

  // List analyses
  const useAnalyses = (query?: TrendAnalysisQuery) => {
    return useQuery({
      queryKey: ['trend-analyses', query],
      queryFn: () => trendService.listAnalyses(query),
    });
  };

  // Update analysis
  const updateAnalysisMutation = useMutation({
    mutationFn: ({ analysisId, update }: { analysisId: string; update: TrendAnalysisUpdate }) =>
      trendService.updateAnalysis(analysisId, update),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['trend-analysis', variables.analysisId] });
        queryClient.invalidateQueries({ queryKey: ['trend-analyses'] });
      }
    },
  });

  // Delete analysis
  const deleteAnalysisMutation = useMutation({
    mutationFn: (analysisId: string) => trendService.deleteAnalysis(analysisId),
    onSuccess: (data, analysisId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['trend-analyses'] });
        if (selectedAnalysis === analysisId) {
          setSelectedAnalysis(null);
        }
      }
    },
  });

  // Get forecast
  const useForecast = (analysisId: string) => {
    return useQuery({
      queryKey: ['trend-forecast', analysisId],
      queryFn: () => trendService.getForecast(analysisId),
      enabled: !!analysisId,
    });
  };

  // Get insights
  const useInsights = (analysisId: string) => {
    return useQuery({
      queryKey: ['trend-insights', analysisId],
      queryFn: () => trendService.getInsights(analysisId),
      enabled: !!analysisId,
    });
  };

  // Refresh analysis
  const refreshAnalysisMutation = useMutation({
    mutationFn: (analysisId: string) => trendService.refreshAnalysis(analysisId),
    onSuccess: (data, analysisId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['trend-analysis', analysisId] });
        queryClient.invalidateQueries({ queryKey: ['trend-forecast', analysisId] });
        queryClient.invalidateQueries({ queryKey: ['trend-insights', analysisId] });
      }
    },
  });

  // Get keyword suggestions
  const useKeywordSuggestions = (query: string, geo: string = 'US', limit: number = 10) => {
    return useQuery({
      queryKey: ['trend-keyword-suggestions', query, geo, limit],
      queryFn: () => trendService.getKeywordSuggestions(query, geo, limit),
      enabled: !!query && query.length > 2,
    });
  };

  // Get regions
  const useRegions = () => {
    return useQuery({
      queryKey: ['trend-regions'],
      queryFn: () => trendService.getRegions(),
    });
  };

  // Get analytics
  const useAnalytics = (analysisId: string) => {
    return useQuery({
      queryKey: ['trend-analytics', analysisId],
      queryFn: () => trendService.getAnalytics(analysisId),
      enabled: !!analysisId,
    });
  };

  // Helper functions
  const startAnalysis = useCallback((request: TrendAnalysisRequest) => {
    return startAnalysisMutation.mutateAsync(request);
  }, [startAnalysisMutation]);

  const updateAnalysis = useCallback((analysisId: string, update: TrendAnalysisUpdate) => {
    return updateAnalysisMutation.mutateAsync({ analysisId, update });
  }, [updateAnalysisMutation]);

  const deleteAnalysis = useCallback((analysisId: string) => {
    return deleteAnalysisMutation.mutateAsync(analysisId);
  }, [deleteAnalysisMutation]);

  const refreshAnalysis = useCallback((analysisId: string) => {
    return refreshAnalysisMutation.mutateAsync(analysisId);
  }, [refreshAnalysisMutation]);

  return {
    // State
    selectedAnalysis,
    setSelectedAnalysis,
    
    // Mutations
    startAnalysis,
    updateAnalysis,
    deleteAnalysis,
    refreshAnalysis,
    
    // Mutation states
    isStartingAnalysis: startAnalysisMutation.isPending,
    isUpdatingAnalysis: updateAnalysisMutation.isPending,
    isDeletingAnalysis: deleteAnalysisMutation.isPending,
    isRefreshingAnalysis: refreshAnalysisMutation.isPending,
    
    // Mutation errors
    startAnalysisError: startAnalysisMutation.error,
    updateAnalysisError: updateAnalysisMutation.error,
    deleteAnalysisError: deleteAnalysisMutation.error,
    refreshAnalysisError: refreshAnalysisMutation.error,
    
    // Hooks
    useAnalysis,
    useAnalyses,
    useForecast,
    useInsights,
    useKeywordSuggestions,
    useRegions,
    useAnalytics,
  };
};
