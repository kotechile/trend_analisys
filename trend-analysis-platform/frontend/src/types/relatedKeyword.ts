/**
 * TypeScript interface for DataForSEO related keywords with comprehensive fields
 * Based on DataForSEO API documentation for related keywords endpoint
 */

export interface RelatedKeyword {
  // Basic identification
  seed_keyword: string;
  keyword: string;
  related_keyword: string;
  
  // Core keyword_info fields
  search_volume: number;
  cpc: number;
  competition: number;
  competition_level: string;
  low_top_of_page_bid: number;
  high_top_of_page_bid: number;
  categories: string[];
  monthly_searches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
  last_updated_time: string;
  
  // keyword_properties fields
  core_keyword: string;
  synonym_clustering_algorithm: string;
  difficulty: number;
  detected_language: string;
  is_another_language: boolean;
  
  // search_intent_info fields
  main_intent: string;
  foreign_intent: string[];
  search_intent_last_updated_time: string;
  
  // search_volume_trend
  monthly_trend: number;
  quarterly_trend: number;
  yearly_trend: number;
  
  // clickstream_keyword_info
  clickstream_search_volume: number;
  clickstream_last_updated_time: string;
  clickstream_gender_distribution: {
    male: number;
    female: number;
  };
  clickstream_age_distribution: Record<string, number>;
  clickstream_monthly_searches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
  
  // serp_info
  serp_se_type: string;
  serp_check_url: string;
  serp_item_types: string[];
  se_results_count: number;
  serp_last_updated_time: string;
  serp_previous_updated_time: string;
  
  // avg_backlinks_info
  avg_backlinks: number;
  avg_dofollow: number;
  avg_referring_pages: number;
  avg_referring_domains: number;
  avg_referring_main_domains: number;
  avg_rank: number;
  avg_main_domain_rank: number;
  backlinks_last_updated_time: string;
  
  // keyword_info_normalized_with_bing
  normalized_bing_search_volume: number;
  normalized_bing_is_normalized: boolean;
  normalized_bing_last_updated_time: string;
  normalized_bing_monthly_searches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
  
  // keyword_info_normalized_with_clickstream
  normalized_clickstream_search_volume: number;
  normalized_clickstream_is_normalized: boolean;
  normalized_clickstream_last_updated_time: string;
  normalized_clickstream_monthly_searches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
  
  // Additional fields
  depth: number;
  created_at: string;
}

/**
 * Simplified interface for display purposes
 * Contains only the most important fields for the main table view
 */
export interface RelatedKeywordDisplay {
  // Primary display fields (always visible)
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition_level: string;
  main_intent: string;
  related_keywords: string[];
  
  // Full data for expandable sections
  fullData: RelatedKeyword;
}

/**
 * Interface for expandable section data
 */
export interface KeywordExpandableData {
  // Search Metrics section
  monthly_searches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
  monthly_trend: number;
  quarterly_trend: number;
  yearly_trend: number;
  low_top_of_page_bid: number;
  high_top_of_page_bid: number;
  categories: string[];
  detected_language: string;
  
  // SERP Analysis section
  serp_check_url: string;
  serp_item_types: string[];
  se_results_count: number;
  serp_last_updated_time: string;
  
  // Backlink Data section
  avg_backlinks: number;
  avg_dofollow: number;
  avg_referring_domains: number;
  avg_referring_pages: number;
  avg_referring_main_domains: number;
  avg_rank: number;
  avg_main_domain_rank: number;
  backlinks_last_updated_time: string;
  
  // Clickstream Data section
  clickstream_search_volume: number;
  clickstream_gender_distribution: {
    male: number;
    female: number;
  };
  clickstream_age_distribution: Record<string, number>;
  clickstream_monthly_searches: Array<{
    year: number;
    month: number;
    search_volume: number;
  }>;
  
  // Advanced section
  core_keyword: string;
  synonym_clustering_algorithm: string;
  foreign_intent: string[];
  is_another_language: boolean;
  normalized_bing_search_volume: number;
  normalized_clickstream_search_volume: number;
}
