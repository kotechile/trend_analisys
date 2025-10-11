/**
 * useExport hook for export integration management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportService } from '../services/exportService';
import {
  ExportRequest,
  ExportResponse,
  ExportStatusResponse,
  ExportTemplateResponse,
  ExportHistoryQuery,
  ApiResult
} from '../types/api';

export const useExport = () => {
  const queryClient = useQueryClient();
  const [activeExports, setActiveExports] = useState<Set<string>>(new Set());

  // Export to Google Docs
  const exportToGoogleDocsMutation = useMutation({
    mutationFn: (request: ExportRequest) => exportService.exportToGoogleDocs(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-history'] });
      }
    },
  });

  // Export to Notion
  const exportToNotionMutation = useMutation({
    mutationFn: (request: ExportRequest) => exportService.exportToNotion(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-history'] });
      }
    },
  });

  // Export to WordPress
  const exportToWordPressMutation = useMutation({
    mutationFn: (request: ExportRequest) => exportService.exportToWordPress(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-history'] });
      }
    },
  });

  // Export software solution
  const exportSoftwareSolutionMutation = useMutation({
    mutationFn: ({ softwareSolutionId, platform, templateId, customFields }: {
      softwareSolutionId: string;
      platform: string;
      templateId: number;
      customFields?: Record<string, any>;
    }) => exportService.exportSoftwareSolution(softwareSolutionId, platform, templateId, customFields),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-history'] });
      }
    },
  });

  // Export calendar entries
  const exportCalendarEntriesMutation = useMutation({
    mutationFn: ({ startDate, endDate, platform, templateId }: {
      startDate: string;
      endDate: string;
      platform: string;
      templateId: number;
    }) => exportService.exportCalendarEntries(startDate, endDate, platform, templateId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-history'] });
      }
    },
  });

  // Get templates
  const useTemplates = (platform?: string, contentType?: string) => {
    return useQuery({
      queryKey: ['export-templates', platform, contentType],
      queryFn: () => exportService.getTemplates(platform, contentType),
    });
  };

  // Get template by ID
  const useTemplate = (templateId: number) => {
    return useQuery({
      queryKey: ['export-template', templateId],
      queryFn: () => exportService.getTemplate(templateId),
      enabled: !!templateId,
    });
  };

  // Create template
  const createTemplateMutation = useMutation({
    mutationFn: ({ name, platform, contentType, description, fields }: {
      name: string;
      platform: string;
      contentType: string;
      description: string;
      fields: Record<string, any>;
    }) => exportService.createTemplate(name, platform, contentType, description, fields),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-templates'] });
      }
    },
  });

  // Update template
  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, name, description, fields }: {
      templateId: number;
      name?: string;
      description?: string;
      fields?: Record<string, any>;
    }) => exportService.updateTemplate(templateId, name, description, fields),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-templates'] });
        queryClient.invalidateQueries({ queryKey: ['export-template', variables.templateId] });
      }
    },
  });

  // Delete template
  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: number) => exportService.deleteTemplate(templateId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['export-templates'] });
      }
    },
  });

  // Get export status
  const useExportStatus = (exportId: string) => {
    return useQuery({
      queryKey: ['export-status', exportId],
      queryFn: () => exportService.getExportStatus(exportId),
      enabled: !!exportId,
      refetchInterval: (data) => {
        // Stop polling if export is completed or failed
        if (data?.data?.status === 'completed' || data?.data?.status === 'failed') {
          return false;
        }
        // Poll every 2 seconds for active exports
        return 2000;
      },
    });
  };

  // Get platforms
  const usePlatforms = () => {
    return useQuery({
      queryKey: ['export-platforms'],
      queryFn: () => exportService.getPlatforms(),
    });
  };

  // Get export history
  const useExportHistory = (query?: ExportHistoryQuery) => {
    return useQuery({
      queryKey: ['export-history', query],
      queryFn: () => exportService.getExportHistory(query),
    });
  };

  // Helper functions
  const exportToGoogleDocs = useCallback((request: ExportRequest) => {
    return exportToGoogleDocsMutation.mutateAsync(request);
  }, [exportToGoogleDocsMutation]);

  const exportToNotion = useCallback((request: ExportRequest) => {
    return exportToNotionMutation.mutateAsync(request);
  }, [exportToNotionMutation]);

  const exportToWordPress = useCallback((request: ExportRequest) => {
    return exportToWordPressMutation.mutateAsync(request);
  }, [exportToWordPressMutation]);

  const exportSoftwareSolution = useCallback((softwareSolutionId: string, platform: string, templateId: number, customFields?: Record<string, any>) => {
    return exportSoftwareSolutionMutation.mutateAsync({ softwareSolutionId, platform, templateId, customFields });
  }, [exportSoftwareSolutionMutation]);

  const exportCalendarEntries = useCallback((startDate: string, endDate: string, platform: string, templateId: number) => {
    return exportCalendarEntriesMutation.mutateAsync({ startDate, endDate, platform, templateId });
  }, [exportCalendarEntriesMutation]);

  const createTemplate = useCallback((name: string, platform: string, contentType: string, description: string, fields: Record<string, any>) => {
    return createTemplateMutation.mutateAsync({ name, platform, contentType, description, fields });
  }, [createTemplateMutation]);

  const updateTemplate = useCallback((templateId: number, name?: string, description?: string, fields?: Record<string, any>) => {
    return updateTemplateMutation.mutateAsync({ templateId, name, description, fields });
  }, [updateTemplateMutation]);

  const deleteTemplate = useCallback((templateId: number) => {
    return deleteTemplateMutation.mutateAsync(templateId);
  }, [deleteTemplateMutation]);

  return {
    // State
    activeExports,
    setActiveExports,
    
    // Mutations
    exportToGoogleDocs,
    exportToNotion,
    exportToWordPress,
    exportSoftwareSolution,
    exportCalendarEntries,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Mutation states
    isExportingToGoogleDocs: exportToGoogleDocsMutation.isPending,
    isExportingToNotion: exportToNotionMutation.isPending,
    isExportingToWordPress: exportToWordPressMutation.isPending,
    isExportingSoftwareSolution: exportSoftwareSolutionMutation.isPending,
    isExportingCalendarEntries: exportCalendarEntriesMutation.isPending,
    isCreatingTemplate: createTemplateMutation.isPending,
    isUpdatingTemplate: updateTemplateMutation.isPending,
    isDeletingTemplate: deleteTemplateMutation.isPending,
    
    // Mutation errors
    exportToGoogleDocsError: exportToGoogleDocsMutation.error,
    exportToNotionError: exportToNotionMutation.error,
    exportToWordPressError: exportToWordPressMutation.error,
    exportSoftwareSolutionError: exportSoftwareSolutionMutation.error,
    exportCalendarEntriesError: exportCalendarEntriesMutation.error,
    createTemplateError: createTemplateMutation.error,
    updateTemplateError: updateTemplateMutation.error,
    deleteTemplateError: deleteTemplateMutation.error,
    
    // Hooks
    useTemplates,
    useTemplate,
    useExportStatus,
    usePlatforms,
    useExportHistory,
  };
};
