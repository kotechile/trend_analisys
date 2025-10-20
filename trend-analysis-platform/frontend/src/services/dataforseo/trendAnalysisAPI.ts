/**
 * Trend Analysis API Service
 * 
 * Handles all API calls related to trend analysis functionality
 * powered by DataForSEO APIs.
 */

import axios from 'axios';
import { 
  TrendData, 
  SubtopicData, 
  TrendAnalysisRequest, 
  TrendComparisonRequest, 
  SuggestionRequest,
  APIResponse 
} from '../../types/dataforseo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // Increased to 90 seconds for DataForSEO API
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

export const trendAnalysisAPI = {
  /**
   * Get trend data for specified subtopics
   */
  async getTrendData(request: TrendAnalysisRequest): Promise<APIResponse<TrendData[]>> {
    try {
      console.log('🌐 API Service - Making request to:', '/api/v1/trend-analysis/dataforseo');
      console.log('🌐 API Service - Request params:', {
        subtopics: request.subtopics, // Array format for request body
        location: request.location,
        time_range: request.timeRange
      });
      console.log('🌐 API Service - Base URL:', API_BASE_URL);
      console.log('🌐 API Service - Using POST format: all data in request body (UPDATED)');
      
      const response = await api.post('/api/v1/trend-analysis/dataforseo', {
        subtopics: request.subtopics,
        location: request.location,
        time_range: request.timeRange
      });
      
      console.log('🌐 API Service - Response received:', response);
      console.log('🌐 API Service - Response status:', response.status);
      console.log('🌐 API Service - Response data:', response.data);
      
      // The backend returns data directly as an array, so we need to wrap it
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('🌐 API Service - Processed data:', data);
      
      return {
        data,
        success: true,
        message: 'Trend data fetched successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ API Service - Error fetching trend data:', error);
      console.error('❌ API Service - Error details:', error.response?.data);
      console.error('❌ API Service - Error status:', error.response?.status);
      throw new Error('Failed to fetch trend data');
    }
  },

  /**
   * Compare trends between multiple subtopics
   */
  async compareTrends(request: TrendComparisonRequest): Promise<APIResponse<TrendData[]>> {
    try {
      const response = await api.post('/api/v1/trend-analysis/dataforseo/compare', {
        subtopics: request.subtopics,
        location: request.location,
        time_range: request.timeRange
      });
      return response.data;
    } catch (error) {
      console.error('Error comparing trends:', error);
      throw new Error('Failed to compare trends');
    }
  },

  /**
   * Get trending subtopic suggestions
   */
  async getSuggestions(request: SuggestionRequest): Promise<APIResponse<SubtopicData[]>> {
    try {
      const response = await api.post('/api/v1/trend-analysis/dataforseo/suggestions', {
        base_subtopics: request.baseSubtopics,
        max_suggestions: request.maxSuggestions,
        location: request.location
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw new Error('Failed to fetch suggestions');
    }
  }
};
