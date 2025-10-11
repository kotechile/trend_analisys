/**
 * TypeScript types for Idea Burst data structures
 */

// Base idea burst session interface
export interface IdeaBurstSession {
  id: string;
  user_id: string;
  file_id?: string;
  ideas: ContentIdea[];
  selected_ideas: string[];
  filters: IdeaBurstFilters;
  sort_by: string;
  status: IdeaBurstSessionStatus;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  metadata: IdeaBurstMetadata;
}

// Content idea interface
export interface ContentIdea {
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
  bookmarked?: boolean;
  favorited?: boolean;
  tags?: string[];
  status?: ContentIdeaStatus;
  author_id?: string;
  project_id?: string;
  version: number;
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

// Idea burst session status
export type IdeaBurstSessionStatus = 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'expired' 
  | 'cancelled';

// Idea burst filters
export interface IdeaBurstFilters {
  content_type: string;
  min_score: number;
  max_difficulty: number;
  min_volume: number;
  max_volume: number;
  tags: string[];
  keywords: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

// Idea burst metadata
export interface IdeaBurstMetadata {
  generation_method: GenerationMethod;
  source_data: SourceData;
  quality_metrics: QualityMetrics;
  performance_estimates: PerformanceEstimates;
  user_preferences: UserPreferences;
  session_settings: SessionSettings;
}

// Generation methods
export type GenerationMethod = 
  | 'seed_keywords' 
  | 'ahrefs_data' 
  | 'competitor_analysis' 
  | 'trend_analysis' 
  | 'ai_generation' 
  | 'hybrid';

// Source data
export interface SourceData {
  keywords_analyzed: number;
  competitors_analyzed: number;
  trends_analyzed: number;
  data_sources: string[];
  confidence_score: number;
  processing_time: number;
  last_updated: string;
}

// Quality metrics
export interface QualityMetrics {
  uniqueness_score: number;
  relevance_score: number;
  completeness_score: number;
  originality_score: number;
  overall_quality: QualityLevel;
  improvement_areas: string[];
}

// Quality levels
export type QualityLevel = 'poor' | 'fair' | 'good' | 'excellent';

// Performance estimates
export interface PerformanceEstimates {
  estimated_traffic: number;
  estimated_rankings: number;
  estimated_conversions: number;
  estimated_revenue: number;
  confidence_level: number;
  time_to_rank: string;
  competition_level: CompetitionLevel;
}

// Competition levels
export type CompetitionLevel = 'low' | 'medium' | 'high' | 'very_high';

// User preferences
export interface UserPreferences {
  preferred_content_types: ContentType[];
  target_audience: TargetAudience;
  content_goals: ContentGoal[];
  optimization_focus: OptimizationFocus[];
  difficulty_preference: DifficultyPreference;
  language: string;
  country: string;
  timezone: string;
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

// User journey stages
export type UserJourneyStage = 'awareness' | 'consideration' | 'decision' | 'retention';

// Content preferences
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

// Content goals
export interface ContentGoal {
  id: string;
  type: ContentGoalType;
  description: string;
  target_metric: string;
  target_value: number;
  priority: Priority;
  deadline?: string;
}

// Content goal types
export type ContentGoalType = 
  | 'traffic' 
  | 'conversions' 
  | 'engagement' 
  | 'brand_awareness' 
  | 'lead_generation' 
  | 'sales' 
  | 'education' 
  | 'entertainment';

// Priorities
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Optimization focus
export type OptimizationFocus = 
  | 'seo' 
  | 'conversion' 
  | 'engagement' 
  | 'branding' 
  | 'technical' 
  | 'content_quality';

// Difficulty preferences
export type DifficultyPreference = 'easy' | 'medium' | 'hard' | 'expert';

// Session settings
export interface SessionSettings {
  auto_save: boolean;
  notifications: boolean;
  collaboration: boolean;
  privacy_level: PrivacyLevel;
  sharing_permissions: SharingPermissions;
}

// Privacy levels
export type PrivacyLevel = 'private' | 'team' | 'organization' | 'public';

// Sharing permissions
export interface SharingPermissions {
  can_view: string[];
  can_edit: string[];
  can_share: string[];
  can_export: string[];
}

// Optimization tip
export interface OptimizationTip {
  id: string;
  category: OptimizationTipCategory;
  title: string;
  description: string;
  priority: Priority;
  difficulty: DifficultyPreference;
  impact: ImpactLevel;
  examples: string[];
  resources: string[];
  created_at: string;
  updated_at?: string;
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
  | 'structure' 
  | 'performance' 
  | 'accessibility';

// Impact levels
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

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
  created_at: string;
  updated_at?: string;
}

// Idea burst generation options
export interface IdeaBurstGenerationOptions {
  method: GenerationMethod;
  seed_keywords?: string[];
  ahrefs_file_id?: string;
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
  user_preferences: UserPreferences;
  session_settings: SessionSettings;
}

// Idea burst generation response
export interface IdeaBurstGenerationResponse {
  session_id: string;
  ideas: ContentIdea[];
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
  user_feedback: UserFeedback;
  recommendations: Recommendation[];
}

// User feedback
export interface UserFeedback {
  satisfaction_score: number;
  usefulness_score: number;
  relevance_score: number;
  comments: string[];
  suggestions: string[];
  created_at: string;
}

// Recommendations
export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  impact: ImpactLevel;
  effort: EffortLevel;
  examples: string[];
  resources: string[];
  created_at: string;
}

// Recommendation types
export type RecommendationType = 
  | 'content_improvement' 
  | 'seo_optimization' 
  | 'keyword_strategy' 
  | 'technical_enhancement' 
  | 'user_experience' 
  | 'performance_optimization';

// Effort levels
export type EffortLevel = 'low' | 'medium' | 'high' | 'expert';

// Idea burst session filters
export interface IdeaBurstSessionFilters {
  status?: IdeaBurstSessionStatus[];
  user_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  generation_method?: GenerationMethod[];
  min_ideas?: number;
  max_ideas?: number;
  content_types?: ContentType[];
  tags?: string[];
  keywords?: string[];
}

// Idea burst session sorting
export interface IdeaBurstSessionSorting {
  field: IdeaBurstSessionSortField;
  direction: SortDirection;
}

// Idea burst session sort fields
export type IdeaBurstSessionSortField = 
  | 'created_at' 
  | 'updated_at' 
  | 'ideas_count' 
  | 'status' 
  | 'generation_method' 
  | 'quality_score' 
  | 'performance_score';

// Sort directions
export type SortDirection = 'asc' | 'desc';

// Idea burst statistics
export interface IdeaBurstStatistics {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  expired_sessions: number;
  total_ideas_generated: number;
  average_ideas_per_session: number;
  most_popular_content_types: Record<ContentType, number>;
  generation_method_usage: Record<GenerationMethod, number>;
  user_engagement: UserEngagementMetrics;
  performance_metrics: PerformanceMetrics;
  quality_metrics: QualityMetrics;
  trend_analysis: TrendAnalysis;
}

// User engagement metrics
export interface UserEngagementMetrics {
  average_session_duration: number;
  ideas_selected_rate: number;
  ideas_bookmarked_rate: number;
  ideas_favorited_rate: number;
  ideas_exported_rate: number;
  session_completion_rate: number;
  user_retention_rate: number;
  satisfaction_score: number;
}

// Performance metrics
export interface PerformanceMetrics {
  average_generation_time: number;
  success_rate: number;
  error_rate: number;
  user_satisfaction: number;
  system_uptime: number;
  response_time: number;
  throughput: number;
}

// Trend analysis
export interface TrendAnalysis {
  popular_content_types: ContentType[];
  trending_keywords: string[];
  seasonal_patterns: SeasonalPattern[];
  user_behavior_trends: UserBehaviorTrend[];
  performance_trends: PerformanceTrend[];
}

// Seasonal patterns
export interface SeasonalPattern {
  pattern_type: 'seasonal' | 'cyclical' | 'trending' | 'stable';
  peak_months: string[];
  low_months: string[];
  description: string;
  confidence: number;
}

// User behavior trends
export interface UserBehaviorTrend {
  metric: string;
  trend_direction: TrendDirection;
  change_percentage: number;
  time_period: string;
  description: string;
}

// Performance trends
export interface PerformanceTrend {
  metric: string;
  trend_direction: TrendDirection;
  change_percentage: number;
  time_period: string;
  description: string;
}

// Trend directions
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

// Idea burst export options
export interface IdeaBurstExportOptions {
  format: ExportFormat;
  include_optimization_tips: boolean;
  include_content_outlines: boolean;
  include_keyword_data: boolean;
  include_metadata: boolean;
  include_session_info: boolean;
  include_user_feedback: boolean;
  include_recommendations: boolean;
  filters?: IdeaBurstFilters;
  sorting?: IdeaBurstSessionSorting;
}

// Export formats
export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf' | 'html' | 'markdown';

// Idea burst import options
export interface IdeaBurstImportOptions {
  source: ImportSource;
  format: ImportFormat;
  mapping: Record<string, string>;
  validation_rules: ValidationRules;
  merge_strategy: MergeStrategy;
}

// Import sources
export type ImportSource = 
  | 'ahrefs' 
  | 'semrush' 
  | 'google' 
  | 'manual' 
  | 'csv' 
  | 'json' 
  | 'xlsx' 
  | 'api';

// Import formats
export type ImportFormat = 'tsv' | 'csv' | 'xlsx' | 'json' | 'xml' | 'yaml';

// Validation rules
export interface ValidationRules {
  required_fields: string[];
  min_ideas: number;
  max_ideas: number;
  valid_content_types: ContentType[];
  valid_keywords: string[];
  min_title_length: number;
  max_title_length: number;
}

// Merge strategies
export type MergeStrategy = 'replace' | 'append' | 'merge' | 'skip_duplicates';

// Idea burst batch operations
export interface IdeaBurstBatchOperation {
  operation: BatchOperationType;
  session_ids: string[];
  idea_ids?: string[];
  data?: Partial<IdeaBurstSession>;
  options?: BatchOperationOptions;
}

// Batch operation types
export type BatchOperationType = 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'archive' 
  | 'favorite' 
  | 'bookmark' 
  | 'tag' 
  | 'status_change' 
  | 'merge' 
  | 'duplicate';

// Batch operation options
export interface BatchOperationOptions {
  preserve_metadata: boolean;
  update_timestamps: boolean;
  notify_users: boolean;
  backup_before_operation: boolean;
  rollback_on_error: boolean;
}

// Idea burst batch operation result
export interface IdeaBurstBatchOperationResult {
  operation_id: string;
  status: OperationStatus;
  total_sessions: number;
  successful_sessions: number;
  failed_sessions: number;
  errors: string[];
  warnings: string[];
  created_at: string;
  completed_at?: string;
  rollback_available: boolean;
}

// Operation status
export type OperationStatus = 'pending' | 'processing' | 'completed' | 'error' | 'cancelled';

// Idea burst validation
export interface IdeaBurstValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  quality_score: number;
  improvement_areas: string[];
  seo_recommendations: SEORecommendation[];
  performance_recommendations: PerformanceRecommendation[];
}

// SEO recommendations
export interface SEORecommendation {
  category: string;
  title: string;
  description: string;
  priority: Priority;
  impact: ImpactLevel;
  effort: EffortLevel;
  examples: string[];
  resources: string[];
  created_at: string;
}

// Performance recommendations
export interface PerformanceRecommendation {
  category: string;
  title: string;
  description: string;
  priority: Priority;
  impact: ImpactLevel;
  effort: EffortLevel;
  examples: string[];
  resources: string[];
  created_at: string;
}

// Idea burst service interface
export interface IdeaBurstServiceInterface {
  createSession(options: IdeaBurstGenerationOptions): Promise<IdeaBurstSession>;
  getSession(sessionId: string): Promise<IdeaBurstSession | null>;
  updateSession(sessionId: string, updates: Partial<IdeaBurstSession>): Promise<IdeaBurstSession>;
  deleteSession(sessionId: string): Promise<void>;
  getUserSessions(userId: string, filters?: IdeaBurstSessionFilters, sorting?: IdeaBurstSessionSorting): Promise<IdeaBurstSession[]>;
  generateIdeas(options: IdeaBurstGenerationOptions): Promise<ContentIdea[]>;
  addIdeasToSession(sessionId: string, ideas: ContentIdea[]): Promise<IdeaBurstSession>;
  selectIdea(sessionId: string, ideaId: string): Promise<IdeaBurstSession>;
  updateSessionFilters(sessionId: string, filters: Partial<IdeaBurstFilters>): Promise<IdeaBurstSession>;
  exportSessionIdeas(sessionId: string, options: IdeaBurstExportOptions): Promise<Blob>;
  importSessionIdeas(file: File, options: IdeaBurstImportOptions): Promise<IdeaBurstSession>;
  getStatistics(): Promise<IdeaBurstStatistics>;
  validateSession(session: Partial<IdeaBurstSession>): Promise<IdeaBurstValidation>;
  batchOperation(operation: IdeaBurstBatchOperation): Promise<IdeaBurstBatchOperationResult>;
  cleanupExpiredSessions(): Promise<number>;
}

// Utility types
export type IdeaBurstField = keyof IdeaBurstSession;
export type IdeaBurstSortField = IdeaBurstSessionSortField;
export type IdeaBurstStatus = IdeaBurstSessionStatus;
export type IdeaBurstFormat = ExportFormat;
export type IdeaBurstSource = ImportSource;
