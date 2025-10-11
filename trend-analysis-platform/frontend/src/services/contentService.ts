/**
 * Content Generation Service
 */

import { apiClient } from './apiClient';
import {
  ContentGenerationRequest,
  ContentGenerationResponse,
  ContentIdeasResponse,
  ContentIdeasListResponse,
  ContentUpdateRequest,
  ContentOutlineResponse,
  ContentIdeasQuery,
  ApiResult
} from '../types/api';

export class ContentService {
  private baseUrl = '/api/content';

  // Generate content
  async generateContent(request: ContentGenerationRequest): Promise<ApiResult<ContentGenerationResponse>> {
    return apiClient.post(`${this.baseUrl}/generate`, request);
  }

  // Get content ideas by ID
  async getContentIdeas(contentId: string): Promise<ApiResult<ContentIdeasResponse>> {
    return apiClient.get(`${this.baseUrl}/ideas/${contentId}`);
  }

  // List user's content ideas
  async listContentIdeas(query?: ContentIdeasQuery): Promise<ApiResult<ContentIdeasListResponse>> {
    const params = new URLSearchParams();
    if (query?.skip) params.append('skip', query.skip.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    const url = `${this.baseUrl}/ideas${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }

  // Update content ideas
  async updateContentIdeas(contentId: string, update: ContentUpdateRequest): Promise<ApiResult<ContentIdeasResponse>> {
    return apiClient.put(`${this.baseUrl}/ideas/${contentId}`, update);
  }

  // Delete content ideas
  async deleteContentIdeas(contentId: string): Promise<ApiResult<{ message: string }>> {
    return apiClient.delete(`${this.baseUrl}/ideas/${contentId}`);
  }

  // Get content outline
  async getContentOutline(contentId: string, angleId: string): Promise<ApiResult<ContentOutlineResponse>> {
    return apiClient.get(`${this.baseUrl}/ideas/${contentId}/outline/${angleId}`);
  }

  // Regenerate content
  async regenerateContent(contentId: string, angleIds: string[]): Promise<ApiResult<{ message: string; content_id: string; angle_ids: string[] }>> {
    return apiClient.post(`${this.baseUrl}/ideas/${contentId}/regenerate`, angleIds);
  }

  // Get SEO analysis
  async getSEOAnalysis(contentId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/ideas/${contentId}/seo-analysis`);
  }

  // Get competitor analysis
  async getCompetitorAnalysis(contentId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/ideas/${contentId}/competitor-analysis`);
  }

  // Get headline suggestions
  async getHeadlineSuggestions(contentId: string, angleId: string): Promise<ApiResult<any[]>> {
    return apiClient.get(`${this.baseUrl}/ideas/${contentId}/headline-suggestions?angle_id=${angleId}`);
  }

  // Get content analytics
  async getAnalytics(contentId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/ideas/${contentId}/analytics`);
  }

  // Get content templates
  async getTemplates(): Promise<ApiResult<any[]>> {
    return apiClient.get(`${this.baseUrl}/templates`);
  }
}

export const contentService = new ContentService();
