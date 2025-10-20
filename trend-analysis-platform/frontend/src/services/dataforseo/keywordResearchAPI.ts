/**
 * Keyword Research API Service
 * 
 * Handles all API calls related to keyword research functionality
 * powered by DataForSEO APIs.
 */

import axios from 'axios';
import { 
  KeywordData, 
  KeywordResearchRequest, 
  KeywordPrioritizationRequest,
  APIResponse 
} from '../../types/dataforseo';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90 seconds to allow for LLM processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const keywordResearchAPI = {
  /**
   * Get keyword research data
   */
  async getKeywords(request: KeywordResearchRequest): Promise<APIResponse<KeywordData[]>> {
    try {
      const response = await api.post('/api/v1/keyword-research/dataforseo', {
        seed_keywords: request.seedKeywords,
        max_difficulty: request.maxDifficulty,
        min_volume: request.minVolume,
        intent_types: request.intentTypes,
        max_results: request.maxResults
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching keywords:', error);
      throw new Error('Failed to fetch keywords');
    }
  },

  /**
   * Prioritize keywords based on commercial intent
   */
  async prioritizeKeywords(request: KeywordPrioritizationRequest): Promise<APIResponse<KeywordData[]>> {
    try {
      const response = await api.post('/api/v1/keyword-research/dataforseo/prioritize', {
        keywords: request.keywords,
        priority_factors: request.priorityFactors
      });
      return response.data;
    } catch (error) {
      console.error('Error prioritizing keywords:', error);
      throw new Error('Failed to prioritize keywords');
    }
  }
};
