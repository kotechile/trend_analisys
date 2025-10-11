/**
 * Core entity types for TrendTap platform
 */

// User related types
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  PREMIUM_USER = 'premium_user'
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export interface User {
  id: string;
  username: string;
  email: string;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  statistics?: UserStatistics;
  limits?: UserLimits;
}

export interface UserStatistics {
  affiliate_researches: number;
  trend_analyses: number;
  content_ideas: number;
  software_solutions: number;
  calendar_entries: number;
  total_activities: number;
}

export interface UserLimits {
  affiliate_researches: number;
  trend_analyses: number;
  content_ideas: number;
  software_solutions: number;
  calendar_entries: number;
}

// Affiliate Research types
export enum ResearchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface AffiliateResearch {
  id: string;
  user_id: string;
  niche: string;
  status: ResearchStatus;
  programs_data: AffiliateProgramsData;
  selected_programs: string[];
  created_at: string;
  updated_at: string;
  estimated_completion_time?: string;
}

export interface AffiliateProgramsData {
  programs: AffiliateProgram[];
  total_count: number;
  networks_searched: string[];
  search_duration: number;
}

export interface AffiliateProgram {
  id: string;
  name: string;
  network: string;
  epc: number;
  reversal_rate: number;
  cookie_length: number;
  commission: number;
  description: string;
  url: string;
  category: string;
  is_selected: boolean;
}

// Trend Analysis types
export enum AnalysisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface TrendAnalysis {
  id: string;
  user_id: string;
  affiliate_research_id?: string;
  keyword: string;
  geo: string;
  historical_data: TrendHistoricalData;
  forecast_data: TrendForecastData;
  opportunity_score: number;
  status: AnalysisStatus;
  created_at: string;
  updated_at: string;
  estimated_completion_time?: string;
  trend_insights?: TrendInsights;
}

export interface TrendHistoricalData {
  time_series: TrendDataPoint[];
  peak_periods: TrendPeakPeriod[];
  seasonal_patterns: SeasonalPattern[];
  correlation_factors: CorrelationFactor[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  relative_value: number;
}

export interface TrendPeakPeriod {
  start_date: string;
  end_date: string;
  peak_value: number;
  reason?: string;
}

export interface SeasonalPattern {
  pattern_type: string;
  confidence: number;
  description: string;
}

export interface CorrelationFactor {
  factor: string;
  correlation: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface TrendForecastData {
  forecast_periods: ForecastPeriod[];
  confidence_score: number;
  trend_direction: 'up' | 'down' | 'stable';
  key_drivers: string[];
  risks: string[];
}

export interface ForecastPeriod {
  period: string;
  predicted_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

export interface TrendInsights {
  market_opportunity: string;
  competitive_landscape: string;
  growth_potential: string;
  risk_factors: string[];
  recommendations: string[];
}

// Keyword Data types
export enum KeywordSource {
  UPLOAD = 'upload',
  CRAWL = 'crawl'
}

export interface KeywordData {
  id: string;
  user_id: string;
  trend_analysis_id?: string;
  source: KeywordSource;
  keywords: Keyword[];
  clusters: KeywordCluster[];
  gap_analysis: GapAnalysis;
  priority_score: number;
  created_at: string;
  updated_at: string;
}

export interface Keyword {
  keyword: string;
  search_volume: number;
  competition: 'low' | 'medium' | 'high';
  cpc: number;
  priority_score: number;
  difficulty: number;
  opportunity_score: number;
  related_keywords: string[];
  serp_features: string[];
}

export interface KeywordCluster {
  id: string;
  name: string;
  keywords: string[];
  priority_score: number;
  search_volume: number;
  competition_level: 'low' | 'medium' | 'high';
  opportunity_score: number;
}

export interface GapAnalysis {
  high_opportunity_keywords: string[];
  low_competition_keywords: string[];
  trending_keywords: string[];
  long_tail_keywords: string[];
  content_gaps: ContentGap[];
}

export interface ContentGap {
  keyword: string;
  gap_type: 'missing_content' | 'weak_content' | 'outdated_content';
  opportunity_score: number;
  recommended_action: string;
}

// Content Ideas types
export enum IdeaStatus {
  GENERATED = 'generated',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export interface ContentIdeas {
  id: string;
  user_id: string;
  trend_analysis_id?: string;
  keyword_data_id?: string;
  title: string;
  opportunity_score: number;
  article_angles: ArticleAngle[];
  content_outlines: ContentOutline;
  seo_recommendations: SEORecommendations;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

export interface ArticleAngle {
  id: string;
  title: string;
  angle_type: 'how_to' | 'vs' | 'listicle' | 'pain_point' | 'story';
  headline: string;
  hook: string;
  target_audience: string;
  key_points: string[];
  estimated_word_count: number;
  seo_score: number;
  readability_score: number;
}

export interface ContentOutline {
  [angleId: string]: {
    title: string;
    sections: ContentSection[];
    word_count: number;
    seo_score: number;
    readability_score: number;
    target_keywords: string[];
    meta_description: string;
  };
}

export interface ContentSection {
  heading: string;
  subheadings: string[];
  key_points: string[];
  word_count: number;
  seo_notes: string[];
}

export interface SEORecommendations {
  target_keywords: string[];
  meta_title: string;
  meta_description: string;
  internal_links: string[];
  external_links: string[];
  schema_markup: string[];
  image_alt_text: string[];
  readability_tips: string[];
}

// Software Solutions types
export enum SoftwareType {
  CALCULATOR = 'calculator',
  ANALYZER = 'analyzer',
  GENERATOR = 'generator',
  CONVERTER = 'converter',
  ESTIMATOR = 'estimator'
}

export enum DevelopmentStatus {
  IDEA = 'idea',
  PLANNED = 'planned',
  IN_DEVELOPMENT = 'in_development',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface SoftwareSolutions {
  id: string;
  user_id: string;
  trend_analysis_id?: string;
  keyword_data_id?: string;
  software_solutions: SoftwareSolution[];
  created_at: string;
  updated_at?: string;
}

export interface SoftwareSolution {
  id: string;
  name: string;
  description: string;
  software_type: SoftwareType;
  complexity_score: number;
  priority_score: number;
  target_keywords: string[];
  technical_requirements: TechnicalRequirements;
  estimated_development_time: string;
  development_phases: DevelopmentPhase[];
  monetization_strategy: MonetizationStrategy;
  seo_optimization: SEOOptimization;
  status: DevelopmentStatus;
}

export interface TechnicalRequirements {
  frontend: string;
  backend: string;
  database: string;
  features: string[];
  apis?: string[];
  ml_services?: string[];
}

export interface DevelopmentPhase {
  phase: string;
  duration: string;
  tasks: string[];
}

export interface MonetizationStrategy {
  primary: string;
  free_features: string[];
  premium_features: string[];
  affiliate_products: string[];
}

export interface SEOOptimization {
  target_keywords: string[];
  meta_description: string;
  content_strategy: string[];
}

// Content Calendar types
export enum CalendarItemType {
  CONTENT = 'content',
  SOFTWARE = 'software'
}

export enum CalendarStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
  ARCHIVED = 'archived'
}

export interface ContentCalendar {
  id: string;
  user_id: string;
  content_idea_id?: string;
  software_solution_id?: string;
  item_type: CalendarItemType;
  title: string;
  scheduled_date: string;
  status: CalendarStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  content?: {
    id: string;
    title: string;
    opportunity_score: number;
  };
  software?: {
    id: string;
    name: string;
    complexity_score: number;
  };
}

// Export types
export interface ExportTemplate {
  id: number;
  name: string;
  platform: string;
  content_type: string;
  description: string;
  fields: Record<string, any>;
  created_at: string;
}

export interface ExportRequest {
  content_id: string;
  template_id: number;
  custom_fields?: Record<string, any>;
}

export interface ExportResponse {
  success: boolean;
  platform: string;
  export_url: string;
  exported_at: string;
  additional_data?: Record<string, any>;
}

// Analytics types
export interface AnalyticsData {
  total_entries: number;
  content_entries: number;
  software_entries: number;
  status_breakdown: Record<string, number>;
  monthly_breakdown: Record<string, number>;
  completion_rate: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// Request types
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface DateRangeParams {
  start_date: string;
  end_date: string;
}

export interface FilterParams {
  status?: string;
  content_type?: string;
  software_type?: string;
  platform?: string;
}
