/**
 * Calendar Management Service
 */

import { apiClient } from './apiClient';
import {
  CalendarScheduleRequest,
  CalendarScheduleResponse,
  CalendarEntryResponse,
  CalendarEntryListResponse,
  CalendarUpdateRequest,
  CalendarAnalyticsResponse,
  CalendarEntriesQuery,
  ApiResult
} from '../types/api';

export class CalendarService {
  private baseUrl = '/api/calendar';

  // Schedule content
  async scheduleContent(request: CalendarScheduleRequest): Promise<ApiResult<CalendarScheduleResponse>> {
    return apiClient.post(`${this.baseUrl}/schedule`, request);
  }

  // Schedule software development
  async scheduleSoftwareDevelopment(
    softwareSolutionId: string,
    plannedStartDate: string,
    estimatedCompletionDate: string,
    notes?: string
  ): Promise<ApiResult<CalendarScheduleResponse>> {
    return apiClient.post(`${this.baseUrl}/schedule-software`, {
      software_solution_id: softwareSolutionId,
      planned_start_date: plannedStartDate,
      estimated_completion_date: estimatedCompletionDate,
      notes
    });
  }

  // Get calendar entries
  async getCalendarEntries(query: CalendarEntriesQuery): Promise<ApiResult<CalendarEntryListResponse>> {
    const params = new URLSearchParams({
      start_date: query.start_date,
      end_date: query.end_date
    });
    if (query.content_type) params.append('content_type', query.content_type);

    return apiClient.get(`${this.baseUrl}/entries?${params.toString()}`);
  }

  // Get calendar entry by ID
  async getCalendarEntry(entryId: string): Promise<ApiResult<CalendarEntryResponse>> {
    return apiClient.get(`${this.baseUrl}/entries/${entryId}`);
  }

  // Update calendar entry
  async updateCalendarEntry(entryId: string, update: CalendarUpdateRequest): Promise<ApiResult<CalendarEntryResponse>> {
    return apiClient.put(`${this.baseUrl}/entries/${entryId}`, update);
  }

  // Delete calendar entry
  async deleteCalendarEntry(entryId: string): Promise<ApiResult<{ message: string }>> {
    return apiClient.delete(`${this.baseUrl}/entries/${entryId}`);
  }

  // Get upcoming reminders
  async getUpcomingReminders(hoursAhead: number = 24): Promise<ApiResult<any[]>> {
    const params = new URLSearchParams({ hours_ahead: hoursAhead.toString() });
    return apiClient.get(`${this.baseUrl}/reminders?${params.toString()}`);
  }

  // Auto-schedule content
  async autoScheduleContent(
    contentIdeas: any[],
    startDate: string,
    frequencyDays: number = 7
  ): Promise<ApiResult<any>> {
    return apiClient.post(`${this.baseUrl}/auto-schedule`, {
      content_ideas: contentIdeas,
      start_date: startDate,
      frequency_days: frequencyDays
    });
  }

  // Get calendar analytics
  async getAnalytics(startDate: string, endDate: string): Promise<ApiResult<CalendarAnalyticsResponse>> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    return apiClient.get(`${this.baseUrl}/analytics?${params.toString()}`);
  }

  // Get sync status
  async getSyncStatus(): Promise<ApiResult<any>> {
    return apiClient.get(`${this.baseUrl}/sync-status`);
  }

  // Sync with external calendars
  async syncWithExternalCalendars(): Promise<ApiResult<any>> {
    return apiClient.post(`${this.baseUrl}/sync`);
  }

  // Get calendar templates
  async getTemplates(): Promise<ApiResult<any[]>> {
    return apiClient.get(`${this.baseUrl}/templates`);
  }

  // Export calendar
  async exportCalendar(startDate: string, endDate: string, format: string = 'csv'): Promise<ApiResult<any>> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      format
    });
    return apiClient.get(`${this.baseUrl}/export?${params.toString()}`);
  }
}

export const calendarService = new CalendarService();
