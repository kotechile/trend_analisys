/**
 * API Service
 * 
 * Centralized API client for communicating with the backend.
 * Handles authentication, request/response transformation, and error handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// Request/Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

// File Upload Types
export interface FileUploadResponse {
  file_id: string;
  status: string;
  message: string;
  filename: string;
  file_size: number;
  created_at: string;
}

export interface FileStatusResponse {
  file_id: string;
  status: string;
  progress: number;
  message: string;
  filename: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

// Analysis Types
export interface AnalysisStartResponse {
  analysis_id: string;
  file_id: string;
  status: string;
  message: string;
  created_at: string;
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  file_id: string;
  status: string;
  progress: number;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResultsResponse {
  analysis_id: string;
  file_id: string;
  status: string;
  summary: {
    total_keywords: number;
    total_volume: number;
    average_difficulty: number;
    average_cpc: number;
    intent_distribution: Record<string, number>;
  };
  keywords: any[];
  content_opportunities: any[];
  seo_content_ideas: any[];
  created_at: string;
  completed_at?: string;
}

// Report Types
export interface ReportResponse {
  report_id: string;
  file_id: string;
  user_id: string;
  status: string;
  summary: any;
  keywords_count: number;
  content_opportunities_count: number;
  seo_content_ideas_count: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface ReportsListResponse {
  reports: ReportResponse[];
  total_count: number;
  limit: number;
  offset: number;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private transformError(error: any): ErrorResponse {
    if (error.response?.data) {
      return {
        error: error.response.data.error || 'Request failed',
        message: error.response.data.message || error.message,
        details: error.response.data.details,
        timestamp: error.response.data.timestamp || new Date().toISOString(),
      };
    }

    return {
      error: 'Network error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  }

  // File Upload Methods
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<FileUploadResponse>('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getFileStatus(fileId: string): Promise<FileStatusResponse> {
    const response = await this.client.get<FileStatusResponse>(`/api/v1/upload/${fileId}/status`);
    return response.data;
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/v1/upload/${fileId}`);
    return response.data;
  }

  // Analysis Methods
  async startAnalysis(fileId: string): Promise<AnalysisStartResponse> {
    const response = await this.client.post<AnalysisStartResponse>(`/api/v1/analysis/${fileId}/start`);
    return response.data;
  }

  async getAnalysisStatus(fileId: string): Promise<AnalysisStatusResponse> {
    const response = await this.client.get<AnalysisStatusResponse>(`/api/v1/analysis/${fileId}/status`);
    return response.data;
  }

  async getAnalysisResults(fileId: string): Promise<AnalysisResultsResponse> {
    const response = await this.client.get<AnalysisResultsResponse>(`/api/v1/analysis/${fileId}/results`);
    return response.data;
  }

  // Report Methods
  async getReport(reportId: string): Promise<ReportResponse> {
    const response = await this.client.get<ReportResponse>(`/api/v1/reports/${reportId}`);
    return response.data;
  }

  async getReports(limit: number = 50, offset: number = 0): Promise<ReportsListResponse> {
    const response = await this.client.get<ReportsListResponse>('/api/v1/reports', {
      params: { limit, offset },
    });
    return response.data;
  }

  async exportReport(reportId: string, format: string = 'json'): Promise<Blob> {
    const response = await this.client.get(`/api/v1/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteReport(reportId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/v1/reports/${reportId}`);
    return response.data;
  }

  // Utility Methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Generic GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File download helper
  async downloadFile(url: string, filename: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Set authentication token
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // Clear authentication token
  clearAuthToken(): void {
    localStorage.removeItem('auth_token');
    delete this.client.defaults.headers.Authorization;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.client.defaults.baseURL || API_BASE_URL;
  }

  // Update base URL
  setBaseURL(url: string): void {
    this.client.defaults.baseURL = url;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
export { apiService };

// Export types for use in other modules
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  FileUploadResponse,
  FileStatusResponse,
  AnalysisStartResponse,
  AnalysisStatusResponse,
  AnalysisResultsResponse,
  ReportResponse,
  ReportsListResponse,
};