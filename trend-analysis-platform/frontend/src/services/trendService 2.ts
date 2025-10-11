/**
 * Trend Analysis Service
 */

import { apiClient } from './apiClient';
import {
  TrendAnalysisRequest,
  TrendAnalysisResponse,
  TrendAnalysisListResponse,
  TrendAnalysisUpdate,
  TrendForecastResponse,
  TrendAnalysisQuery,
  ApiResult
} from '../types/api';

export class TrendService {
  private baseUrl = '/api/trends';

  // Start trend analysis
  async startAnalysis(request: TrendAnalysisRequest): Promise<ApiResult<TrendAnalysisResponse>> {
    return apiClient.post(`${this.baseUrl}/analyze`, request);
  }

  // Get analysis by ID
  async getAnalysis(analysisId: string): Promise<ApiResult<TrendAnalysisResponse>> {
    return apiClient.get(`${this.baseUrl}/analysis/${analysisId}`);
  }

  // List user's analyses
  async listAnalyses(query?: TrendAnalysisQuery): Promise<ApiResult<TrendAnalysisListResponse>> {
    const params = new URLSearchParams();
    if (query?.skip) params.append('skip', query.skip.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);

    const url = `${this.baseUrl}/analysis${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }

  // Update analysis
  async updateAnalysis(analysisId: string, update: TrendAnalysisUpdate): Promise<ApiResult<TrendAnalysisResponse>> {
    return apiClient.put(`${this.baseUrl}/analysis/${analysisId}`, update);
  }

  // Delete analysis
  async deleteAnalysis(analysisId: string): Promise<ApiResult<{ message: string }>> {
    return apiClient.delete(`${this.baseUrl}/analysis/${analysisId}`);
  }

  // Get trend forecast
  async getForecast(analysisId: string): Promise<ApiResult<TrendForecastResponse>> {
    return apiClient.get(`${this.baseUrl}/analysis/${analysisId}/forecast`);
  }

  // Get trend insights
  async getInsights(analysisId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/analysis/${analysisId}/insights`);
  }

  // Refresh analysis
  async refreshAnalysis(analysisId: string): Promise<ApiResult<{ message: string; analysis_id: string }>> {
    return apiClient.post(`${this.baseUrl}/analysis/${analysisId}/refresh`);
  }

  // Get keyword suggestions
  async getKeywordSuggestions(query: string, geo: string = 'US', limit: number = 10): Promise<ApiResult<any>> {
    const params = new URLSearchParams({
      query,
      geo,
      limit: limit.toString()
    });
    return apiClient.get(`${this.baseUrl}/keywords/suggestions?${params.toString()}`);
  }

  // Get available regions
  async getRegions(): Promise<ApiResult<any[]>> {
    return apiClient.get(`${this.baseUrl}/regions`);
  }

  // Get analysis analytics
  async getAnalytics(analysisId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/analysis/${analysisId}/analytics`);
  }
}

export const trendService = new TrendService();
