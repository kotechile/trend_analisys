/**
 * Enhanced API service for Ahrefs integration and separate idea generation
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface EnhancedApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

interface AhrefsAnalysisData {
  report_id: string;
  summary: {
    total_keywords: number;
    high_opportunity_count: number;
    medium_opportunity_count: number;
    low_opportunity_count: number;
    total_search_volume: number;
    average_difficulty: number;
    average_cpc: number;
  };
  top_opportunities: {
    high_opportunity_keywords: any[];
    quick_wins: any[];
    high_volume_targets: any[];
  };
  enhanced_ideas: {
    blog_ideas: BlogIdea[];
    software_ideas: SoftwareIdea[];
  };
}

interface BlogIdea {
  id: string;
  title: string;
  content_type: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  seo_optimization_score: number;
  traffic_potential_score: number;
  combined_score: number;
  total_search_volume: number;
  average_difficulty: number;
  average_cpc: number;
  optimization_tips: string[];
  content_outline: string;
  target_audience: string;
  content_length: string;
  enhanced_with_ahrefs: boolean;
  type: 'blog';
}

interface SoftwareIdea {
  id: string;
  title: string;
  description: string;
  features: string[];
  target_market: string;
  monetization_strategy: string;
  technical_requirements: string[];
  market_opportunity_score: number;
  development_difficulty: number;
  estimated_development_time: string;
  enhanced_with_ahrefs: boolean;
  type: 'software';
}

class EnhancedApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<EnhancedApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Ahrefs File Processing
  async processAhrefsFile(file: File, userId: string): Promise<EnhancedApiResponse<AhrefsAnalysisData>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    const response = await this.request<AhrefsAnalysisData>('/api/v1/ahrefs/process', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    return response;
  }

  async getAhrefsAnalysis(analysisId: string): Promise<EnhancedApiResponse<AhrefsAnalysisData>> {
    const response = await this.request<AhrefsAnalysisData>(`/api/v1/ahrefs/analysis/${analysisId}`);
    return response;
  }

  // Enhanced Idea Generation
  async generateBlogIdeasFromKeywords(
    keywordsData: any[],
    userId: string,
    analysisId: string
  ): Promise<EnhancedApiResponse<BlogIdea[]>> {
    const response = await this.request<BlogIdea[]>('/api/v1/ideas/generate/blog', {
      method: 'POST',
      body: JSON.stringify({
        keywords_data: keywordsData,
        user_id: userId,
        analysis_id: analysisId
      }),
    });
    return response;
  }

  async generateSoftwareIdeasSeparately(
    userId: string,
    seedKeywords?: string[],
    enhancedWithAhrefs?: boolean
  ): Promise<EnhancedApiResponse<SoftwareIdea[]>> {
    const response = await this.request<SoftwareIdea[]>('/api/v1/ideas/generate/software', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        seed_keywords: seedKeywords,
        enhanced_with_ahrefs: enhancedWithAhrefs
      }),
    });
    return response;
  }

  async generateBlogIdeasFromSeedKeywords(
    seedKeywords: string[],
    userId: string
  ): Promise<EnhancedApiResponse<BlogIdea[]>> {
    const response = await this.request<BlogIdea[]>('/api/v1/ideas/generate/blog/seed', {
      method: 'POST',
      body: JSON.stringify({
        seed_keywords: seedKeywords,
        user_id: userId
      }),
    });
    return response;
  }

  // Combined Ideas for Idea Burst
  async getCombinedIdeas(
    userId: string,
    analysisId?: string,
    includeSoftware: boolean = true
  ): Promise<EnhancedApiResponse<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>> {
    const params = new URLSearchParams({
      user_id: userId,
      include_software: includeSoftware.toString()
    });
    
    if (analysisId) {
      params.append('analysis_id', analysisId);
    }

    const response = await this.request<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>(
      `/api/v1/ideas/combined?${params}`
    );
    return response;
  }

  // Idea Management
  async getIdeasByType(
    userId: string,
    ideaType: 'blog' | 'software' | 'all',
    limit: number = 20,
    offset: number = 0
  ): Promise<EnhancedApiResponse<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>> {
    const params = new URLSearchParams({
      user_id: userId,
      idea_type: ideaType,
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await this.request<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>(
      `/api/v1/ideas?${params}`
    );
    return response;
  }

  async getIdeaById(ideaId: string, ideaType: 'blog' | 'software'): Promise<EnhancedApiResponse<BlogIdea | SoftwareIdea>> {
    const response = await this.request<BlogIdea | SoftwareIdea>(`/api/v1/ideas/${ideaId}?type=${ideaType}`);
    return response;
  }

  async updateIdea(
    ideaId: string,
    ideaType: 'blog' | 'software',
    updates: Partial<BlogIdea | SoftwareIdea>
  ): Promise<EnhancedApiResponse<boolean>> {
    const response = await this.request<boolean>(`/api/v1/ideas/${ideaId}`, {
      method: 'PUT',
      body: JSON.stringify({
        type: ideaType,
        updates
      }),
    });
    return response;
  }

  async deleteIdea(ideaId: string, ideaType: 'blog' | 'software'): Promise<EnhancedApiResponse<boolean>> {
    const response = await this.request<boolean>(`/api/v1/ideas/${ideaId}?type=${ideaType}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Search and Filter
  async searchIdeas(
    userId: string,
    query: string,
    ideaType: 'blog' | 'software' | 'all' = 'all'
  ): Promise<EnhancedApiResponse<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>> {
    const params = new URLSearchParams({
      user_id: userId,
      query,
      idea_type: ideaType
    });

    const response = await this.request<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>(
      `/api/v1/ideas/search?${params}`
    );
    return response;
  }

  async filterIdeas(
    userId: string,
    filters: {
      ideaType?: 'blog' | 'software' | 'all';
      enhancedWithAhrefs?: boolean;
      minScore?: number;
      maxDifficulty?: number;
      minSearchVolume?: number;
    },
    limit: number = 20,
    offset: number = 0
  ): Promise<EnhancedApiResponse<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      offset: offset.toString()
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await this.request<{ blog_ideas: BlogIdea[]; software_ideas: SoftwareIdea[] }>(
      `/api/v1/ideas/filter?${params}`
    );
    return response;
  }

  // Export and Analytics
  async exportIdeas(
    ideas: (BlogIdea | SoftwareIdea)[],
    format: 'json' | 'csv' | 'xlsx' = 'csv'
  ): Promise<void> {
    const response = await this.request('/api/v1/ideas/export', {
      method: 'POST',
      body: JSON.stringify({
        ideas,
        format
      }),
    });

    if (response.data.download_url) {
      // Create download link
      const link = document.createElement('a');
      link.href = response.data.download_url;
      link.download = `ideas_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async getIdeaAnalytics(userId: string): Promise<EnhancedApiResponse<{
    total_blog_ideas: number;
    total_software_ideas: number;
    total_ideas: number;
    enhanced_with_ahrefs: number;
    average_scores: {
      blog_seo_score: number;
      blog_traffic_score: number;
      software_opportunity_score: number;
    };
  }>> {
    const response = await this.request(`/api/v1/ideas/analytics?user_id=${userId}`);
    return response;
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const enhancedApi = new EnhancedApiService();

// Export types
export type {
  EnhancedApiResponse,
  AhrefsAnalysisData,
  BlogIdea,
  SoftwareIdea,
};




