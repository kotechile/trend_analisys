/**
 * Research Topics dataflow types for TrendTap platform
 * These types correspond to the backend models for complete dataflow persistence
 */

// Research Topic types
export enum ResearchTopicStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface ResearchTopic {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: ResearchTopicStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchTopicCreate {
  title: string;
  description?: string;
  status?: ResearchTopicStatus;
}

export interface ResearchTopicUpdate {
  title?: string;
  description?: string;
  status?: ResearchTopicStatus;
  version: number;
}

export interface ResearchTopicListResponse {
  items: ResearchTopic[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ResearchTopicStats {
  total_topics: number;
  active_topics: number;
  completed_topics: number;
  archived_topics: number;
  total_subtopics: number;
  total_analyses: number;
  total_content_ideas: number;
  last_activity?: string;
}

// Topic Decomposition types
export interface SubtopicItem {
  name: string;
  description: string;
}

export interface TopicDecomposition {
  id: string;
  research_topic_id: string;
  user_id: string;
  search_query: string;
  subtopics: SubtopicItem[];
  original_topic_included: boolean;
  created_at: string;
  updated_at: string;
}

export interface TopicDecompositionCreate {
  research_topic_id: string;
  search_query: string;
  subtopics: SubtopicItem[];
  original_topic_included?: boolean;
}

export interface TopicDecompositionUpdate {
  search_query?: string;
  subtopics?: SubtopicItem[];
  original_topic_included?: boolean;
}

export interface TopicDecompositionListResponse {
  items: TopicDecomposition[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TopicDecompositionStats {
  total_decompositions: number;
  total_subtopics: number;
  average_subtopics_per_decomposition: number;
  most_common_subtopic_names: Array<{
    name: string;
    count: number;
  }>;
  last_decomposition?: string;
}

export interface SubtopicAnalysis {
  subtopic_name: string;
  frequency: number;
  research_topics: string[];
  trend_analyses_count: number;
  content_ideas_count: number;
}

// Trend Analysis types
export enum TrendAnalysisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TrendData {
  search_volume?: number;
  trend_score?: number;
  interest_over_time?: Array<{
    date: string;
    value: number;
  }>;
  related_queries?: string[];
  rising_queries?: string[];
  top_queries?: string[];
  geo_data?: Array<{
    location: string;
    value: number;
  }>;
  category_data?: Array<{
    category: string;
    value: number;
  }>;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  id: string;
  user_id: string;
  topic_decomposition_id: string;
  analysis_name: string;
  description?: string;
  subtopic_name: string;
  keywords: string[];
  timeframe: string;
  geo?: string;
  status: TrendAnalysisStatus;
  trend_data?: TrendData;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TrendAnalysisCreate {
  topic_decomposition_id: string;
  analysis_name: string;
  description?: string;
  subtopic_name: string;
  keywords?: string[];
  timeframe: string;
  geo?: string;
  status?: TrendAnalysisStatus;
}

export interface TrendAnalysisUpdate {
  analysis_name?: string;
  description?: string;
  subtopic_name?: string;
  keywords?: string[];
  timeframe?: string;
  geo?: string;
  status?: TrendAnalysisStatus;
  trend_data?: TrendData;
}

export interface TrendAnalysisListResponse {
  items: TrendAnalysis[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TrendAnalysisStats {
  total_analyses: number;
  completed_analyses: number;
  failed_analyses: number;
  pending_analyses: number;
  in_progress_analyses: number;
  average_completion_time?: number;
  most_analyzed_subtopics: Array<{
    subtopic_name: string;
    count: number;
  }>;
  last_analysis?: string;
}

export interface TrendAnalysisResult {
  analysis_id: string;
  subtopic_name: string;
  trend_data: TrendData;
  insights: string[];
  recommendations: string[];
  confidence_score?: number;
  generated_at: string;
}

// Content Idea types
export enum ContentType {
  BLOG_POST = 'blog_post',
  ARTICLE = 'article',
  VIDEO = 'video',
  PODCAST = 'podcast',
  SOCIAL_MEDIA = 'social_media',
  EMAIL = 'email',
  NEWSLETTER = 'newsletter',
  WHITEPAPER = 'whitepaper',
  CASE_STUDY = 'case_study',
  GUIDE = 'guide',
  TUTORIAL = 'tutorial',
  WEBINAR = 'webinar',
  PRESENTATION = 'presentation',
  INFOGRAPHIC = 'infographic',
  CHECKLIST = 'checklist',
  TEMPLATE = 'template',
  OTHER = 'other'
}

export enum IdeaType {
  TRENDING = 'trending',
  EVERGREEN = 'evergreen',
  SEASONAL = 'seasonal',
  BREAKING = 'breaking',
  EDUCATIONAL = 'educational',
  ENTERTAINMENT = 'entertainment',
  PROMOTIONAL = 'promotional',
  THOUGHT_LEADERSHIP = 'thought_leadership',
  CASE_STUDY = 'case_study',
  HOW_TO = 'how_to',
  LIFESTYLE = 'lifestyle',
  NEWS = 'news',
  REVIEW = 'review',
  COMPARISON = 'comparison',
  OTHER = 'other'
}

export enum ContentStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled'
}

export interface ContentIdea {
  id: string;
  user_id: string;
  trend_analysis_id: string;
  research_topic_id: string;
  title: string;
  description: string;
  content_type: ContentType;
  idea_type: IdeaType;
  primary_keyword: string;
  secondary_keywords: string[];
  target_audience?: string;
  key_points: string[];
  tags: string[];
  estimated_read_time?: number;
  difficulty_level?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentIdeaCreate {
  trend_analysis_id: string;
  research_topic_id: string;
  title: string;
  description: string;
  content_type: ContentType;
  idea_type: IdeaType;
  primary_keyword: string;
  secondary_keywords?: string[];
  target_audience?: string;
  key_points?: string[];
  tags?: string[];
  estimated_read_time?: number;
  difficulty_level?: string;
  status?: ContentStatus;
}

export interface ContentIdeaUpdate {
  title?: string;
  description?: string;
  content_type?: ContentType;
  idea_type?: IdeaType;
  primary_keyword?: string;
  secondary_keywords?: string[];
  target_audience?: string;
  key_points?: string[];
  tags?: string[];
  estimated_read_time?: number;
  difficulty_level?: string;
  status?: ContentStatus;
}

export interface ContentIdeaListResponse {
  items: ContentIdea[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ContentIdeaStats {
  total_ideas: number;
  draft_ideas: number;
  published_ideas: number;
  ideas_by_type: Record<string, number>;
  ideas_by_idea_type: Record<string, number>;
  average_read_time?: number;
  most_used_keywords: Array<{
    keyword: string;
    count: number;
  }>;
  most_used_tags: Array<{
    tag: string;
    count: number;
  }>;
  last_idea_created?: string;
}

export interface ContentIdeaFilter {
  content_type?: ContentType;
  idea_type?: IdeaType;
  status?: ContentStatus;
  primary_keyword?: string;
  tags?: string[];
  difficulty_level?: string;
  created_after?: string;
  created_before?: string;
  research_topic_id?: string;
  trend_analysis_id?: string;
}

export interface ContentIdeaSearch {
  query: string;
  search_fields?: string[];
  filters?: ContentIdeaFilter;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Complete Dataflow types
export interface ResearchTopicComplete {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: ResearchTopicStatus;
  version: number;
  created_at: string;
  updated_at: string;
  subtopics: SubtopicItem[];
  trend_analyses: TrendAnalysis[];
  content_ideas: ContentIdea[];
}

export interface ResearchTopicWithSubtopics {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: ResearchTopicStatus;
  version: number;
  created_at: string;
  updated_at: string;
  subtopics: SubtopicItem[];
}

export interface TopicDecompositionWithAnalyses {
  id: string;
  research_topic_id: string;
  user_id: string;
  search_query: string;
  subtopics: SubtopicItem[];
  original_topic_included: boolean;
  created_at: string;
  updated_at: string;
  trend_analyses: TrendAnalysis[];
}

export interface TrendAnalysisWithContentIdeas {
  id: string;
  user_id: string;
  topic_decomposition_id: string;
  analysis_name: string;
  description?: string;
  subtopic_name: string;
  keywords: string[];
  timeframe: string;
  geo?: string;
  status: TrendAnalysisStatus;
  trend_data?: TrendData;
  error_message?: string;
  created_at: string;
  updated_at: string;
  content_ideas: ContentIdea[];
}

// API Request/Response types
export interface ResearchTopicSearchParams {
  query: string;
  page?: number;
  size?: number;
}

export interface ResearchTopicListParams {
  status?: ResearchTopicStatus;
  page?: number;
  size?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface TopicDecompositionListParams {
  research_topic_id?: string;
  page?: number;
  size?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface TrendAnalysisListParams {
  topic_decomposition_id?: string;
  subtopic_name?: string;
  status?: TrendAnalysisStatus;
  page?: number;
  size?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface ContentIdeaListParams {
  filters?: ContentIdeaFilter;
  page?: number;
  size?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

// Error types
export interface ResearchTopicsError {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id: string;
}

// Form types for UI components
export interface ResearchTopicFormData {
  title: string;
  description: string;
  status: ResearchTopicStatus;
  user_id?: string;
}

export interface SubtopicFormData {
  search_query: string;
  subtopics: Array<{
    name: string;
    description: string;
  }>;
  original_topic_included: boolean;
}

export interface TrendAnalysisFormData {
  analysis_name: string;
  description: string;
  subtopic_name: string;
  keywords: string[];
  timeframe: string;
  geo: string;
}

export interface ContentIdeaFormData {
  title: string;
  description: string;
  content_type: ContentType;
  idea_type: IdeaType;
  primary_keyword: string;
  secondary_keywords: string[];
  target_audience: string;
  key_points: string[];
  tags: string[];
  estimated_read_time: number;
  difficulty_level: string;
  status: ContentStatus;
}
