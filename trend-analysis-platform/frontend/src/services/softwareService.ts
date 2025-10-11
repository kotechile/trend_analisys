/**
 * Software Generation Service
 */

import { apiClient } from './apiClient';
import {
  SoftwareGenerationRequest,
  SoftwareGenerationResponse,
  SoftwareSolutionsResponse,
  SoftwareSolutionsListResponse,
  SoftwareSolutionResponse,
  SoftwareUpdateRequest,
  SoftwareSolutionsQuery,
  ApiResult
} from '../types/api';

export class SoftwareService {
  private baseUrl = '/api/software';

  // Generate software solutions
  async generateSolutions(request: SoftwareGenerationRequest): Promise<ApiResult<SoftwareGenerationResponse>> {
    return apiClient.post(`${this.baseUrl}/generate`, request);
  }

  // Get software solutions by ID
  async getSoftwareSolutions(softwareSolutionsId: string): Promise<ApiResult<SoftwareSolutionsResponse>> {
    return apiClient.get(`${this.baseUrl}/solutions/${softwareSolutionsId}`);
  }

  // List user's software solutions
  async listSoftwareSolutions(query?: SoftwareSolutionsQuery): Promise<ApiResult<SoftwareSolutionsListResponse>> {
    const params = new URLSearchParams();
    if (query?.skip) params.append('skip', query.skip.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.software_type) params.append('software_type', query.software_type);

    const url = `${this.baseUrl}/solutions${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }

  // Get individual software solution
  async getSoftwareSolution(solutionId: string): Promise<ApiResult<SoftwareSolutionResponse>> {
    return apiClient.get(`${this.baseUrl}/solution/${solutionId}`);
  }

  // Update software solution
  async updateSoftwareSolution(solutionId: string, update: SoftwareUpdateRequest): Promise<ApiResult<SoftwareSolutionResponse>> {
    return apiClient.put(`${this.baseUrl}/solution/${solutionId}`, update);
  }

  // Delete software solution
  async deleteSoftwareSolution(solutionId: string): Promise<ApiResult<{ message: string }>> {
    return apiClient.delete(`${this.baseUrl}/solution/${solutionId}`);
  }

  // Get development plan
  async getDevelopmentPlan(solutionId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/solution/${solutionId}/development-plan`);
  }

  // Get monetization strategy
  async getMonetizationStrategy(solutionId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/solution/${solutionId}/monetization`);
  }

  // Get SEO optimization
  async getSEOOptimization(solutionId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/solution/${solutionId}/seo-optimization`);
  }

  // Get software types
  async getSoftwareTypes(): Promise<ApiResult<any[]>> {
    return apiClient.get(`${this.baseUrl}/types`);
  }

  // Get software analytics
  async getAnalytics(solutionId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/solution/${solutionId}/analytics`);
  }
}

export const softwareService = new SoftwareService();
