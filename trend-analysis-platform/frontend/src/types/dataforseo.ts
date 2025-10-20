/**
 * DataForSEO Types - TypeScript type definitions for DataForSEO integration
 * 
 * Defines all data structures and interfaces used throughout the DataForSEO
 * integration components and services.
 */

// Base API Response
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// Trend Analysis Types
export interface TrendData {
  keyword: string;
  location: string;
  time_series: TimelinePoint[];
  demographics?: DemographicData;
  geographic_data?: GeographicData[];
  related_queries?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TimelinePoint {
  date: string;
  value: number;
}

export interface DemographicData {
  age_groups: AgeGroupData[];
  gender_distribution: GenderData[];
  interests: string[];
}

export interface AgeGroupData {
  age_range: string;
  percentage: number;
}

export interface GenderData {
  gender: string;
  percentage: number;
}

export interface GeographicData {
  location_code: number;
  location_name: string;
  interest_value: number;
  region_type: string;
}

// Keyword Research Types
export interface KeywordData {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition_value: number;
  trend_percentage: number;
  intent_type: string;
  priority_score?: number;
  related_keywords?: string[];
  search_volume_trend?: SearchVolumeTrend[];
}

export interface SearchVolumeTrend {
  month: string;
  volume: number;
}

// Subtopic Suggestion Types
export interface SubtopicData {
  topic: string;
  trending_status: 'TRENDING' | 'STABLE' | 'DECLINING';
  growth_potential: number;
  search_volume: number;
  related_queries: string[];
  competition_level: 'LOW' | 'MEDIUM' | 'HIGH';
  commercial_intent: number;
}

// Seed Keyword Types
export interface SeedKeywordData {
  keyword: string;
  category: string;
  search_volume: number;
  difficulty: number;
  commercial_intent: number;
  related_topics: string[];
}

// API Credentials
export interface APICredentials {
  base_url: string;
  key_value: string;
  provider: string;
  is_active: boolean;
}

// Request/Response Types
export interface TrendAnalysisRequest {
  subtopics: string[];
  location: string;
  timeRange: string;
}

export interface TrendComparisonRequest {
  subtopics: string[];
  location: string;
  timeRange: string;
}

export interface SuggestionRequest {
  baseSubtopics: string[];
  maxSuggestions: number;
  location: string;
}

export interface KeywordResearchRequest {
  seedKeywords: string[];
  maxDifficulty: number;
  minVolume: number;
  intentTypes: string[];
  maxResults: number;
}

export interface KeywordPrioritizationRequest {
  keywords: KeywordData[];
  priorityFactors: {
    cpcWeight: number;
    volumeWeight: number;
    trendWeight: number;
  };
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Filter Types
export interface KeywordFilters {
  maxDifficulty?: number;
  minVolume?: number;
  maxVolume?: number;
  minCpc?: number;
  maxCpc?: number;
  intentTypes?: string[];
  minTrend?: number;
  maxTrend?: number;
  hasPriorityScore?: boolean;
  minPriorityScore?: number;
  keywordLength?: {
    min: number;
    max: number;
  };
  excludeKeywords?: string[];
  includeKeywords?: string[];
}

// Chart Types
export interface ChartDataPoint {
  date: string;
  [key: string]: any;
}

export interface ChartConfig {
  type: 'line' | 'area' | 'bar';
  height: number;
  showLegend: boolean;
  showTooltip: boolean;
  colors: string[];
}

// Component Props
export interface TrendChartProps {
  data: TrendData[];
  chartType?: 'line' | 'area';
  showLegend?: boolean;
  height?: number;
}

export interface SubtopicComparisonProps {
  data: TrendData[];
}

export interface KeywordTableProps {
  keywords: KeywordData[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (property: string) => void;
  showPriority?: boolean;
  maxRows?: number;
}

export interface KeywordFiltersProps {
  onFiltersChange: (filters: KeywordFilters) => void;
  initialFilters?: KeywordFilters;
}

// Hook Return Types
export interface UseTrendAnalysisReturn {
  trendData: TrendData[] | null;
  suggestions: SubtopicData[] | null;
  loading: boolean;
  error: string | null;
  fetchTrendData: (request: TrendAnalysisRequest) => Promise<void>;
  fetchSuggestions: (request: SuggestionRequest) => Promise<void>;
  compareTrends: (request: TrendComparisonRequest) => Promise<void>;
  clearError: () => void;
}

export interface UseKeywordResearchReturn {
  keywords: KeywordData[] | null;
  prioritizedKeywords: KeywordData[] | null;
  loading: boolean;
  error: string | null;
  fetchKeywords: (request: KeywordResearchRequest) => Promise<void>;
  prioritizeKeywords: (request: KeywordPrioritizationRequest) => Promise<void>;
  clearError: () => void;
}
