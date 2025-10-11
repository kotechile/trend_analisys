/**
 * TypeScript types for the enhanced workflow
 * Defines all data structures and interfaces used throughout the application
 */

// Workflow Steps Enum
export enum WorkflowStep {
  TOPIC_DECOMPOSITION = 'topic_decomposition',
  AFFILIATE_RESEARCH = 'affiliate_research',
  TREND_ANALYSIS = 'trend_analysis',
  CONTENT_GENERATION = 'content_generation',
  KEYWORD_CLUSTERING = 'keyword_clustering',
  EXTERNAL_TOOL_INTEGRATION = 'external_tool_integration',
}

// Workflow Session
export interface WorkflowSession {
  id: string;
  userId: string;
  currentStep: WorkflowStep;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Topic Decomposition
export interface TopicDecomposition {
  id: string;
  searchQuery: string;
  subtopics: Subtopic[];
  createdAt: string;
  userId: string;
}

export interface Subtopic {
  name: string;
  description: string;
  relevanceScore: number;
  selected: boolean;
}

// Affiliate Offer
export interface AffiliateOffer {
  id: string;
  name: string;
  description: string;
  commission: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  link?: string;
  instructions?: string;
  selected: boolean;
  createdAt: string;
}

// Trend Analysis
export interface TrendAnalysis {
  id: string;
  subtopicIds: string[];
  trendData: TrendData[];
  insights: string[];
  createdAt: string;
  userId: string;
}

export interface TrendData {
  keyword: string;
  searchVolume: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  competition: 'low' | 'medium' | 'high';
  opportunityScore: number;
  timeframe: string;
}

// Content Idea
export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  contentType: 'blog_post' | 'software_idea';
  targetAudience: string;
  keywords: string[];
  affiliateOffers: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
}

// Keyword Cluster
export interface KeywordCluster {
  id: string;
  name: string;
  keywords: string[];
  avgVolume: number;
  avgDifficulty: number;
  avgCPC: number;
  selected: boolean;
  createdAt: string;
}

// External Tool Result
export interface ExternalToolResult {
  id: string;
  toolName: 'semrush' | 'ahrefs' | 'ubersuggest';
  keywords: KeywordData[];
  importedAt: string;
  userId: string;
}

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
  clusterId?: string;
}

// UI State Types
export interface TabState {
  activeTab: number;
  tabData: TabData[];
  loading: boolean;
  error?: string;
}

export interface TabData {
  id: string;
  label: string;
  component: string;
  data: any;
  loading: boolean;
  error?: string;
}

export interface WorkflowStepState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  stepData: Record<WorkflowStep, any>;
  isLoading: boolean;
  error?: string;
}

// API Request/Response Types
export interface CreateWorkflowSessionRequest {
  searchQuery: string;
  userId: string;
}

export interface TopicDecompositionRequest {
  searchQuery: string;
  sessionId: string;
}

export interface AffiliateResearchRequest {
  subtopicIds: string[];
  sessionId: string;
}

export interface TrendAnalysisRequest {
  subtopicIds: string[];
  sessionId: string;
}

export interface ContentGenerationRequest {
  trendIds: string[];
  affiliateOfferIds?: string[];
  contentType?: 'blog_post' | 'software_idea' | 'both';
  sessionId: string;
}

export interface KeywordClusteringRequest {
  keywords: string[];
  algorithm?: 'kmeans' | 'dbscan' | 'hierarchical';
  sessionId: string;
}

export interface ExternalToolProcessingRequest {
  file: File;
  toolName: 'semrush' | 'ahrefs' | 'ubersuggest';
  sessionId: string;
}

// API Response Types
export interface TabsResponse {
  tabs: Tab[];
  activeTab: number;
}

export interface Tab {
  id: string;
  label: string;
  component: string;
  icon?: string;
  disabled: boolean;
  loading: boolean;
  error?: string;
}

export interface AffiliateResearchResponse {
  offers: AffiliateOffer[];
  totalFound: number;
}

export interface ContentGenerationResponse {
  contentIdeas: ContentIdea[];
  totalGenerated: number;
}

export interface KeywordClusteringResponse {
  clusters: KeywordCluster[];
  totalClusters: number;
}

export interface ExternalToolProcessingResponse {
  processedKeywords: number;
  clusters: KeywordCluster[];
}

// Error Types
export interface ApiError {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Form Types
export interface WorkflowFormData {
  searchQuery: string;
  selectedSubtopics: string[];
  selectedAffiliateOffers: string[];
  selectedTrends: string[];
  selectedContentTypes: string[];
  selectedKeywordClusters: string[];
}

// Component Props Types
export interface WorkflowStepProps {
  onNext?: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  data?: any;
  loading?: boolean;
  error?: string;
}

export interface TabNavigationProps {
  activeTab: number;
  onTabChange: (tabIndex: number) => void;
  tabs: Tab[];
}

export interface WorkflowProgressTrackerProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  totalSteps: number;
}

export interface WorkflowResultsDashboardProps {
  sessionId: string;
  onExport?: () => void;
  onSave?: () => void;
}

// Utility Types
export type WorkflowStepStatus = 'not_started' | 'loading' | 'completed' | 'error' | 'skipped';

export type ContentType = 'blog_post' | 'software_idea';

export type Priority = 'high' | 'medium' | 'low';

export type Status = 'draft' | 'in_progress' | 'completed';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type TrendDirection = 'rising' | 'falling' | 'stable';

export type Competition = 'low' | 'medium' | 'high';

export type ToolName = 'semrush' | 'ahrefs' | 'ubersuggest';

export type Algorithm = 'kmeans' | 'dbscan' | 'hierarchical';
