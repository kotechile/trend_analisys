import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

const CALENDAR_API_ENDPOINTS = {
  getCalendarEntries: '/api/calendar/entries',
  getUpcomingReminders: '/api/calendar/reminders',
  scheduleContent: '/api/calendar/schedule-content',
  scheduleSoftwareDevelopment: '/api/calendar/schedule-software',
  updateCalendarEntry: (entryId: string) => `/api/calendar/entries/${entryId}`,
  deleteCalendarEntry: (entryId: string) => `/api/calendar/entries/${entryId}`,
};

export const useCalendar = () => {
  const queryClient = useQueryClient();

  const useCalendarEntries = (params: { start_date: string; end_date: string }) => {
    return useQuery({
      queryKey: ['calendar-entries', params],
      queryFn: () => apiService.get(`${CALENDAR_API_ENDPOINTS.getCalendarEntries}?start_date=${params.start_date}&end_date=${params.end_date}`),
    });
  };

  const useUpcomingReminders = (hours: number) => {
    return useQuery({
      queryKey: ['upcoming-reminders', hours],
      queryFn: () => apiService.get(`${CALENDAR_API_ENDPOINTS.getUpcomingReminders}?hours=${hours}`),
    });
  };

  const { mutateAsync: scheduleContent, isPending: isSchedulingContent, error: scheduleContentError } = useMutation({
    mutationFn: (data: any) => apiService.post(CALENDAR_API_ENDPOINTS.scheduleContent, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
    },
  });

  const { mutateAsync: scheduleSoftwareDevelopment, isPending: isSchedulingSoftwareDevelopment, error: scheduleSoftwareDevelopmentError } = useMutation({
    mutationFn: (softwareSolutionId: string, plannedStartDate: string, estimatedCompletionDate: string) =>
      apiService.post(CALENDAR_API_ENDPOINTS.scheduleSoftwareDevelopment, {
        software_solution_id: softwareSolutionId,
        planned_start_date: plannedStartDate,
        estimated_completion_date: estimatedCompletionDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
    },
  });

  const { mutateAsync: updateCalendarEntry, isPending: isUpdatingCalendarEntry, error: updateCalendarEntryError } = useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: any }) =>
      apiService.put(CALENDAR_API_ENDPOINTS.updateCalendarEntry(entryId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
    },
  });

  const { mutateAsync: deleteCalendarEntry, isPending: isDeletingCalendarEntry, error: deleteCalendarEntryError } = useMutation({
    mutationFn: (entryId: string) => apiService.delete(CALENDAR_API_ENDPOINTS.deleteCalendarEntry(entryId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
    },
  });

  return {
    useCalendarEntries,
    useUpcomingReminders,
    scheduleContent,
    isSchedulingContent,
    scheduleContentError,
    scheduleSoftwareDevelopment,
    isSchedulingSoftwareDevelopment,
    scheduleSoftwareDevelopmentError,
    updateCalendarEntry,
    isUpdatingCalendarEntry,
    updateCalendarEntryError,
    deleteCalendarEntry,
    isDeletingCalendarEntry,
    deleteCalendarEntryError,
  };
};