/**
 * Research Topics API service
 * Handles all API calls for research topics dataflow persistence
 */

import { apiClient } from './apiClient';
import {
  ResearchTopic,
  ResearchTopicCreate,
  ResearchTopicUpdate,
  ResearchTopicListResponse,
  ResearchTopicComplete,
  ResearchTopicStats,
  ResearchTopicListParams,
  ResearchTopicSearchParams,
  TopicDecomposition,
  TopicDecompositionCreate,
  TopicDecompositionUpdate,
  TopicDecompositionListResponse,
  TopicDecompositionStats,
  TopicDecompositionListParams,
  TrendAnalysis,
  TrendAnalysisCreate,
  TrendAnalysisUpdate,
  TrendAnalysisListResponse,
  TrendAnalysisStats,
  TrendAnalysisListParams,
  ContentIdea,
  ContentIdeaCreate,
  ContentIdeaUpdate,
  ContentIdeaListResponse,
  ContentIdeaStats,
  ContentIdeaListParams,
  ContentIdeaSearch,
  SubtopicAnalysis
} from '../types/researchTopics';

class ResearchTopicsService {
  private baseUrl = '/api/research-topics';

  // Research Topics CRUD operations
  async createResearchTopic(data: ResearchTopicCreate): Promise<ResearchTopic> {
    const response = await apiClient.post(`${this.baseUrl}/`, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create research topic');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getResearchTopic(id: string): Promise<ResearchTopic> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get research topic');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async updateResearchTopic(id: string, data: ResearchTopicUpdate): Promise<ResearchTopic> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update research topic');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async deleteResearchTopic(id: string): Promise<void> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete research topic');
    }
  }

  async listResearchTopics(params?: ResearchTopicListParams): Promise<ResearchTopicListResponse> {
    const response = await apiClient.get(`${this.baseUrl}/`, { params });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to list research topics');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async searchResearchTopics(params: ResearchTopicSearchParams): Promise<ResearchTopicListResponse> {
    const response = await apiClient.get(`${this.baseUrl}/search`, { params });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search research topics');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getResearchTopicStats(id: string): Promise<ResearchTopicStats> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/stats`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get research topic stats');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getOverviewStats(): Promise<ResearchTopicStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats/overview`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get overview stats');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getCompleteDataflow(id: string): Promise<ResearchTopicComplete> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/complete`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get complete dataflow');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async archiveResearchTopic(id: string): Promise<ResearchTopic> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/archive`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to archive research topic');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async restoreResearchTopic(id: string): Promise<ResearchTopic> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/restore`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to restore research topic');
    }
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  // Topic Decomposition operations
  async createSubtopics(topicId: string, data: TopicDecompositionCreate): Promise<TopicDecomposition> {
    const response = await apiClient.post(`${this.baseUrl}/${topicId}/subtopics`, data);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getSubtopics(topicId: string): Promise<TopicDecomposition> {
    const response = await apiClient.get(`${this.baseUrl}/${topicId}/subtopics`);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async updateTopicDecomposition(id: string, data: TopicDecompositionUpdate): Promise<TopicDecomposition> {
    const response = await apiClient.put(`/api/topic-decompositions/${id}`, data);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async deleteTopicDecomposition(id: string): Promise<void> {
    await apiClient.delete(`/api/topic-decompositions/${id}`);
  }

  async listTopicDecompositions(params?: TopicDecompositionListParams): Promise<TopicDecompositionListResponse> {
    const response = await apiClient.get('/api/topic-decompositions/', { params });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getTopicDecompositionStats(): Promise<TopicDecompositionStats> {
    const response = await apiClient.get('/api/topic-decompositions/stats');
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async analyzeSubtopics(): Promise<SubtopicAnalysis[]> {
    const response = await apiClient.get('/api/topic-decompositions/analyze');
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async searchSubtopics(query: string, page = 1, size = 10): Promise<any[]> {
    const response = await apiClient.get('/api/topic-decompositions/search', {
      params: { query, page, size }
    });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  // Trend Analysis operations
  async createTrendAnalysis(data: TrendAnalysisCreate): Promise<TrendAnalysis> {
    const response = await apiClient.post('/api/trend-analyses/', data);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getTrendAnalysis(id: string): Promise<TrendAnalysis> {
    const response = await apiClient.get(`/api/trend-analyses/${id}`);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async updateTrendAnalysis(id: string, data: TrendAnalysisUpdate): Promise<TrendAnalysis> {
    const response = await apiClient.put(`/api/trend-analyses/${id}`, data);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async deleteTrendAnalysis(id: string): Promise<void> {
    await apiClient.delete(`/api/trend-analyses/${id}`);
  }

  async listTrendAnalyses(params?: TrendAnalysisListParams): Promise<TrendAnalysisListResponse> {
    const response = await apiClient.get('/api/trend-analyses/', { params });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getTrendAnalysisStats(): Promise<TrendAnalysisStats> {
    const response = await apiClient.get('/api/trend-analyses/stats');
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async searchTrendAnalyses(query: string, page = 1, size = 10): Promise<TrendAnalysisListResponse> {
    const response = await apiClient.get('/api/trend-analyses/search', {
      params: { query, page, size }
    });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getTrendAnalysesBySubtopic(subtopicName: string): Promise<TrendAnalysis[]> {
    const response = await apiClient.get('/api/trend-analyses/subtopic', {
      params: { subtopic_name: subtopicName }
    });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getTrendAnalysesByResearchTopic(topicId: string): Promise<TrendAnalysis[]> {
    const response = await apiClient.get('/api/trend-analyses/research-topic', {
      params: { research_topic_id: topicId }
    });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  // Content Ideas operations
  async createContentIdea(data: ContentIdeaCreate): Promise<ContentIdea> {
    const response = await apiClient.post('/api/content-ideas/', data);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getContentIdea(id: string): Promise<ContentIdea> {
    const response = await apiClient.get(`/api/content-ideas/${id}`);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async updateContentIdea(id: string, data: ContentIdeaUpdate): Promise<ContentIdea> {
    const response = await apiClient.put(`/api/content-ideas/${id}`, data);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async deleteContentIdea(id: string): Promise<void> {
    await apiClient.delete(`/api/content-ideas/${id}`);
  }

  async listContentIdeas(params?: ContentIdeaListParams): Promise<ContentIdeaListResponse> {
    const response = await apiClient.get('/api/content-ideas/', { params });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async searchContentIdeas(searchData: ContentIdeaSearch): Promise<ContentIdeaListResponse> {
    const response = await apiClient.post('/api/content-ideas/search', searchData);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getContentIdeaStats(): Promise<ContentIdeaStats> {
    const response = await apiClient.get('/api/content-ideas/stats');
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getContentIdeasByResearchTopic(topicId: string): Promise<ContentIdea[]> {
    const response = await apiClient.get('/api/content-ideas/research-topic', {
      params: { research_topic_id: topicId }
    });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async getContentIdeasByTrendAnalysis(analysisId: string): Promise<ContentIdea[]> {
    const response = await apiClient.get('/api/content-ideas/trend-analysis', {
      params: { trend_analysis_id: analysisId }
    });
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  async bulkCreateContentIdeas(ideasData: ContentIdeaCreate[]): Promise<ContentIdea[]> {
    const response = await apiClient.post('/api/content-ideas/bulk', ideasData);
    if (!response.success) {
      throw new Error('API request failed');
    }
    return response.data;
  }

  // Utility methods
  async getDataflowProgress(topicId: string): Promise<{
    hasSubtopics: boolean;
    hasTrendAnalyses: boolean;
    hasContentIdeas: boolean;
    progressPercentage: number;
  }> {
    try {
      const dataflow = await this.getCompleteDataflow(topicId);
      
      const hasSubtopics = dataflow.subtopics.length > 0;
      const hasTrendAnalyses = dataflow.trend_analyses.length > 0;
      const hasContentIdeas = dataflow.content_ideas.length > 0;
      
      let progressPercentage = 0;
      if (hasSubtopics) progressPercentage += 33;
      if (hasTrendAnalyses) progressPercentage += 33;
      if (hasContentIdeas) progressPercentage += 34;
      
      return {
        hasSubtopics,
        hasTrendAnalyses,
        hasContentIdeas,
        progressPercentage
      };
    } catch (error) {
      console.error('Error getting dataflow progress:', error);
      return {
        hasSubtopics: false,
        hasTrendAnalyses: false,
        hasContentIdeas: false,
        progressPercentage: 0
      };
    }
  }

  async validateDataflowIntegrity(topicId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const dataflow = await this.getCompleteDataflow(topicId);
      const issues: string[] = [];
      
      // Check if research topic exists
      if (!dataflow.id) {
        issues.push('Research topic not found');
      }
      
      // Check if subtopics exist
      if (dataflow.subtopics.length === 0) {
        issues.push('No subtopics found');
      }
      
      // Check if trend analyses are linked to valid subtopics
      const subtopicNames = dataflow.subtopics.map(sub => sub.name);
      const invalidAnalyses = dataflow.trend_analyses.filter(
        analysis => !subtopicNames.includes(analysis.subtopic_name)
      );
      
      if (invalidAnalyses.length > 0) {
        issues.push(`${invalidAnalyses.length} trend analyses linked to invalid subtopics`);
      }
      
      // Check if content ideas are linked to valid trend analyses
      const analysisIds = dataflow.trend_analyses.map(analysis => analysis.id);
      const invalidIdeas = dataflow.content_ideas.filter(
        idea => !analysisIds.includes(idea.trend_analysis_id)
      );
      
      if (invalidIdeas.length > 0) {
        issues.push(`${invalidIdeas.length} content ideas linked to invalid trend analyses`);
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error validating dataflow integrity:', error);
      return {
        isValid: false,
        issues: ['Failed to validate dataflow integrity']
      };
    }
  }
}

// Export singleton instance
export const researchTopicsService = new ResearchTopicsService();
export default researchTopicsService;
