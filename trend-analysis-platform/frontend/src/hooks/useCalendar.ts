/**
 * useCalendar hook for calendar management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '../services/calendarService';
import {
  CalendarScheduleRequest,
  CalendarEntryResponse,
  CalendarUpdateRequest,
  CalendarEntriesQuery,
  CalendarAnalyticsResponse,
  ApiResult
} from '../types/api';

export const useCalendar = () => {
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  // Schedule content
  const scheduleContentMutation = useMutation({
    mutationFn: (request: CalendarScheduleRequest) => 
      calendarService.scheduleContent(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
      }
    },
  });

  // Schedule software development
  const scheduleSoftwareDevelopmentMutation = useMutation({
    mutationFn: ({ softwareSolutionId, plannedStartDate, estimatedCompletionDate, notes }: {
      softwareSolutionId: string;
      plannedStartDate: string;
      estimatedCompletionDate: string;
      notes?: string;
    }) => calendarService.scheduleSoftwareDevelopment(softwareSolutionId, plannedStartDate, estimatedCompletionDate, notes),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
      }
    },
  });

  // Get calendar entries
  const useCalendarEntries = (query: CalendarEntriesQuery) => {
    return useQuery({
      queryKey: ['calendar-entries', query],
      queryFn: () => calendarService.getCalendarEntries(query),
    });
  };

  // Get calendar entry by ID
  const useCalendarEntry = (entryId: string) => {
    return useQuery({
      queryKey: ['calendar-entry', entryId],
      queryFn: () => calendarService.getCalendarEntry(entryId),
      enabled: !!entryId,
    });
  };

  // Update calendar entry
  const updateCalendarEntryMutation = useMutation({
    mutationFn: ({ entryId, update }: { entryId: string; update: CalendarUpdateRequest }) =>
      calendarService.updateCalendarEntry(entryId, update),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['calendar-entry', variables.entryId] });
        queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
      }
    },
  });

  // Delete calendar entry
  const deleteCalendarEntryMutation = useMutation({
    mutationFn: (entryId: string) => calendarService.deleteCalendarEntry(entryId),
    onSuccess: (data, entryId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
        if (selectedEntry === entryId) {
          setSelectedEntry(null);
        }
      }
    },
  });

  // Get upcoming reminders
  const useUpcomingReminders = (hoursAhead: number = 24) => {
    return useQuery({
      queryKey: ['calendar-reminders', hoursAhead],
      queryFn: () => calendarService.getUpcomingReminders(hoursAhead),
    });
  };

  // Auto-schedule content
  const autoScheduleContentMutation = useMutation({
    mutationFn: ({ contentIdeas, startDate, frequencyDays }: {
      contentIdeas: any[];
      startDate: string;
      frequencyDays?: number;
    }) => calendarService.autoScheduleContent(contentIdeas, startDate, frequencyDays),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-analytics'] });
      }
    },
  });

  // Get analytics
  const useAnalytics = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['calendar-analytics', startDate, endDate],
      queryFn: () => calendarService.getAnalytics(startDate, endDate),
    });
  };

  // Get sync status
  const useSyncStatus = () => {
    return useQuery({
      queryKey: ['calendar-sync-status'],
      queryFn: () => calendarService.getSyncStatus(),
    });
  };

  // Sync with external calendars
  const syncWithExternalCalendarsMutation = useMutation({
    mutationFn: () => calendarService.syncWithExternalCalendars(),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-sync-status'] });
      }
    },
  });

  // Get templates
  const useTemplates = () => {
    return useQuery({
      queryKey: ['calendar-templates'],
      queryFn: () => calendarService.getTemplates(),
    });
  };

  // Export calendar
  const exportCalendarMutation = useMutation({
    mutationFn: ({ startDate, endDate, format }: {
      startDate: string;
      endDate: string;
      format?: string;
    }) => calendarService.exportCalendar(startDate, endDate, format),
  });

  // Helper functions
  const scheduleContent = useCallback((request: CalendarScheduleRequest) => {
    return scheduleContentMutation.mutateAsync(request);
  }, [scheduleContentMutation]);

  const scheduleSoftwareDevelopment = useCallback((softwareSolutionId: string, plannedStartDate: string, estimatedCompletionDate: string, notes?: string) => {
    return scheduleSoftwareDevelopmentMutation.mutateAsync({ softwareSolutionId, plannedStartDate, estimatedCompletionDate, notes });
  }, [scheduleSoftwareDevelopmentMutation]);

  const updateCalendarEntry = useCallback((entryId: string, update: CalendarUpdateRequest) => {
    return updateCalendarEntryMutation.mutateAsync({ entryId, update });
  }, [updateCalendarEntryMutation]);

  const deleteCalendarEntry = useCallback((entryId: string) => {
    return deleteCalendarEntryMutation.mutateAsync(entryId);
  }, [deleteCalendarEntryMutation]);

  const autoScheduleContent = useCallback((contentIdeas: any[], startDate: string, frequencyDays: number = 7) => {
    return autoScheduleContentMutation.mutateAsync({ contentIdeas, startDate, frequencyDays });
  }, [autoScheduleContentMutation]);

  const syncWithExternalCalendars = useCallback(() => {
    return syncWithExternalCalendarsMutation.mutateAsync();
  }, [syncWithExternalCalendarsMutation]);

  const exportCalendar = useCallback((startDate: string, endDate: string, format: string = 'csv') => {
    return exportCalendarMutation.mutateAsync({ startDate, endDate, format });
  }, [exportCalendarMutation]);

  return {
    // State
    selectedEntry,
    setSelectedEntry,
    
    // Mutations
    scheduleContent,
    scheduleSoftwareDevelopment,
    updateCalendarEntry,
    deleteCalendarEntry,
    autoScheduleContent,
    syncWithExternalCalendars,
    exportCalendar,
    
    // Mutation states
    isSchedulingContent: scheduleContentMutation.isPending,
    isSchedulingSoftwareDevelopment: scheduleSoftwareDevelopmentMutation.isPending,
    isUpdatingCalendarEntry: updateCalendarEntryMutation.isPending,
    isDeletingCalendarEntry: deleteCalendarEntryMutation.isPending,
    isAutoSchedulingContent: autoScheduleContentMutation.isPending,
    isSyncingWithExternalCalendars: syncWithExternalCalendarsMutation.isPending,
    isExportingCalendar: exportCalendarMutation.isPending,
    
    // Mutation errors
    scheduleContentError: scheduleContentMutation.error,
    scheduleSoftwareDevelopmentError: scheduleSoftwareDevelopmentMutation.error,
    updateCalendarEntryError: updateCalendarEntryMutation.error,
    deleteCalendarEntryError: deleteCalendarEntryMutation.error,
    autoScheduleContentError: autoScheduleContentMutation.error,
    syncWithExternalCalendarsError: syncWithExternalCalendarsMutation.error,
    exportCalendarError: exportCalendarMutation.error,
    
    // Hooks
    useCalendarEntries,
    useCalendarEntry,
    useUpcomingReminders,
    useAnalytics,
    useSyncStatus,
    useTemplates,
  };
};
