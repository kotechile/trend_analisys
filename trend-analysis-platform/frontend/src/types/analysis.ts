/**
 * TypeScript types for analysis-related data structures
 */

// Base analysis interface
export interface Analysis {
  id: string;
  file_id: string;
  user_id: string;
  status: AnalysisStatus;
  progress: number;
  message: string;
  options: AnalysisOptions;
  summary?: AnalysisSummary;
  keywords_count: number;
  content_opportunities_count: number;
  seo_content_ideas_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

// Analysis status
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'error' | 'cancelled';

// Analysis options
export interface AnalysisOptions {
  include_clustering: boolean;
  include_competitor_analysis: boolean;
  include_trend_analysis: boolean;
  min_volume_threshold: number;
  max_difficulty_threshold: number;
  content_idea_generation: boolean;
  optimization_tips: boolean;
  language: string;
  country: string;
  max_keywords: number;
}

// Analysis summary
export interface AnalysisSummary {
  total_keywords: number;
  total_volume: number;
  average_difficulty: number;
  average_cpc: number;
  intent_distribution: Record<string, number>;
  difficulty_distribution: Record<string, number>;
  volume_distribution: Record<string, number>;
  top_keywords: KeywordSummary[];
  high_opportunity_keywords: KeywordSummary[];
  trending_keywords: KeywordSummary[];
  content_opportunities: ContentOpportunitySummary[];
  seo_content_ideas: SEOContentIdeaSummary[];
}

// Keyword summary
export interface KeywordSummary {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  intents: string[];
  opportunity_score: number;
  trend_score?: number;
  competition_level: string;
  search_intent: string;
}

// Content opportunity summary
export interface ContentOpportunitySummary {
  keyword: string;
  opportunity_score: number;
  content_suggestions: string[];
  priority: 'low' | 'medium' | 'high';
  estimated_traffic: number;
  difficulty_level: string;
  commercial_value: number;
}

// SEO content idea summary
export interface SEOContentIdeaSummary {
  title: string;
  content_type: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  seo_optimization_score: number;
  traffic_potential_score: number;
  total_search_volume: number;
  average_difficulty: number;
  average_cpc: number;
  optimization_tips: string[];
  content_outline: string[];
}

// Analysis progress
export interface AnalysisProgress {
  status: AnalysisStatus;
  progress: number;
  message: string;
  current_step?: string;
  estimated_completion?: string;
  steps_completed: number;
  total_steps: number;
}

// Analysis step
export interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

// Analysis request
export interface AnalysisRequest {
  file_id: string;
  options: AnalysisOptions;
  user_id?: string;
  priority?: 'low' | 'normal' | 'high';
  callback_url?: string;
}

// Analysis response
export interface AnalysisResponse {
  analysis_id: string;
  file_id: string;
  status: AnalysisStatus;
  progress: AnalysisProgress;
  summary?: AnalysisSummary;
  created_at: string;
  estimated_completion?: string;
}

// Analysis results
export interface AnalysisResults {
  analysis_id: string;
  file_id: string;
  status: AnalysisStatus;
  summary: AnalysisSummary;
  keywords: KeywordSummary[];
  content_opportunities: ContentOpportunitySummary[];
  seo_content_ideas: SEOContentIdeaSummary[];
  clusters?: KeywordCluster[];
  trends?: KeywordTrend[];
  competitors?: CompetitorAnalysis[];
  created_at: string;
  completed_at: string;
}

// Keyword cluster
export interface KeywordCluster {
  id: string;
  name: string;
  keywords: KeywordSummary[];
  topic: string;
  similarity_score: number;
  primary_keyword: string;
  total_volume: number;
  average_difficulty: number;
  average_cpc: number;
  content_suggestions: string[];
}

// Keyword trend
export interface KeywordTrend {
  keyword: string;
  period: string;
  volume_trend: 'increasing' | 'decreasing' | 'stable';
  difficulty_trend: 'increasing' | 'decreasing' | 'stable';
  cpc_trend: 'increasing' | 'decreasing' | 'stable';
  trend_score: number;
  seasonal_pattern?: string;
  peak_months?: string[];
}

// Competitor analysis
export interface CompetitorAnalysis {
  keyword: string;
  competitors: Competitor[];
  market_share: Record<string, number>;
  opportunity_score: number;
  difficulty_rating: string;
  recommended_actions: string[];
}

// Competitor
export interface Competitor {
  domain: string;
  position: number;
  title: string;
  url: string;
  estimated_traffic: number;
  domain_authority: number;
  page_authority: number;
  backlinks: number;
  social_signals: number;
}

// Analysis filters
export interface AnalysisFilters {
  status?: AnalysisStatus[];
  date_range?: {
    start: string;
    end: string;
  };
  user_id?: string;
  file_id?: string;
  min_keywords?: number;
  max_keywords?: number;
}

// Analysis sorting
export interface AnalysisSorting {
  field: 'created_at' | 'completed_at' | 'keywords_count' | 'status';
  direction: 'asc' | 'desc';
}

// Analysis export options
export interface AnalysisExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  include_keywords: boolean;
  include_opportunities: boolean;
  include_content_ideas: boolean;
  include_summary: boolean;
  include_trends: boolean;
  include_competitors: boolean;
  filters?: AnalysisFilters;
}

// Analysis import options
export interface AnalysisImportOptions {
  source: 'ahrefs' | 'semrush' | 'google' | 'manual';
  format: 'tsv' | 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  validation_rules: {
    required_fields: string[];
    min_keywords: number;
    max_keywords: number;
    valid_intents: string[];
  };
}

// Analysis statistics
export interface AnalysisStatistics {
  total_analyses: number;
  completed_analyses: number;
  failed_analyses: number;
  pending_analyses: number;
  average_processing_time: number;
  total_keywords_analyzed: number;
  success_rate: number;
  most_common_errors: string[];
  performance_metrics: {
    average_keywords_per_analysis: number;
    average_opportunities_per_analysis: number;
    average_content_ideas_per_analysis: number;
  };
}

// Analysis validation
export interface AnalysisValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  estimated_processing_time?: number;
  resource_requirements?: {
    memory: string;
    cpu: string;
    storage: string;
  };
}

// Analysis batch operations
export interface AnalysisBatchOperation {
  operation: 'start' | 'cancel' | 'delete' | 'export';
  analysis_ids: string[];
  options?: any;
}

// Analysis batch operation result
export interface AnalysisBatchOperationResult {
  operation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  total_analyses: number;
  successful_analyses: number;
  failed_analyses: number;
  errors: string[];
  created_at: string;
  completed_at?: string;
}

// Analysis service interface
export interface AnalysisServiceInterface {
  startAnalysis(request: AnalysisRequest): Promise<AnalysisResponse>;
  getAnalysis(analysisId: string): Promise<Analysis>;
  getAnalysisStatus(analysisId: string): Promise<AnalysisProgress>;
  getAnalysisResults(analysisId: string): Promise<AnalysisResults>;
  cancelAnalysis(analysisId: string): Promise<void>;
  deleteAnalysis(analysisId: string): Promise<void>;
  listAnalyses(filters?: AnalysisFilters, sorting?: AnalysisSorting): Promise<Analysis[]>;
  exportAnalysis(analysisId: string, options: AnalysisExportOptions): Promise<Blob>;
  getAnalysisStatistics(): Promise<AnalysisStatistics>;
  validateAnalysisOptions(options: AnalysisOptions): AnalysisValidation;
  batchOperation(operation: AnalysisBatchOperation): Promise<AnalysisBatchOperationResult>;
}

// Analysis event types
export type AnalysisEventType = 
  | 'analysis_started'
  | 'analysis_progress'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'analysis_cancelled';

export interface AnalysisEvent {
  type: AnalysisEventType;
  analysis_id: string;
  timestamp: string;
  data: any;
}

// Analysis callback
export interface AnalysisCallback {
  url: string;
  events: AnalysisEventType[];
  secret?: string;
}

// Analysis queue
export interface AnalysisQueue {
  position: number;
  estimated_wait_time: number;
  priority: 'low' | 'normal' | 'high';
  queue_status: 'waiting' | 'processing' | 'completed' | 'error';
}

// Analysis performance metrics
export interface AnalysisPerformanceMetrics {
  processing_time: number;
  memory_usage: number;
  cpu_usage: number;
  keywords_per_second: number;
  bottlenecks: string[];
  recommendations: string[];
}

// Analysis quality metrics
export interface AnalysisQualityMetrics {
  accuracy_score: number;
  completeness_score: number;
  relevance_score: number;
  consistency_score: number;
  overall_quality: 'poor' | 'fair' | 'good' | 'excellent';
  improvement_suggestions: string[];
}

// Utility types
export type AnalysisField = keyof Analysis;
export type AnalysisSortField = 'created_at' | 'completed_at' | 'keywords_count' | 'status';
export type AnalysisPriority = 'low' | 'normal' | 'high';
export type AnalysisFormat = 'json' | 'csv' | 'xlsx' | 'pdf';
export type AnalysisSource = 'ahrefs' | 'semrush' | 'google' | 'manual' | 'imported';
