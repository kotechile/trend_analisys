/**
 * useKeywords hook for keyword management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keywordService } from '../services/keywordService';
import {
  KeywordCrawlRequest,
  KeywordDataQuery,
  KeywordAnalysisResponse,
  KeywordClusterResponse,
  ApiResult
} from '../types/api';

export const useKeywords = () => {
  const queryClient = useQueryClient();
  const [selectedKeywordData, setSelectedKeywordData] = useState<string | null>(null);

  // Upload keywords
  const uploadKeywordsMutation = useMutation({
    mutationFn: (file: File) => keywordService.uploadKeywords(file),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['keyword-data'] });
        setSelectedKeywordData(data.data.keyword_data_id);
      }
    },
  });

  // Crawl keywords
  const crawlKeywordsMutation = useMutation({
    mutationFn: (request: KeywordCrawlRequest) => keywordService.crawlKeywords(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['keyword-data'] });
      }
    },
  });

  // Get keyword data by ID
  const useKeywordData = (keywordDataId: string) => {
    return useQuery({
      queryKey: ['keyword-data', keywordDataId],
      queryFn: () => keywordService.getKeywordData(keywordDataId),
      enabled: !!keywordDataId,
    });
  };

  // List keyword data
  const useKeywordDataList = (query?: KeywordDataQuery) => {
    return useQuery({
      queryKey: ['keyword-data', query],
      queryFn: () => keywordService.listKeywordData(query),
    });
  };

  // Delete keyword data
  const deleteKeywordDataMutation = useMutation({
    mutationFn: (keywordDataId: string) => keywordService.deleteKeywordData(keywordDataId),
    onSuccess: (data, keywordDataId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['keyword-data'] });
        if (selectedKeywordData === keywordDataId) {
          setSelectedKeywordData(null);
        }
      }
    },
  });

  // Get analysis
  const useAnalysis = (keywordDataId: string) => {
    return useQuery({
      queryKey: ['keyword-analysis', keywordDataId],
      queryFn: () => keywordService.getAnalysis(keywordDataId),
      enabled: !!keywordDataId,
    });
  };

  // Get clusters
  const useClusters = (keywordDataId: string) => {
    return useQuery({
      queryKey: ['keyword-clusters', keywordDataId],
      queryFn: () => keywordService.getClusters(keywordDataId),
      enabled: !!keywordDataId,
    });
  };

  // Enrich keywords
  const enrichKeywordsMutation = useMutation({
    mutationFn: (keywordDataId: string) => keywordService.enrichKeywords(keywordDataId),
    onSuccess: (data, keywordDataId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['keyword-data', keywordDataId] });
        queryClient.invalidateQueries({ queryKey: ['keyword-analysis', keywordDataId] });
      }
    },
  });

  // Cluster keywords
  const clusterKeywordsMutation = useMutation({
    mutationFn: (keywordDataId: string) => keywordService.clusterKeywords(keywordDataId),
    onSuccess: (data, keywordDataId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['keyword-data', keywordDataId] });
        queryClient.invalidateQueries({ queryKey: ['keyword-clusters', keywordDataId] });
      }
    },
  });

  // Export keywords
  const exportKeywordsMutation = useMutation({
    mutationFn: ({ keywordDataId, format }: { keywordDataId: string; format?: string }) =>
      keywordService.exportKeywords(keywordDataId, format),
  });

  // Get suggestions
  const useSuggestions = (query: string, geo: string = 'US', language: string = 'en', limit: number = 10) => {
    return useQuery({
      queryKey: ['keyword-suggestions', query, geo, language, limit],
      queryFn: () => keywordService.getSuggestions(query, geo, language, limit),
      enabled: !!query && query.length > 2,
    });
  };

  // Get analytics
  const useAnalytics = (keywordDataId: string) => {
    return useQuery({
      queryKey: ['keyword-analytics', keywordDataId],
      queryFn: () => keywordService.getAnalytics(keywordDataId),
      enabled: !!keywordDataId,
    });
  };

  // Helper functions
  const uploadKeywords = useCallback((file: File) => {
    return uploadKeywordsMutation.mutateAsync(file);
  }, [uploadKeywordsMutation]);

  const crawlKeywords = useCallback((request: KeywordCrawlRequest) => {
    return crawlKeywordsMutation.mutateAsync(request);
  }, [crawlKeywordsMutation]);

  const deleteKeywordData = useCallback((keywordDataId: string) => {
    return deleteKeywordDataMutation.mutateAsync(keywordDataId);
  }, [deleteKeywordDataMutation]);

  const enrichKeywords = useCallback((keywordDataId: string) => {
    return enrichKeywordsMutation.mutateAsync(keywordDataId);
  }, [enrichKeywordsMutation]);

  const clusterKeywords = useCallback((keywordDataId: string) => {
    return clusterKeywordsMutation.mutateAsync(keywordDataId);
  }, [clusterKeywordsMutation]);

  const exportKeywords = useCallback((keywordDataId: string, format: string = 'csv') => {
    return exportKeywordsMutation.mutateAsync({ keywordDataId, format });
  }, [exportKeywordsMutation]);

  return {
    // State
    selectedKeywordData,
    setSelectedKeywordData,
    
    // Mutations
    uploadKeywords,
    crawlKeywords,
    deleteKeywordData,
    enrichKeywords,
    clusterKeywords,
    exportKeywords,
    
    // Mutation states
    isUploadingKeywords: uploadKeywordsMutation.isPending,
    isCrawlingKeywords: crawlKeywordsMutation.isPending,
    isDeletingKeywordData: deleteKeywordDataMutation.isPending,
    isEnrichingKeywords: enrichKeywordsMutation.isPending,
    isClusteringKeywords: clusterKeywordsMutation.isPending,
    isExportingKeywords: exportKeywordsMutation.isPending,
    
    // Mutation errors
    uploadKeywordsError: uploadKeywordsMutation.error,
    crawlKeywordsError: crawlKeywordsMutation.error,
    deleteKeywordDataError: deleteKeywordDataMutation.error,
    enrichKeywordsError: enrichKeywordsMutation.error,
    clusterKeywordsError: clusterKeywordsMutation.error,
    exportKeywordsError: exportKeywordsMutation.error,
    
    // Hooks
    useKeywordData,
    useKeywordDataList,
    useAnalysis,
    useClusters,
    useSuggestions,
    useAnalytics,
  };
};
