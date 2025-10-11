/**
 * API request and response types
 */

import {
  User,
  UserRole,
  SubscriptionTier,
  AffiliateResearch,
  ResearchStatus,
  TrendAnalysis,
  AnalysisStatus,
  KeywordData,
  KeywordSource,
  ContentIdeas,
  IdeaStatus,
  SoftwareSolutions,
  SoftwareType,
  DevelopmentStatus,
  ContentCalendar,
  CalendarItemType,
  CalendarStatus,
  ExportTemplate,
  ExportRequest,
  ExportResponse,
  AnalyticsData,
  PaginatedResponse,
  PaginationParams,
  DateRangeParams,
  FilterParams
} from './entities';

// User API types
export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserRegistrationResponse {
  success: boolean;
  user_id: string;
  username: string;
  email: string;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  created_at: string;
  token: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  success: boolean;
  user_id: string;
  username: string;
  email: string;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  last_login?: string;
  token: string;
}

export interface UserProfileResponse {
  user_id: string;
  username: string;
  email: string;
  subscription_tier: SubscriptionTier;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  statistics?: {
    affiliate_researches: number;
    trend_analyses: number;
    content_ideas: number;
    software_solutions: number;
    calendar_entries: number;
    total_activities: number;
  };
  limits?: {
    affiliate_researches: number;
    trend_analyses: number;
    content_ideas: number;
    software_solutions: number;
    calendar_entries: number;
  };
}

export interface UserProfileUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserDashboardResponse {
  user: {
    id: string;
    username: string;
    email: string;
    subscription_tier: SubscriptionTier;
    is_active: boolean;
  };
  recent_activity: Array<{
    type: string;
    id: string;
    title: string;
    created_at: string;
    status: string;
  }>;
  statistics: {
    affiliate_researches: number;
    trend_analyses: number;
    content_ideas: number;
    software_solutions: number;
    calendar_entries: number;
    total_activities: number;
  };
  upcoming_reminders: Array<{
    id: string;
    type: string;
    title: string;
    scheduled_date: string;
    notes?: string;
    hours_until: number;
  }>;
  subscription: {
    tier: SubscriptionTier;
    limits: Record<string, number>;
    usage: Record<string, number>;
  };
}

export interface UserAnalyticsResponse {
  total_activities: number;
  activity_breakdown: Record<string, number>;
  monthly_activity: Record<string, number>;
  subscription_usage: Record<string, number>;
  productivity_metrics: Record<string, number>;
}

// Affiliate Research API types
export interface AffiliateResearchRequest {
  niche: string;
  target_audience?: string;
  budget_range?: string;
  preferred_networks?: string[];
}

export interface AffiliateResearchResponse {
  id: string;
  niche: string;
  status: ResearchStatus;
  programs_found: number;
  created_at: string;
  estimated_completion_time?: string;
  programs_data?: any;
  selected_programs?: string[];
}

export interface AffiliateResearchListResponse {
  researches: AffiliateResearchResponse[];
  total: number;
}

export interface AffiliateResearchUpdate {
  selected_programs?: string[];
  notes?: string;
}

export interface AffiliateProgramResponse {
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

// Trend Analysis API types
export interface TrendAnalysisRequest {
  keyword: string;
  geo?: string;
  time_range?: string;
  affiliate_research_id?: string;
}

export interface TrendAnalysisResponse {
  id: string;
  keyword: string;
  geo: string;
  status: AnalysisStatus;
  opportunity_score: number;
  created_at: string;
  estimated_completion_time?: string;
  historical_data?: any;
  forecast_data?: any;
  trend_insights?: any;
}

export interface TrendAnalysisListResponse {
  analyses: TrendAnalysisResponse[];
  total: number;
}

export interface TrendAnalysisUpdate {
  notes?: string;
}

export interface TrendForecastResponse {
  analysis_id: string;
  keyword: string;
  forecast_data: any;
  confidence_score: number;
  trend_direction: string;
  seasonal_patterns: any[];
  news_impact: any;
  llm_insights: any;
}

// Keyword Management API types
export interface KeywordUploadRequest {
  file: File;
}

export interface KeywordUploadResponse {
  success: boolean;
  keywords_processed: number;
  keywords_skipped: number;
  processing_time: number;
  keyword_data_id: string;
}

export interface KeywordCrawlRequest {
  seed_keyword: string;
  depth?: number;
  geo?: string;
  language?: string;
}

export interface KeywordCrawlResponse {
  success: boolean;
  crawl_id: string;
  keywords_crawled: number;
  estimated_completion_time: string;
}

export interface KeywordDataResponse {
  id: string;
  source: KeywordSource;
  keywords_count: number;
  priority_score: number;
  created_at: string;
  keywords: any[];
  clusters: any[];
  gap_analysis: any;
}

export interface KeywordDataListResponse {
  keyword_data: KeywordDataResponse[];
  total: number;
}

export interface KeywordAnalysisResponse {
  keyword_data_id: string;
  total_keywords: number;
  high_priority_keywords: number;
  medium_priority_keywords: number;
  low_priority_keywords: number;
  clusters: any[];
  gap_analysis: any;
  competition_analysis: any;
  search_volume_analysis: any;
}

export interface KeywordClusterResponse {
  id: string;
  name: string;
  keywords: string[];
  priority_score: number;
  search_volume: number;
  competition_level: string;
  opportunity_score: number;
}

// Content Generation API types
export interface ContentGenerationRequest {
  opportunity_id: string;
  content_types?: string[];
  target_audience?: string;
  tone?: string;
  length?: string;
}

export interface ContentGenerationResponse {
  success: boolean;
  content_id: string;
  article_angles: any[];
  content_outlines: any;
  seo_recommendations: any;
  target_audience: string;
  opportunity_score: number;
  generated_at: string;
}

export interface ContentIdeasResponse {
  id: string;
  title: string;
  opportunity_score: number;
  article_angles: any[];
  content_outlines: any;
  seo_recommendations: any;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentIdeasListResponse {
  content_ideas: ContentIdeasResponse[];
  total: number;
}

export interface ContentUpdateRequest {
  title?: string;
  article_angles?: any[];
  content_outlines?: any;
  seo_recommendations?: any;
  status?: IdeaStatus;
}

export interface ContentOutlineResponse {
  content_id: string;
  angle_id: string;
  title: string;
  sections: any[];
  word_count: number;
  seo_score: number;
  readability_score: number;
  target_keywords: string[];
  meta_description: string;
}

// Software Generation API types
export interface SoftwareGenerationRequest {
  opportunity_id: string;
  trend_analysis_id: string;
  keyword_data_id: string;
  software_types?: string[];
  max_solutions?: number;
}

export interface SoftwareGenerationResponse {
  success: boolean;
  software_solutions_id: string;
  solutions_generated: number;
  estimated_completion_time?: string;
  generated_at: string;
}

export interface SoftwareSolutionsResponse {
  id: string;
  software_solutions: any[];
  created_at: string;
  updated_at?: string;
}

export interface SoftwareSolutionsListResponse {
  software_solutions: SoftwareSolutionsResponse[];
  total: number;
}

export interface SoftwareSolutionResponse {
  id: string;
  name: string;
  description: string;
  software_type: SoftwareType;
  complexity_score: number;
  priority_score: number;
  target_keywords: string[];
  technical_requirements: any;
  estimated_development_time: string;
  development_phases: any[];
  monetization_strategy: any;
  seo_optimization: any;
  status: DevelopmentStatus;
}

export interface SoftwareUpdateRequest {
  status?: DevelopmentStatus;
  planned_start_date?: string;
  notes?: string;
}

// Export Integration API types
export interface ExportStatusResponse {
  export_id: string;
  status: string;
  progress: number;
  platform: string;
  export_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ExportTemplateResponse {
  id: number;
  name: string;
  platform: string;
  content_type: string;
  description: string;
  fields: Record<string, any>;
  created_at: string;
}

export interface ExportTemplateListResponse {
  templates: ExportTemplateResponse[];
  total: number;
}

// Calendar Management API types
export interface CalendarScheduleRequest {
  content_id: string;
  scheduled_date: string;
  content_type: string;
  notes?: string;
}

export interface CalendarScheduleResponse {
  success: boolean;
  calendar_entry_id: string;
  scheduled_date: string;
  status: string;
}

export interface CalendarEntryResponse {
  id: string;
  item_type: CalendarItemType;
  scheduled_date: string;
  status: CalendarStatus;
  notes?: string;
  created_at: string;
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

export interface CalendarEntryListResponse {
  entries: CalendarEntryResponse[];
  total: number;
}

export interface CalendarUpdateRequest {
  scheduled_date?: string;
  status?: CalendarStatus;
  notes?: string;
}

export interface CalendarAnalyticsResponse {
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

// Common API types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export type ApiResult<T = any> = ApiSuccess<T> | ApiFailure;

// Query parameters
export interface AffiliateResearchQuery extends PaginationParams {
  status?: ResearchStatus;
}

export interface TrendAnalysisQuery extends PaginationParams {
  status?: AnalysisStatus;
}

export interface KeywordDataQuery extends PaginationParams {
  source?: KeywordSource;
}

export interface ContentIdeasQuery extends PaginationParams {
  status?: IdeaStatus;
}

export interface SoftwareSolutionsQuery extends PaginationParams {
  software_type?: SoftwareType;
}

export interface CalendarEntriesQuery extends DateRangeParams {
  content_type?: string;
}

export interface ExportHistoryQuery extends PaginationParams {
  platform?: string;
}
