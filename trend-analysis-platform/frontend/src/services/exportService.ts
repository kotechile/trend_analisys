/**
 * Export Integration Service
 */

import { apiClient } from './apiClient';
import {
  ExportRequest,
  ExportResponse,
  ExportStatusResponse,
  ExportTemplateResponse,
  ExportTemplateListResponse,
  ExportHistoryQuery,
  ApiResult
} from '../types/api';

export class ExportService {
  private baseUrl = '/api/export';

  // Export to Google Docs
  async exportToGoogleDocs(request: ExportRequest): Promise<ApiResult<ExportResponse>> {
    return apiClient.post(`${this.baseUrl}/google-docs`, request);
  }

  // Export to Notion
  async exportToNotion(request: ExportRequest): Promise<ApiResult<ExportResponse>> {
    return apiClient.post(`${this.baseUrl}/notion`, request);
  }

  // Export to WordPress
  async exportToWordPress(request: ExportRequest): Promise<ApiResult<ExportResponse>> {
    return apiClient.post(`${this.baseUrl}/wordpress`, request);
  }

  // Export software solution
  async exportSoftwareSolution(
    softwareSolutionId: string,
    platform: string,
    templateId: number,
    customFields?: Record<string, any>
  ): Promise<ApiResult<ExportResponse>> {
    return apiClient.post(`${this.baseUrl}/software/${softwareSolutionId}`, {
      platform,
      template_id: templateId,
      custom_fields: customFields
    });
  }

  // Export calendar entries
  async exportCalendarEntries(
    startDate: string,
    endDate: string,
    platform: string,
    templateId: number
  ): Promise<ApiResult<ExportResponse>> {
    return apiClient.post(`${this.baseUrl}/calendar`, {
      start_date: startDate,
      end_date: endDate,
      platform,
      template_id: templateId
    });
  }

  // Get export templates
  async getTemplates(platform?: string, contentType?: string): Promise<ApiResult<ExportTemplateListResponse>> {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (contentType) params.append('content_type', contentType);

    const url = `${this.baseUrl}/templates${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }

  // Get template by ID
  async getTemplate(templateId: number): Promise<ApiResult<ExportTemplateResponse>> {
    return apiClient.get(`${this.baseUrl}/templates/${templateId}`);
  }

  // Create export template
  async createTemplate(
    name: string,
    platform: string,
    contentType: string,
    description: string,
    fields: Record<string, any>
  ): Promise<ApiResult<ExportTemplateResponse>> {
    return apiClient.post(`${this.baseUrl}/templates`, {
      name,
      platform,
      content_type: contentType,
      description,
      fields
    });
  }

  // Update export template
  async updateTemplate(
    templateId: number,
    name?: string,
    description?: string,
    fields?: Record<string, any>
  ): Promise<ApiResult<ExportTemplateResponse>> {
    return apiClient.put(`${this.baseUrl}/templates/${templateId}`, {
      name,
      description,
      fields
    });
  }

  // Delete export template
  async deleteTemplate(templateId: number): Promise<ApiResult<{ message: string }>> {
    return apiClient.delete(`${this.baseUrl}/templates/${templateId}`);
  }

  // Get export status
  async getExportStatus(exportId: string): Promise<ApiResult<ExportStatusResponse>> {
    return apiClient.get(`${this.baseUrl}/status/${exportId}`);
  }

  // Get available platforms
  async getPlatforms(): Promise<ApiResult<any[]>> {
    return apiClient.get(`${this.baseUrl}/platforms`);
  }

  // Get export history
  async getExportHistory(query?: ExportHistoryQuery): Promise<ApiResult<any[]>> {
    const params = new URLSearchParams();
    if (query?.skip) params.append('skip', query.skip.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.platform) params.append('platform', query.platform);

    const url = `${this.baseUrl}/history${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(url);
  }
}

export const exportService = new ExportService();
