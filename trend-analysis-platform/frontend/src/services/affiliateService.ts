/**
 * Affiliate Research Service
 */

import { apiClient } from './apiClient';
import {
  AffiliateResearchRequest,
  AffiliateResearchResponse,
  AffiliateResearchListResponse,
  AffiliateResearchUpdate,
  AffiliateProgramResponse,
  AffiliateResearchQuery,
  ApiResult
} from '../types/api';

export class AffiliateService {
  private baseUrl = '/api/affiliate';

  // Start affiliate research
  async startResearch(request: AffiliateResearchRequest): Promise<ApiResult<AffiliateResearchResponse>> {
    return apiClient.post(`${this.baseUrl}/research`, request);
  }

  // Get research by ID
  async getResearch(researchId: string): Promise<ApiResult<AffiliateResearchResponse>> {
    return apiClient.get(`${this.baseUrl}/research/${researchId}`);
  }

  // List user's researches
  async listResearches(query?: AffiliateResearchQuery): Promise<ApiResult<AffiliateResearchListResponse>> {
    const params = new URLSearchParams();
    if (query?.skip) params.append('skip', query.skip.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    const url = `${this.baseUrl}/research${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }

  // Update research
  async updateResearch(researchId: string, update: AffiliateResearchUpdate): Promise<ApiResult<AffiliateResearchResponse>> {
    return apiClient.put(`${this.baseUrl}/research/${researchId}`, update);
  }

  // Delete research
  async deleteResearch(researchId: string): Promise<ApiResult<{ message: string }>> {
    return apiClient.delete(`${this.baseUrl}/research/${researchId}`);
  }

  // Get affiliate programs
  async getPrograms(researchId: string): Promise<ApiResult<AffiliateProgramResponse[]>> {
    return apiClient.get(`${this.baseUrl}/research/${researchId}/programs`);
  }

  // Select programs
  async selectPrograms(researchId: string, programIds: string[]): Promise<ApiResult<{ message: string; selected_count: number }>> {
    return apiClient.post(`${this.baseUrl}/research/${researchId}/select-programs`, programIds);
  }

  // Get available networks
  async getNetworks(): Promise<ApiResult<any[]>> {
    return apiClient.get(`${this.baseUrl}/networks`);
  }

  // Get research analytics
  async getAnalytics(researchId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/research/${researchId}/analytics`);
  }
}

export const affiliateService = new AffiliateService();
