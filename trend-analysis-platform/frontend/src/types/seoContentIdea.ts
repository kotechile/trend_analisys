/**
 * TypeScript types for SEO content idea data structures
 */

// Base SEO content idea interface
export interface SEOContentIdea {
  id: string;
  title: string;
  content_type: ContentType;
  primary_keywords: string[];
  secondary_keywords: string[];
  seo_optimization_score: number;
  traffic_potential_score: number;
  total_search_volume: number;
  average_difficulty: number;
  average_cpc: number;
  optimization_tips: OptimizationTip[];
  content_outline: ContentOutlineSection[];
  created_at: string;
  updated_at?: string;
  status: ContentIdeaStatus;
  tags: string[];
  author_id?: string;
  project_id?: string;
  version: number;
  metadata: ContentIdeaMetadata;
}

// Content types
export type ContentType = 
  | 'article' 
  | 'comparison' 
  | 'guide' 
  | 'tutorial' 
  | 'review' 
  | 'list' 
  | 'case_study' 
  | 'whitepaper' 
  | 'infographic' 
  | 'video_script' 
  | 'podcast_script';

// Content idea status
export type ContentIdeaStatus = 
  | 'draft' 
  | 'in_progress' 
  | 'review' 
  | 'approved' 
  | 'published' 
  | 'archived';

// Optimization tip
export interface OptimizationTip {
  id: string;
  category: OptimizationTipCategory;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  examples: string[];
  resources: string[];
  created_at: string;
}

// Optimization tip categories
export type OptimizationTipCategory = 
  | 'title' 
  | 'content' 
  | 'keywords' 
  | 'technical' 
  | 'link_building' 
  | 'meta' 
  | 'images' 
  | 'structure';

// Content outline section
export interface ContentOutlineSection {
  id: string;
  title: string;
  description: string;
  order: number;
  estimated_word_count: number;
  keywords: string[];
  tips: string[];
  subsections?: ContentOutlineSection[];
}

// Content idea metadata
export interface ContentIdeaMetadata {
  source: ContentIdeaSource;
  generation_method: GenerationMethod;
  confidence_score: number;
  competition_analysis: CompetitionAnalysis;
  trend_data: TrendData;
  performance_predictions: PerformancePredictions;
  target_audience: TargetAudience;
  content_goals: ContentGoal[];
}

// Content idea sources
export type ContentIdeaSource = 
  | 'ahrefs' 
  | 'semrush' 
  | 'google' 
  | 'manual' 
  | 'ai_generated' 
  | 'imported';

// Generation methods
export type GenerationMethod = 
  | 'seed_keywords' 
  | 'competitor_analysis' 
  | 'trend_analysis' 
  | 'ai_generation' 
  | 'manual_creation';

// Competition analysis
export interface CompetitionAnalysis {
  keyword: string;
  competitors: Competitor[];
  market_share: Record<string, number>;
  opportunity_score: number;
  difficulty_rating: string;
  recommended_actions: string[];
  top_performers: TopPerformer[];
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
  content_quality_score: number;
}

// Top performer
export interface TopPerformer {
  domain: string;
  title: string;
  url: string;
  estimated_traffic: number;
  content_score: number;
  engagement_metrics: EngagementMetrics;
}

// Engagement metrics
export interface EngagementMetrics {
  average_time_on_page: number;
  bounce_rate: number;
  social_shares: number;
  comments: number;
  backlinks: number;
}

// Trend data
export interface TrendData {
  keyword: string;
  period: string;
  volume_trend: TrendDirection;
  difficulty_trend: TrendDirection;
  cpc_trend: TrendDirection;
  trend_score: number;
  seasonal_pattern?: SeasonalPattern;
  peak_months?: string[];
  historical_data: HistoricalDataPoint[];
}

// Trend direction
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

// Seasonal pattern
export interface SeasonalPattern {
  pattern_type: 'seasonal' | 'cyclical' | 'trending' | 'stable';
  peak_months: string[];
  low_months: string[];
  description: string;
}

// Historical data point
export interface HistoricalDataPoint {
  date: string;
  volume: number;
  difficulty: number;
  cpc: number;
  position?: number;
}

// Performance predictions
export interface PerformancePredictions {
  estimated_traffic: number;
  estimated_rankings: RankingPrediction[];
  estimated_conversions: number;
  estimated_revenue: number;
  time_to_rank: string;
  confidence_level: number;
}

// Ranking prediction
export interface RankingPrediction {
  keyword: string;
  predicted_position: number;
  confidence: number;
  time_to_rank: string;
  factors: RankingFactor[];
}

// Ranking factor
export interface RankingFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// Target audience
export interface TargetAudience {
  demographics: Demographics;
  interests: string[];
  pain_points: string[];
  search_intent: SearchIntent;
  content_preferences: ContentPreference[];
}

// Demographics
export interface Demographics {
  age_range: string;
  gender: string;
  location: string;
  income_level: string;
  education_level: string;
  occupation: string;
}

// Search intent
export interface SearchIntent {
  primary_intent: IntentType;
  secondary_intents: IntentType[];
  intent_confidence: number;
  user_journey_stage: UserJourneyStage;
}

// Intent types
export type IntentType = 'informational' | 'navigational' | 'transactional' | 'commercial';

// User journey stage
export type UserJourneyStage = 'awareness' | 'consideration' | 'decision' | 'retention';

// Content preference
export interface ContentPreference {
  format: ContentFormat;
  length: ContentLength;
  tone: ContentTone;
  style: ContentStyle;
}

// Content formats
export type ContentFormat = 'text' | 'video' | 'audio' | 'image' | 'interactive';

// Content lengths
export type ContentLength = 'short' | 'medium' | 'long' | 'comprehensive';

// Content tones
export type ContentTone = 'professional' | 'casual' | 'authoritative' | 'friendly' | 'technical';

// Content styles
export type ContentStyle = 'academic' | 'journalistic' | 'conversational' | 'instructional' | 'persuasive';

// Content goal
export interface ContentGoal {
  id: string;
  type: ContentGoalType;
  description: string;
  target_metric: string;
  target_value: number;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}

// Content goal types
export type ContentGoalType = 
  | 'traffic' 
  | 'conversions' 
  | 'engagement' 
  | 'brand_awareness' 
  | 'lead_generation' 
  | 'sales';

// SEO content idea filters
export interface SEOContentIdeaFilters {
  search?: string;
  content_type?: ContentType[];
  status?: ContentIdeaStatus[];
  min_score?: number;
  max_score?: number;
  min_volume?: number;
  max_volume?: number;
  min_difficulty?: number;
  max_difficulty?: number;
  tags?: string[];
  author_id?: string;
  project_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  source?: ContentIdeaSource[];
  generation_method?: GenerationMethod[];
}

// SEO content idea sorting
export interface SEOContentIdeaSorting {
  field: SEOContentIdeaSortField;
  direction: 'asc' | 'desc';
}

// SEO content idea sort fields
export type SEOContentIdeaSortField = 
  | 'title' 
  | 'created_at' 
  | 'updated_at' 
  | 'seo_optimization_score' 
  | 'traffic_potential_score' 
  | 'total_search_volume' 
  | 'average_difficulty' 
  | 'status' 
  | 'content_type';

// SEO content idea generation options
export interface SEOContentIdeaGenerationOptions {
  seed_keywords: string[];
  content_types: ContentType[];
  max_ideas: number;
  include_optimization_tips: boolean;
  include_content_outlines: boolean;
  include_keyword_data: boolean;
  include_competition_analysis: boolean;
  include_trend_analysis: boolean;
  language: string;
  country: string;
  target_audience: TargetAudience;
  content_goals: ContentGoal[];
  min_volume_threshold: number;
  max_difficulty_threshold: number;
  generation_method: GenerationMethod;
}

// SEO content idea generation response
export interface SEOContentIdeaGenerationResponse {
  session_id: string;
  ideas: SEOContentIdea[];
  total_generated: number;
  processing_time: number;
  generation_metadata: GenerationMetadata;
  created_at: string;
}

// Generation metadata
export interface GenerationMetadata {
  method: GenerationMethod;
  source_data: SourceData;
  quality_metrics: QualityMetrics;
  performance_estimates: PerformanceEstimates;
}

// Source data
export interface SourceData {
  keywords_analyzed: number;
  competitors_analyzed: number;
  trends_analyzed: number;
  data_sources: string[];
  confidence_score: number;
}

// Quality metrics
export interface QualityMetrics {
  uniqueness_score: number;
  relevance_score: number;
  completeness_score: number;
  originality_score: number;
  overall_quality: 'poor' | 'fair' | 'good' | 'excellent';
}

// Performance estimates
export interface PerformanceEstimates {
  estimated_traffic: number;
  estimated_rankings: number;
  estimated_conversions: number;
  estimated_revenue: number;
  confidence_level: number;
}

// SEO content idea export options
export interface SEOContentIdeaExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  include_optimization_tips: boolean;
  include_content_outlines: boolean;
  include_keyword_data: boolean;
  include_metadata: boolean;
  include_competition_analysis: boolean;
  include_trend_data: boolean;
  filters?: SEOContentIdeaFilters;
}

// SEO content idea import options
export interface SEOContentIdeaImportOptions {
  source: ContentIdeaSource;
  format: 'tsv' | 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  validation_rules: {
    required_fields: string[];
    min_ideas: number;
    max_ideas: number;
    valid_content_types: ContentType[];
  };
}

// SEO content idea statistics
export interface SEOContentIdeaStatistics {
  total_ideas: number;
  by_content_type: Record<ContentType, number>;
  by_status: Record<ContentIdeaStatus, number>;
  by_source: Record<ContentIdeaSource, number>;
  average_scores: {
    seo_optimization: number;
    traffic_potential: number;
  };
  top_performing_ideas: SEOContentIdea[];
  trending_ideas: SEOContentIdea[];
  underperforming_ideas: SEOContentIdea[];
  keyword_distribution: Record<string, number>;
  volume_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  difficulty_distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// SEO content idea batch operations
export interface SEOContentIdeaBatchOperation {
  operation: 'update' | 'delete' | 'tag' | 'export' | 'archive' | 'favorite' | 'bookmark' | 'status_change';
  idea_ids: string[];
  data?: Partial<SEOContentIdea>;
  tags?: string[];
  options?: Record<string, any>;
}

// SEO content idea batch operation result
export interface SEOContentIdeaBatchOperationResult {
  operation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  total_ideas: number;
  successful_ideas: number;
  failed_ideas: number;
  errors: string[];
  created_at: string;
  completed_at?: string;
}

// SEO content idea validation
export interface SEOContentIdeaValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  quality_score: number;
  improvement_areas: string[];
  seo_recommendations: SEORecommendation[];
}

// SEO recommendation
export interface SEORecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  examples: string[];
  resources: string[];
}

// SEO content idea service interface
export interface SEOContentIdeaServiceInterface {
  getContentIdeas(filters?: SEOContentIdeaFilters, sorting?: SEOContentIdeaSorting): Promise<SEOContentIdea[]>;
  getContentIdea(id: string): Promise<SEOContentIdea | null>;
  createContentIdea(idea: Omit<SEOContentIdea, 'id' | 'created_at' | 'version'>): Promise<SEOContentIdea>;
  updateContentIdea(id: string, updates: Partial<SEOContentIdea>): Promise<SEOContentIdea>;
  deleteContentIdea(id: string): Promise<void>;
  generateContentIdeas(options: SEOContentIdeaGenerationOptions): Promise<SEOContentIdeaGenerationResponse>;
  exportContentIdeas(options: SEOContentIdeaExportOptions): Promise<Blob>;
  importContentIdeas(file: File, options: SEOContentIdeaImportOptions): Promise<SEOContentIdea[]>;
  getContentIdeaStatistics(): Promise<SEOContentIdeaStatistics>;
  validateContentIdea(idea: Partial<SEOContentIdea>): Promise<SEOContentIdeaValidation>;
  batchOperation(operation: SEOContentIdeaBatchOperation): Promise<SEOContentIdeaBatchOperationResult>;
}

// Utility types
export type SEOContentIdeaField = keyof SEOContentIdea;
export type SEOContentIdeaStatus = ContentIdeaStatus;
export type SEOContentIdeaFormat = 'json' | 'csv' | 'xlsx' | 'pdf';
export type SEOContentIdeaSource = ContentIdeaSource;
