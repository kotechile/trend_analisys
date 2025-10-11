/**
 * Enhanced Workflow Context Provider
 * Manages the complete enhanced research workflow state including topic decomposition,
 * affiliate research, trend analysis, and content generation
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface TopicDecomposition {
  id: string;
  search_query: string;
  subtopics: Subtopic[];
  created_at: string;
}

export interface Subtopic {
  name: string;
  description: string;
  relevance_score: number;
  category: string;
}

export interface AffiliateOffer {
  id: string;
  offer_name: string;
  offer_description?: string;
  commission_rate?: string;
  access_instructions?: string;
  subtopic_id?: string;
  linkup_data: Record<string, any>;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
}

export interface TrendAnalysis {
  id: string;
  analysis_name: string;
  keywords: string[];
  timeframe: string;
  geo: string;
  trend_data: Record<string, any>;
  analysis_results: Record<string, any>;
  insights: Record<string, any>;
  source: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface KeywordCluster {
  id: string;
  cluster_name: string;
  cluster_type: string;
  keywords: any[];
  primary_keyword: string;
  secondary_keywords: string[];
  avg_search_volume?: number;
  avg_keyword_difficulty?: number;
  competition_level?: string;
  cluster_quality_score?: number;
  is_active: boolean;
  is_processed: boolean;
  is_used_for_content: boolean;
  created_at: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  status: 'draft' | 'in_progress' | 'completed' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_audience?: string;
  content_angle?: string;
  key_points: string[];
  content_outline: string[];
  primary_keyword: string;
  secondary_keywords: string[];
  enhanced_keywords: string[];
  keyword_difficulty?: number;
  search_volume?: number;
  cpc?: string;
  affiliate_offers: string[];
  affiliate_links: string[];
  monetization_strategy?: string;
  expected_revenue?: string;
  readability_score?: number;
  seo_score?: number;
  engagement_score?: number;
  word_count?: number;
  reading_time_minutes?: number;
  tags: string[];
  categories: string[];
  created_at: string;
  updated_at: string;
}

export interface ExternalToolResult {
  id: string;
  tool_name: string;
  query_type: string;
  keywords_data: any[];
  clusters_data: any[];
  total_keywords: number;
  total_clusters: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data_quality_score?: number;
  processing_time_ms?: number;
  created_at: string;
  processed_at?: string;
}

export interface WorkflowSession {
  id: string;
  session_name: string;
  description?: string;
  current_step: WorkflowStep;
  progress_percentage: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
  workflow_data: Record<string, any>;
  completed_steps: string[];
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export enum WorkflowStep {
  UPLOAD_CSV = 'upload_csv',
  SELECT_TRENDS = 'select_trends',
  GENERATE_KEYWORDS = 'generate_keywords',
  EXPORT_KEYWORDS = 'export_keywords',
  UPLOAD_EXTERNAL = 'upload_external',
  ANALYZE_RESULTS = 'analyze_results',
  TOPIC_DECOMPOSITION = 'topic_decomposition',
  AFFILIATE_RESEARCH = 'affiliate_research',
  TREND_ANALYSIS = 'trend_analysis',
  CONTENT_GENERATION = 'content_generation',
  KEYWORD_CLUSTERING = 'keyword_clustering',
  EXTERNAL_TOOL_INTEGRATION = 'external_tool_integration'
}

export interface EnhancedWorkflowState {
  // Current session
  currentSession: WorkflowSession | null;
  
  // Workflow steps data
  topicDecomposition: TopicDecomposition | null;
  selectedSubtopics: string[];
  affiliateOffers: AffiliateOffer[];
  trendAnalysis: TrendAnalysis | null;
  keywordClusters: KeywordCluster[];
  contentIdeas: ContentIdea[];
  externalToolResults: ExternalToolResult[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  currentStep: WorkflowStep;
  progressPercentage: number;
  
  // Form data
  searchQuery: string;
  selectedKeywords: string[];
  selectedClusters: string[];
  contentTypes: string[];
  targetAudience: string;
  
  // Filters and pagination
  contentIdeasFilter: {
    status?: string;
    content_type?: string;
    priority?: string;
  };
  contentIdeasPagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export type EnhancedWorkflowAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_SESSION'; payload: WorkflowSession | null }
  | { type: 'SET_TOPIC_DECOMPOSITION'; payload: TopicDecomposition | null }
  | { type: 'SET_SELECTED_SUBTOPICS'; payload: string[] }
  | { type: 'SET_AFFILIATE_OFFERS'; payload: AffiliateOffer[] }
  | { type: 'SET_TREND_ANALYSIS'; payload: TrendAnalysis | null }
  | { type: 'SET_KEYWORD_CLUSTERS'; payload: KeywordCluster[] }
  | { type: 'SET_CONTENT_IDEAS'; payload: ContentIdea[] }
  | { type: 'SET_EXTERNAL_TOOL_RESULTS'; payload: ExternalToolResult[] }
  | { type: 'SET_CURRENT_STEP'; payload: WorkflowStep }
  | { type: 'SET_PROGRESS_PERCENTAGE'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_KEYWORDS'; payload: string[] }
  | { type: 'SET_SELECTED_CLUSTERS'; payload: string[] }
  | { type: 'SET_CONTENT_TYPES'; payload: string[] }
  | { type: 'SET_TARGET_AUDIENCE'; payload: string }
  | { type: 'SET_CONTENT_IDEAS_FILTER'; payload: Partial<EnhancedWorkflowState['contentIdeasFilter']> }
  | { type: 'SET_CONTENT_IDEAS_PAGINATION'; payload: Partial<EnhancedWorkflowState['contentIdeasPagination']> }
  | { type: 'ADD_CONTENT_IDEA'; payload: ContentIdea }
  | { type: 'UPDATE_CONTENT_IDEA'; payload: { id: string; updates: Partial<ContentIdea> } }
  | { type: 'DELETE_CONTENT_IDEA'; payload: string }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'RESET_STEP'; payload: WorkflowStep };

// Initial state
const initialState: EnhancedWorkflowState = {
  currentSession: null,
  topicDecomposition: null,
  selectedSubtopics: [],
  affiliateOffers: [],
  trendAnalysis: null,
  keywordClusters: [],
  contentIdeas: [],
  externalToolResults: [],
  isLoading: false,
  error: null,
  currentStep: WorkflowStep.TOPIC_DECOMPOSITION,
  progressPercentage: 0,
  searchQuery: '',
  selectedKeywords: [],
  selectedClusters: [],
  contentTypes: ['blog_post'],
  targetAudience: '',
  contentIdeasFilter: {},
  contentIdeasPagination: {
    page: 1,
    limit: 20,
    total: 0
  }
};

// Reducer
function enhancedWorkflowReducer(
  state: EnhancedWorkflowState,
  action: EnhancedWorkflowAction
): EnhancedWorkflowState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'SET_TOPIC_DECOMPOSITION':
      return { ...state, topicDecomposition: action.payload };
    
    case 'SET_SELECTED_SUBTOPICS':
      return { ...state, selectedSubtopics: action.payload };
    
    case 'SET_AFFILIATE_OFFERS':
      return { ...state, affiliateOffers: action.payload };
    
    case 'SET_TREND_ANALYSIS':
      return { ...state, trendAnalysis: action.payload };
    
    case 'SET_KEYWORD_CLUSTERS':
      return { ...state, keywordClusters: action.payload };
    
    case 'SET_CONTENT_IDEAS':
      return { 
        ...state, 
        contentIdeas: action.payload,
        contentIdeasPagination: {
          ...state.contentIdeasPagination,
          total: action.payload.length
        }
      };
    
    case 'SET_EXTERNAL_TOOL_RESULTS':
      return { ...state, externalToolResults: action.payload };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_PROGRESS_PERCENTAGE':
      return { ...state, progressPercentage: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SELECTED_KEYWORDS':
      return { ...state, selectedKeywords: action.payload };
    
    case 'SET_SELECTED_CLUSTERS':
      return { ...state, selectedClusters: action.payload };
    
    case 'SET_CONTENT_TYPES':
      return { ...state, contentTypes: action.payload };
    
    case 'SET_TARGET_AUDIENCE':
      return { ...state, targetAudience: action.payload };
    
    case 'SET_CONTENT_IDEAS_FILTER':
      return { 
        ...state, 
        contentIdeasFilter: { ...state.contentIdeasFilter, ...action.payload }
      };
    
    case 'SET_CONTENT_IDEAS_PAGINATION':
      return { 
        ...state, 
        contentIdeasPagination: { ...state.contentIdeasPagination, ...action.payload }
      };
    
    case 'ADD_CONTENT_IDEA':
      return { 
        ...state, 
        contentIdeas: [...state.contentIdeas, action.payload],
        contentIdeasPagination: {
          ...state.contentIdeasPagination,
          total: state.contentIdeasPagination.total + 1
        }
      };
    
    case 'UPDATE_CONTENT_IDEA':
      return {
        ...state,
        contentIdeas: state.contentIdeas.map(idea =>
          idea.id === action.payload.id
            ? { ...idea, ...action.payload.updates }
            : idea
        )
      };
    
    case 'DELETE_CONTENT_IDEA':
      return {
        ...state,
        contentIdeas: state.contentIdeas.filter(idea => idea.id !== action.payload),
        contentIdeasPagination: {
          ...state.contentIdeasPagination,
          total: state.contentIdeasPagination.total - 1
        }
      };
    
    case 'RESET_WORKFLOW':
      return initialState;
    
    case 'RESET_STEP':
      return {
        ...state,
        [action.payload]: null,
        progressPercentage: Math.max(0, state.progressPercentage - 10)
      };
    
    default:
      return state;
  }
}

// Context
const EnhancedWorkflowContext = createContext<{
  state: EnhancedWorkflowState;
  dispatch: React.Dispatch<EnhancedWorkflowAction>;
} | null>(null);

// Provider component
export function EnhancedWorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(enhancedWorkflowReducer, initialState);

  return (
    <EnhancedWorkflowContext.Provider value={{ state, dispatch }}>
      {children}
    </EnhancedWorkflowContext.Provider>
  );
}

// Hook to use the context
export function useEnhancedWorkflow() {
  const context = useContext(EnhancedWorkflowContext);
  if (!context) {
    throw new Error('useEnhancedWorkflow must be used within an EnhancedWorkflowProvider');
  }
  return context;
}

// Helper hooks for specific workflow steps
export function useTopicDecomposition() {
  const { state, dispatch } = useEnhancedWorkflow();
  
  return {
    topicDecomposition: state.topicDecomposition,
    selectedSubtopics: state.selectedSubtopics,
    setTopicDecomposition: (data: TopicDecomposition | null) => 
      dispatch({ type: 'SET_TOPIC_DECOMPOSITION', payload: data }),
    setSelectedSubtopics: (subtopics: string[]) => 
      dispatch({ type: 'SET_SELECTED_SUBTOPICS', payload: subtopics })
  };
}

export function useAffiliateResearch() {
  const { state, dispatch } = useEnhancedWorkflow();
  
  return {
    affiliateOffers: state.affiliateOffers,
    setAffiliateOffers: (offers: AffiliateOffer[]) => 
      dispatch({ type: 'SET_AFFILIATE_OFFERS', payload: offers })
  };
}

export function useTrendAnalysis() {
  const { state, dispatch } = useEnhancedWorkflow();
  
  return {
    trendAnalysis: state.trendAnalysis,
    setTrendAnalysis: (analysis: TrendAnalysis | null) => 
      dispatch({ type: 'SET_TREND_ANALYSIS', payload: analysis })
  };
}

export function useKeywordClustering() {
  const { state, dispatch } = useEnhancedWorkflow();
  
  return {
    keywordClusters: state.keywordClusters,
    selectedClusters: state.selectedClusters,
    setKeywordClusters: (clusters: KeywordCluster[]) => 
      dispatch({ type: 'SET_KEYWORD_CLUSTERS', payload: clusters }),
    setSelectedClusters: (clusters: string[]) => 
      dispatch({ type: 'SET_SELECTED_CLUSTERS', payload: clusters })
  };
}

export function useContentGeneration() {
  const { state, dispatch } = useEnhancedWorkflow();
  
  return {
    contentIdeas: state.contentIdeas,
    contentTypes: state.contentTypes,
    targetAudience: state.targetAudience,
    contentIdeasFilter: state.contentIdeasFilter,
    contentIdeasPagination: state.contentIdeasPagination,
    setContentIdeas: (ideas: ContentIdea[]) => 
      dispatch({ type: 'SET_CONTENT_IDEAS', payload: ideas }),
    setContentTypes: (types: string[]) => 
      dispatch({ type: 'SET_CONTENT_TYPES', payload: types }),
    setTargetAudience: (audience: string) => 
      dispatch({ type: 'SET_TARGET_AUDIENCE', payload: audience }),
    setContentIdeasFilter: (filter: Partial<EnhancedWorkflowState['contentIdeasFilter']>) => 
      dispatch({ type: 'SET_CONTENT_IDEAS_FILTER', payload: filter }),
    setContentIdeasPagination: (pagination: Partial<EnhancedWorkflowState['contentIdeasPagination']>) => 
      dispatch({ type: 'SET_CONTENT_IDEAS_PAGINATION', payload: pagination }),
    addContentIdea: (idea: ContentIdea) => 
      dispatch({ type: 'ADD_CONTENT_IDEA', payload: idea }),
    updateContentIdea: (id: string, updates: Partial<ContentIdea>) => 
      dispatch({ type: 'UPDATE_CONTENT_IDEA', payload: { id, updates } }),
    deleteContentIdea: (id: string) => 
      dispatch({ type: 'DELETE_CONTENT_IDEA', payload: id })
  };
}

export function useExternalToolIntegration() {
  const { state, dispatch } = useEnhancedWorkflow();
  
  return {
    externalToolResults: state.externalToolResults,
    setExternalToolResults: (results: ExternalToolResult[]) => 
      dispatch({ type: 'SET_EXTERNAL_TOOL_RESULTS', payload: results })
  };
}

export function useWorkflowProgress() {
  const { state, dispatch } = useEnhancedWorkflow();
  
  return {
    currentStep: state.currentStep,
    progressPercentage: state.progressPercentage,
    isLoading: state.isLoading,
    error: state.error,
    setCurrentStep: (step: WorkflowStep) => 
      dispatch({ type: 'SET_CURRENT_STEP', payload: step }),
    setProgressPercentage: (percentage: number) => 
      dispatch({ type: 'SET_PROGRESS_PERCENTAGE', payload: percentage }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    resetWorkflow: () => 
      dispatch({ type: 'RESET_WORKFLOW' }),
    resetStep: (step: WorkflowStep) => 
      dispatch({ type: 'RESET_STEP', payload: step })
  };
}
