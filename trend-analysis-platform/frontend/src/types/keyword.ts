/**
 * TypeScript types for keyword-related data structures
 */

// Base keyword interface
export interface Keyword {
  id?: string;
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  intents: string[];
  opportunity_score: number;
  created_at?: string;
  updated_at?: string;
}

// Keyword analysis filters
export interface KeywordFilters {
  search?: string;
  intent?: string;
  min_volume?: number;
  max_volume?: number;
  min_difficulty?: number;
  max_difficulty?: number;
  min_cpc?: number;
  max_cpc?: number;
  min_score?: number;
  max_score?: number;
}

// Keyword sorting options
export interface KeywordSortOptions {
  field: 'keyword' | 'volume' | 'difficulty' | 'cpc' | 'opportunity_score';
  direction: 'asc' | 'desc';
}

// Keyword table props
export interface KeywordTableProps {
  keywords: Keyword[];
  onKeywordSelect?: (keyword: Keyword) => void;
  onKeywordBookmark?: (keyword: Keyword) => void;
  onKeywordShare?: (keyword: Keyword) => void;
  selectable?: boolean;
  showFilters?: boolean;
  maxRows?: number;
  filters?: KeywordFilters;
  sortOptions?: KeywordSortOptions;
  loading?: boolean;
  error?: string;
}

// Keyword analysis summary
export interface KeywordAnalysisSummary {
  total_keywords: number;
  total_volume: number;
  average_difficulty: number;
  average_cpc: number;
  intent_distribution: Record<string, number>;
  top_keywords: Keyword[];
  high_opportunity_keywords: Keyword[];
}

// Keyword clustering
export interface KeywordCluster {
  id: string;
  keywords: Keyword[];
  topic: string;
  similarity_score: number;
  primary_keyword: string;
  total_volume: number;
  average_difficulty: number;
  average_cpc: number;
}

// Keyword search intent
export type SearchIntent = 'Informational' | 'Commercial' | 'Navigational' | 'Transactional';

// Keyword difficulty levels
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

// Keyword opportunity levels
export type OpportunityLevel = 'Low' | 'Medium' | 'High';

// Keyword metrics
export interface KeywordMetrics {
  volume_score: number;
  difficulty_score: number;
  cpc_score: number;
  intent_score: number;
  opportunity_score: number;
  competition_level: DifficultyLevel;
  value_potential: OpportunityLevel;
}

// Keyword comparison
export interface KeywordComparison {
  keyword1: Keyword;
  keyword2: Keyword;
  similarity_score: number;
  volume_difference: number;
  difficulty_difference: number;
  cpc_difference: number;
  recommendation: 'keyword1' | 'keyword2' | 'both' | 'neither';
}

// Keyword export options
export interface KeywordExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  fields: (keyof Keyword)[];
  filters?: KeywordFilters;
  sortOptions?: KeywordSortOptions;
}

// Keyword import options
export interface KeywordImportOptions {
  source: 'ahrefs' | 'semrush' | 'google' | 'manual';
  format: 'tsv' | 'csv' | 'xlsx' | 'json';
  mapping: Record<string, keyof Keyword>;
  validation_rules: {
    required_fields: (keyof Keyword)[];
    min_volume?: number;
    max_volume?: number;
    valid_intents: SearchIntent[];
  };
}

// Keyword analysis request
export interface KeywordAnalysisRequest {
  file_id: string;
  analysis_options: {
    include_clustering: boolean;
    include_competitor_analysis: boolean;
    include_trend_analysis: boolean;
    min_volume_threshold: number;
    max_difficulty_threshold: number;
  };
  filters?: KeywordFilters;
}

// Keyword analysis response
export interface KeywordAnalysisResponse {
  analysis_id: string;
  file_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  summary: KeywordAnalysisSummary;
  keywords: Keyword[];
  clusters: KeywordCluster[];
  recommendations: KeywordRecommendation[];
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

// Keyword recommendation
export interface KeywordRecommendation {
  id: string;
  keyword: Keyword;
  recommendation_type: 'high_opportunity' | 'low_competition' | 'high_volume' | 'trending';
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
  suggested_actions: string[];
  estimated_impact: {
    traffic_potential: number;
    difficulty_score: number;
    roi_potential: number;
  };
}

// Keyword trend data
export interface KeywordTrend {
  keyword: string;
  date: string;
  volume: number;
  difficulty: number;
  cpc: number;
  position?: number;
}

// Keyword competitor analysis
export interface KeywordCompetitorAnalysis {
  keyword: string;
  competitors: {
    domain: string;
    position: number;
    title: string;
    url: string;
    estimated_traffic: number;
  }[];
  market_share: Record<string, number>;
  opportunity_score: number;
}

// Keyword research query
export interface KeywordResearchQuery {
  seed_keywords: string[];
  language: string;
  country: string;
  include_related: boolean;
  include_questions: boolean;
  include_long_tail: boolean;
  max_results: number;
}

// Keyword research response
export interface KeywordResearchResponse {
  query_id: string;
  keywords: Keyword[];
  related_keywords: Keyword[];
  question_keywords: Keyword[];
  long_tail_keywords: Keyword[];
  search_suggestions: string[];
  created_at: string;
}

// Keyword validation result
export interface KeywordValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Keyword batch operations
export interface KeywordBatchOperation {
  operation: 'update' | 'delete' | 'tag' | 'export';
  keyword_ids: string[];
  data?: Partial<Keyword>;
  tags?: string[];
  options?: Record<string, any>;
}

// Keyword batch operation result
export interface KeywordBatchOperationResult {
  operation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  total_keywords: number;
  processed_keywords: number;
  successful_keywords: number;
  failed_keywords: number;
  errors: string[];
  created_at: string;
  completed_at?: string;
}

// Keyword API endpoints
export interface KeywordApiEndpoints {
  list: string;
  get: string;
  create: string;
  update: string;
  delete: string;
  analyze: string;
  export: string;
  import: string;
  batch: string;
}

// Keyword service interface
export interface KeywordService {
  getKeywords(filters?: KeywordFilters, sortOptions?: KeywordSortOptions): Promise<Keyword[]>;
  getKeyword(id: string): Promise<Keyword>;
  createKeyword(keyword: Omit<Keyword, 'id'>): Promise<Keyword>;
  updateKeyword(id: string, keyword: Partial<Keyword>): Promise<Keyword>;
  deleteKeyword(id: string): Promise<void>;
  analyzeKeywords(fileId: string, options?: KeywordAnalysisRequest): Promise<KeywordAnalysisResponse>;
  exportKeywords(options: KeywordExportOptions): Promise<Blob>;
  importKeywords(file: File, options: KeywordImportOptions): Promise<Keyword[]>;
  batchOperation(operation: KeywordBatchOperation): Promise<KeywordBatchOperationResult>;
  getKeywordTrends(keyword: string, period: string): Promise<KeywordTrend[]>;
  getCompetitorAnalysis(keyword: string): Promise<KeywordCompetitorAnalysis>;
  researchKeywords(query: KeywordResearchQuery): Promise<KeywordResearchResponse>;
  validateKeyword(keyword: Partial<Keyword>): Promise<KeywordValidationResult>;
}

// Utility types
export type KeywordField = keyof Keyword;
export type KeywordSortField = 'keyword' | 'volume' | 'difficulty' | 'cpc' | 'opportunity_score';
export type KeywordStatus = 'active' | 'inactive' | 'archived';
export type KeywordSource = 'ahrefs' | 'semrush' | 'google' | 'manual' | 'imported';

// Keyword statistics
export interface KeywordStatistics {
  total_count: number;
  average_volume: number;
  average_difficulty: number;
  average_cpc: number;
  intent_distribution: Record<SearchIntent, number>;
  difficulty_distribution: Record<DifficultyLevel, number>;
  volume_distribution: {
    low: number;    // < 100
    medium: number; // 100-1000
    high: number;   // > 1000
  };
  top_performing_keywords: Keyword[];
  trending_keywords: Keyword[];
  underperforming_keywords: Keyword[];
}
