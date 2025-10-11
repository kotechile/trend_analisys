/**
 * Keyword Management Service
 */

import { apiClient } from './apiClient';
import {
  KeywordUploadResponse,
  KeywordCrawlRequest,
  KeywordCrawlResponse,
  KeywordDataResponse,
  KeywordDataListResponse,
  KeywordAnalysisResponse,
  KeywordClusterResponse,
  KeywordDataQuery,
  ApiResult
} from '../types/api';

export class KeywordService {
  private baseUrl = '/api/keywords';

  // Upload keywords from CSV
  async uploadKeywords(file: File): Promise<ApiResult<KeywordUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${this.baseUrl}/upload`, formData);
  }

  // Crawl keywords
  async crawlKeywords(request: KeywordCrawlRequest): Promise<ApiResult<KeywordCrawlResponse>> {
    return apiClient.post(`${this.baseUrl}/crawl`, request);
  }

  // Get keyword data by ID
  async getKeywordData(keywordDataId: string): Promise<ApiResult<KeywordDataResponse>> {
    return apiClient.get(`${this.baseUrl}/data/${keywordDataId}`);
  }

  // List user's keyword data
  async listKeywordData(query?: KeywordDataQuery): Promise<ApiResult<KeywordDataListResponse>> {
    const params = new URLSearchParams();
    if (query?.skip) params.append('skip', query.skip.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.source) params.append('source', query.source);

    const url = `${this.baseUrl}/data${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }

  // Delete keyword data
  async deleteKeywordData(keywordDataId: string): Promise<ApiResult<{ message: string }>> {
    return apiClient.delete(`${this.baseUrl}/data/${keywordDataId}`);
  }

  // Get keyword analysis
  async getAnalysis(keywordDataId: string): Promise<ApiResult<KeywordAnalysisResponse>> {
    return apiClient.get(`${this.baseUrl}/data/${keywordDataId}/analysis`);
  }

  // Get keyword clusters
  async getClusters(keywordDataId: string): Promise<ApiResult<KeywordClusterResponse[]>> {
    return apiClient.get(`${this.baseUrl}/data/${keywordDataId}/clusters`);
  }

  // Enrich keywords
  async enrichKeywords(keywordDataId: string): Promise<ApiResult<{ message: string; keyword_data_id: string }>> {
    return apiClient.post(`${this.baseUrl}/data/${keywordDataId}/enrich`);
  }

  // Cluster keywords
  async clusterKeywords(keywordDataId: string): Promise<ApiResult<{ message: string; keyword_data_id: string }>> {
    return apiClient.post(`${this.baseUrl}/data/${keywordDataId}/cluster`);
  }

  // Export keywords
  async exportKeywords(keywordDataId: string, format: string = 'csv'): Promise<ApiResult<any>> {
    const params = new URLSearchParams({ format });
    return apiClient.get(`${this.baseUrl}/data/${keywordDataId}/export?${params.toString()}`);
  }

  // Get keyword suggestions
  async getSuggestions(query: string, geo: string = 'US', language: string = 'en', limit: number = 10): Promise<ApiResult<any>> {
    const params = new URLSearchParams({
      query,
      geo,
      language,
      limit: limit.toString()
    });
    return apiClient.get(`${this.baseUrl}/suggestions?${params.toString()}`);
  }

  // Get keyword analytics
  async getAnalytics(keywordDataId: string): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/data/${keywordDataId}/analytics`);
  }
}

export const keywordService = new KeywordService();
