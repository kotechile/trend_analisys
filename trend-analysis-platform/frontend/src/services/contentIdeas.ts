/**
 * Content Ideas Service
 * 
 * Service for managing content ideas and SEO content generation.
 * Handles idea creation, filtering, sorting, and optimization.
 */

import apiService from './api';

// Content idea types
export interface ContentIdea {
  id: string;
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
  created_at: string;
  updated_at?: string;
  bookmarked?: boolean;
  favorited?: boolean;
  tags?: string[];
  status?: 'draft' | 'in_progress' | 'completed' | 'archived';
}

// Content idea filters
export interface ContentIdeaFilters {
  search?: string;
  content_type?: string;
  min_score?: number;
  max_score?: number;
  min_volume?: number;
  max_volume?: number;
  min_difficulty?: number;
  max_difficulty?: number;
  tags?: string[];
  status?: string[];
  bookmarked?: boolean;
  favorited?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

// Content idea sorting
export interface ContentIdeaSorting {
  field: 'title' | 'created_at' | 'seo_optimization_score' | 'traffic_potential_score' | 'total_search_volume' | 'average_difficulty';
  direction: 'asc' | 'desc';
}

// Content idea generation options
export interface ContentIdeaGenerationOptions {
  seed_keywords: string[];
  content_types: string[];
  max_ideas: number;
  include_optimization_tips: boolean;
  include_content_outlines: boolean;
  include_keyword_data: boolean;
  language: string;
  country: string;
  min_volume_threshold: number;
  max_difficulty_threshold: number;
}

// Content idea generation response
export interface ContentIdeaGenerationResponse {
  session_id: string;
  ideas: ContentIdea[];
  total_generated: number;
  processing_time: number;
  created_at: string;
}

// Content idea export options
export interface ContentIdeaExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  include_optimization_tips: boolean;
  include_content_outlines: boolean;
  include_keyword_data: boolean;
  include_metadata: boolean;
  filters?: ContentIdeaFilters;
}

// Content idea import options
export interface ContentIdeaImportOptions {
  source: 'ahrefs' | 'semrush' | 'google' | 'manual' | 'csv' | 'json';
  format: 'tsv' | 'csv' | 'xlsx' | 'json';
  mapping: Record<string, string>;
  validation_rules: {
    required_fields: string[];
    min_ideas: number;
    max_ideas: number;
    valid_content_types: string[];
  };
}

// Content idea statistics
export interface ContentIdeaStatistics {
  total_ideas: number;
  by_content_type: Record<string, number>;
  by_status: Record<string, number>;
  average_scores: {
    seo_optimization: number;
    traffic_potential: number;
  };
  top_performing_ideas: ContentIdea[];
  trending_ideas: ContentIdea[];
  underperforming_ideas: ContentIdea[];
  keyword_distribution: Record<string, number>;
  volume_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

// Content idea batch operations
export interface ContentIdeaBatchOperation {
  operation: 'update' | 'delete' | 'tag' | 'export' | 'archive' | 'favorite' | 'bookmark';
  idea_ids: string[];
  data?: Partial<ContentIdea>;
  tags?: string[];
  options?: Record<string, any>;
}

// Content idea batch operation result
export interface ContentIdeaBatchOperationResult {
  operation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  total_ideas: number;
  successful_ideas: number;
  failed_ideas: number;
  errors: string[];
  created_at: string;
  completed_at?: string;
}

// Content idea validation
export interface ContentIdeaValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  quality_score: number;
  improvement_areas: string[];
}

// Content idea service class
class ContentIdeasService {
  private ideas: Map<string, ContentIdea> = new Map();
  private bookmarkedIdeas: Set<string> = new Set();
  private favoritedIdeas: Set<string> = new Set();

  /**
   * Get all content ideas
   */
  async getContentIdeas(
    filters?: ContentIdeaFilters,
    sorting?: ContentIdeaSorting
  ): Promise<ContentIdea[]> {
    try {
      // In a real implementation, this would call the API
      const ideas = Array.from(this.ideas.values());
      
      // Apply filters
      let filteredIdeas = ideas;
      if (filters) {
        filteredIdeas = this.applyFilters(ideas, filters);
      }
      
      // Apply sorting
      if (sorting) {
        filteredIdeas = this.applySorting(filteredIdeas, sorting);
      }
      
      return filteredIdeas;
    } catch (error) {
      throw new Error(`Failed to get content ideas: ${error}`);
    }
  }

  /**
   * Get a single content idea
   */
  async getContentIdea(id: string): Promise<ContentIdea | null> {
    try {
      return this.ideas.get(id) || null;
    } catch (error) {
      throw new Error(`Failed to get content idea: ${error}`);
    }
  }

  /**
   * Create a new content idea
   */
  async createContentIdea(idea: Omit<ContentIdea, 'id' | 'created_at'>): Promise<ContentIdea> {
    try {
      const newIdea: ContentIdea = {
        ...idea,
        id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };
      
      this.ideas.set(newIdea.id, newIdea);
      return newIdea;
    } catch (error) {
      throw new Error(`Failed to create content idea: ${error}`);
    }
  }

  /**
   * Update a content idea
   */
  async updateContentIdea(id: string, updates: Partial<ContentIdea>): Promise<ContentIdea> {
    try {
      const existingIdea = this.ideas.get(id);
      if (!existingIdea) {
        throw new Error('Content idea not found');
      }
      
      const updatedIdea: ContentIdea = {
        ...existingIdea,
        ...updates,
        id,
        updated_at: new Date().toISOString(),
      };
      
      this.ideas.set(id, updatedIdea);
      return updatedIdea;
    } catch (error) {
      throw new Error(`Failed to update content idea: ${error}`);
    }
  }

  /**
   * Delete a content idea
   */
  async deleteContentIdea(id: string): Promise<void> {
    try {
      this.ideas.delete(id);
      this.bookmarkedIdeas.delete(id);
      this.favoritedIdeas.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete content idea: ${error}`);
    }
  }

  /**
   * Generate new content ideas
   */
  async generateContentIdeas(
    options: ContentIdeaGenerationOptions
  ): Promise<ContentIdeaGenerationResponse> {
    try {
      const startTime = Date.now();
      
      // Mock idea generation - in real implementation, this would call the API
      const ideas: ContentIdea[] = [];
      for (let i = 0; i < options.max_ideas; i++) {
        const idea: ContentIdea = {
          id: `idea_${Date.now()}_${i}`,
          title: `Generated Idea ${i + 1}`,
          content_type: options.content_types[i % options.content_types.length],
          primary_keywords: options.seed_keywords.slice(0, 2),
          secondary_keywords: options.seed_keywords.slice(2, 5),
          seo_optimization_score: Math.random() * 100,
          traffic_potential_score: Math.random() * 100,
          total_search_volume: Math.floor(Math.random() * 10000),
          average_difficulty: Math.random() * 100,
          average_cpc: Math.random() * 5,
          optimization_tips: options.include_optimization_tips ? ['Generated tip'] : [],
          content_outline: options.include_content_outlines ? ['Generated outline'] : [],
          created_at: new Date().toISOString(),
        };
        
        ideas.push(idea);
        this.ideas.set(idea.id, idea);
      }
      
      const processingTime = Date.now() - startTime;
      
      return {
        session_id: `session_${Date.now()}`,
        ideas,
        total_generated: ideas.length,
        processing_time: processingTime,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to generate content ideas: ${error}`);
    }
  }

  /**
   * Bookmark a content idea
   */
  async bookmarkContentIdea(id: string): Promise<void> {
    try {
      if (this.bookmarkedIdeas.has(id)) {
        this.bookmarkedIdeas.delete(id);
      } else {
        this.bookmarkedIdeas.add(id);
      }
      
      // Update the idea's bookmarked status
      const idea = this.ideas.get(id);
      if (idea) {
        idea.bookmarked = this.bookmarkedIdeas.has(id);
        this.ideas.set(id, idea);
      }
    } catch (error) {
      throw new Error(`Failed to bookmark content idea: ${error}`);
    }
  }

  /**
   * Favorite a content idea
   */
  async favoriteContentIdea(id: string): Promise<void> {
    try {
      if (this.favoritedIdeas.has(id)) {
        this.favoritedIdeas.delete(id);
      } else {
        this.favoritedIdeas.add(id);
      }
      
      // Update the idea's favorited status
      const idea = this.ideas.get(id);
      if (idea) {
        idea.favorited = this.favoritedIdeas.has(id);
        this.ideas.set(id, idea);
      }
    } catch (error) {
      throw new Error(`Failed to favorite content idea: ${error}`);
    }
  }

  /**
   * Export content ideas
   */
  async exportContentIdeas(
    options: ContentIdeaExportOptions
  ): Promise<Blob> {
    try {
      const ideas = Array.from(this.ideas.values());
      
      if (options.format === 'json') {
        const jsonString = JSON.stringify(ideas, null, 2);
        return new Blob([jsonString], { type: 'application/json' });
      }
      
      // For other formats, implement conversion logic
      throw new Error(`Export format ${options.format} not implemented yet`);
    } catch (error) {
      throw new Error(`Failed to export content ideas: ${error}`);
    }
  }

  /**
   * Import content ideas
   */
  async importContentIdeas(
    file: File,
    options: ContentIdeaImportOptions
  ): Promise<ContentIdea[]> {
    try {
      // Mock import - in real implementation, this would parse the file
      const ideas: ContentIdea[] = [];
      
      // Simulate file parsing
      for (let i = 0; i < 5; i++) {
        const idea: ContentIdea = {
          id: `imported_idea_${Date.now()}_${i}`,
          title: `Imported Idea ${i + 1}`,
          content_type: 'article',
          primary_keywords: ['imported keyword'],
          secondary_keywords: ['secondary keyword'],
          seo_optimization_score: Math.random() * 100,
          traffic_potential_score: Math.random() * 100,
          total_search_volume: Math.floor(Math.random() * 10000),
          average_difficulty: Math.random() * 100,
          average_cpc: Math.random() * 5,
          optimization_tips: ['Imported tip'],
          content_outline: ['Imported outline'],
          created_at: new Date().toISOString(),
        };
        
        ideas.push(idea);
        this.ideas.set(idea.id, idea);
      }
      
      return ideas;
    } catch (error) {
      throw new Error(`Failed to import content ideas: ${error}`);
    }
  }

  /**
   * Get content idea statistics
   */
  async getContentIdeaStatistics(): Promise<ContentIdeaStatistics> {
    try {
      const ideas = Array.from(this.ideas.values());
      
      const byContentType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      
      ideas.forEach(idea => {
        byContentType[idea.content_type] = (byContentType[idea.content_type] || 0) + 1;
        byStatus[idea.status || 'draft'] = (byStatus[idea.status || 'draft'] || 0) + 1;
      });
      
      const averageScores = {
        seo_optimization: ideas.reduce((sum, idea) => sum + idea.seo_optimization_score, 0) / ideas.length,
        traffic_potential: ideas.reduce((sum, idea) => sum + idea.traffic_potential_score, 0) / ideas.length,
      };
      
      return {
        total_ideas: ideas.length,
        by_content_type: byContentType,
        by_status: byStatus,
        average_scores: averageScores,
        top_performing_ideas: ideas
          .sort((a, b) => (b.seo_optimization_score + b.traffic_potential_score) - (a.seo_optimization_score + a.traffic_potential_score))
          .slice(0, 5),
        trending_ideas: ideas.slice(0, 5),
        underperforming_ideas: ideas
          .sort((a, b) => (a.seo_optimization_score + a.traffic_potential_score) - (b.seo_optimization_score + b.traffic_potential_score))
          .slice(0, 5),
        keyword_distribution: {},
        volume_distribution: {
          low: ideas.filter(idea => idea.total_search_volume < 1000).length,
          medium: ideas.filter(idea => idea.total_search_volume >= 1000 && idea.total_search_volume < 10000).length,
          high: ideas.filter(idea => idea.total_search_volume >= 10000).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get content idea statistics: ${error}`);
    }
  }

  /**
   * Validate content idea
   */
  async validateContentIdea(idea: Partial<ContentIdea>): Promise<ContentIdeaValidation> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];
      
      if (!idea.title || idea.title.trim().length === 0) {
        errors.push('Title is required');
      }
      
      if (!idea.primary_keywords || idea.primary_keywords.length === 0) {
        errors.push('At least one primary keyword is required');
      }
      
      if (idea.seo_optimization_score && (idea.seo_optimization_score < 0 || idea.seo_optimization_score > 100)) {
        errors.push('SEO optimization score must be between 0 and 100');
      }
      
      if (idea.traffic_potential_score && (idea.traffic_potential_score < 0 || idea.traffic_potential_score > 100)) {
        errors.push('Traffic potential score must be between 0 and 100');
      }
      
      if (idea.total_search_volume && idea.total_search_volume < 0) {
        errors.push('Total search volume must be non-negative');
      }
      
      if (idea.average_difficulty && (idea.average_difficulty < 0 || idea.average_difficulty > 100)) {
        errors.push('Average difficulty must be between 0 and 100');
      }
      
      if (idea.average_cpc && idea.average_cpc < 0) {
        errors.push('Average CPC must be non-negative');
      }
      
      // Quality score calculation
      let qualityScore = 0;
      if (idea.title && idea.title.length > 10) qualityScore += 20;
      if (idea.primary_keywords && idea.primary_keywords.length > 0) qualityScore += 20;
      if (idea.seo_optimization_score && idea.seo_optimization_score > 70) qualityScore += 20;
      if (idea.traffic_potential_score && idea.traffic_potential_score > 70) qualityScore += 20;
      if (idea.optimization_tips && idea.optimization_tips.length > 0) qualityScore += 20;
      
      return {
        is_valid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        quality_score: qualityScore,
        improvement_areas: qualityScore < 80 ? ['Improve SEO score', 'Add optimization tips'] : [],
      };
    } catch (error) {
      throw new Error(`Failed to validate content idea: ${error}`);
    }
  }

  /**
   * Apply filters to ideas
   */
  private applyFilters(ideas: ContentIdea[], filters: ContentIdeaFilters): ContentIdea[] {
    return ideas.filter(idea => {
      if (filters.search && !idea.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !idea.primary_keywords.some(k => k.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      if (filters.content_type && idea.content_type !== filters.content_type) {
        return false;
      }
      
      if (filters.min_score && (idea.seo_optimization_score + idea.traffic_potential_score) / 2 < filters.min_score) {
        return false;
      }
      
      if (filters.max_score && (idea.seo_optimization_score + idea.traffic_potential_score) / 2 > filters.max_score) {
        return false;
      }
      
      if (filters.min_volume && idea.total_search_volume < filters.min_volume) {
        return false;
      }
      
      if (filters.max_volume && idea.total_search_volume > filters.max_volume) {
        return false;
      }
      
      if (filters.min_difficulty && idea.average_difficulty < filters.min_difficulty) {
        return false;
      }
      
      if (filters.max_difficulty && idea.average_difficulty > filters.max_difficulty) {
        return false;
      }
      
      if (filters.bookmarked && !idea.bookmarked) {
        return false;
      }
      
      if (filters.favorited && !idea.favorited) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Apply sorting to ideas
   */
  private applySorting(ideas: ContentIdea[], sorting: ContentIdeaSorting): ContentIdea[] {
    return ideas.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;
      
      switch (sorting.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'seo_optimization_score':
          aValue = a.seo_optimization_score;
          bValue = b.seo_optimization_score;
          break;
        case 'traffic_potential_score':
          aValue = a.traffic_potential_score;
          bValue = b.traffic_potential_score;
          break;
        case 'total_search_volume':
          aValue = a.total_search_volume;
          bValue = b.total_search_volume;
          break;
        case 'average_difficulty':
          aValue = a.average_difficulty;
          bValue = b.average_difficulty;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Get bookmarked ideas
   */
  getBookmarkedIdeas(): string[] {
    return Array.from(this.bookmarkedIdeas);
  }

  /**
   * Get favorited ideas
   */
  getFavoritedIdeas(): string[] {
    return Array.from(this.favoritedIdeas);
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.ideas.clear();
    this.bookmarkedIdeas.clear();
    this.favoritedIdeas.clear();
  }
}

// Create and export singleton instance
const contentIdeasService = new ContentIdeasService();
export default contentIdeasService;

// Export types
export type {
  ContentIdea,
  ContentIdeaFilters,
  ContentIdeaSorting,
  ContentIdeaGenerationOptions,
  ContentIdeaGenerationResponse,
  ContentIdeaExportOptions,
  ContentIdeaImportOptions,
  ContentIdeaStatistics,
  ContentIdeaBatchOperation,
  ContentIdeaBatchOperationResult,
  ContentIdeaValidation,
};
