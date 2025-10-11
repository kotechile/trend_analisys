/**
 * React Query hooks for workflow operations
 * Provides data fetching and mutation hooks for the enhanced workflow
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, API_ENDPOINTS } from '../services/api';
import { 
  WorkflowSession, 
  TopicDecomposition, 
  AffiliateOffer, 
  TrendAnalysis, 
  ContentIdea, 
  KeywordCluster,
  ExternalToolResult 
} from '../types/workflow';

// Query keys
export const queryKeys = {
  workflowSessions: ['workflow-sessions'] as const,
  workflowSession: (id: string) => ['workflow-session', id] as const,
  topicDecomposition: (sessionId: string) => ['topic-decomposition', sessionId] as const,
  affiliateOffers: (sessionId: string) => ['affiliate-offers', sessionId] as const,
  trendAnalysis: (sessionId: string) => ['trend-analysis', sessionId] as const,
  contentIdeas: (sessionId: string) => ['content-ideas', sessionId] as const,
  keywordClusters: (sessionId: string) => ['keyword-clusters', sessionId] as const,
  externalToolResults: (sessionId: string) => ['external-tool-results', sessionId] as const,
  tabs: ['tabs'] as const,
} as const;

// Workflow Session Hooks
export const useWorkflowSession = (sessionId: string) => {
  return useQuery({
    queryKey: queryKeys.workflowSession(sessionId),
    queryFn: () => apiService.get<WorkflowSession>(API_ENDPOINTS.WORKFLOW_SESSION(sessionId)),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateWorkflowSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { searchQuery: string; userId: string }) =>
      apiService.post<WorkflowSession>(API_ENDPOINTS.WORKFLOW_SESSIONS, data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.workflowSession(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowSessions });
    },
  });
};

// Topic Decomposition Hooks
export const useTopicDecomposition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { searchQuery: string; sessionId: string }) =>
      apiService.post<TopicDecomposition>(API_ENDPOINTS.TOPIC_DECOMPOSITION, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.topicDecomposition(variables.sessionId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(variables.sessionId) });
    },
  });
};

// Affiliate Research Hooks
export const useAffiliateResearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { subtopicIds: string[]; sessionId: string }) =>
      apiService.post<{ offers: AffiliateOffer[]; totalFound: number }>(API_ENDPOINTS.AFFILIATE_RESEARCH, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.affiliateOffers(variables.sessionId), data.offers);
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(variables.sessionId) });
    },
  });
};

// Trend Analysis Hooks
export const useTrendAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { subtopicIds: string[]; sessionId: string }) =>
      apiService.post<TrendAnalysis>(API_ENDPOINTS.TREND_ANALYSIS, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.trendAnalysis(variables.sessionId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(variables.sessionId) });
    },
  });
};

// Content Generation Hooks
export const useContentGeneration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { 
      trendIds: string[]; 
      affiliateOfferIds?: string[]; 
      contentType?: string; 
      sessionId: string 
    }) =>
      apiService.post<{ contentIdeas: ContentIdea[]; totalGenerated: number }>(
        API_ENDPOINTS.CONTENT_GENERATE, 
        data
      ),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.contentIdeas(variables.sessionId), data.contentIdeas);
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(variables.sessionId) });
    },
  });
};

// Keyword Clustering Hooks
export const useKeywordClustering = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { 
      keywords: string[]; 
      algorithm?: string; 
      sessionId: string 
    }) =>
      apiService.post<{ clusters: KeywordCluster[]; totalClusters: number }>(
        API_ENDPOINTS.KEYWORD_CLUSTER, 
        data
      ),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.keywordClusters(variables.sessionId), data.clusters);
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(variables.sessionId) });
    },
  });
};

// External Tools Hooks
export const useExternalToolProcessing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FormData) =>
      apiService.post<{ processedKeywords: number; clusters: KeywordCluster[] }>(
        API_ENDPOINTS.EXTERNAL_TOOLS_PROCESS, 
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      ),
    onSuccess: (data, variables) => {
      // Extract sessionId from FormData
      const sessionId = variables.get('sessionId') as string;
      if (sessionId) {
        queryClient.setQueryData(queryKeys.externalToolResults(sessionId), data);
        queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(sessionId) });
      }
    },
  });
};

// Tabs Hook
export const useTabs = () => {
  return useQuery({
    queryKey: queryKeys.tabs,
    queryFn: () => apiService.get<{ tabs: any[]; activeTab: number }>(API_ENDPOINTS.TABS),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Utility hooks
export const useInvalidateWorkflowSession = () => {
  const queryClient = useQueryClient();
  
  return (sessionId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(sessionId) });
  };
};

export const useInvalidateAllWorkflowData = () => {
  const queryClient = useQueryClient();
  
  return (sessionId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workflowSession(sessionId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.topicDecomposition(sessionId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.affiliateOffers(sessionId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.trendAnalysis(sessionId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.contentIdeas(sessionId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.keywordClusters(sessionId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.externalToolResults(sessionId) });
  };
};
