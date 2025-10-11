/**
 * useContent hook for content generation management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import {
  ContentGenerationRequest,
  ContentIdeasResponse,
  ContentUpdateRequest,
  ContentIdeasQuery,
  ApiResult
} from '../types/api';

export const useContent = () => {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  // Generate content
  const generateContentMutation = useMutation({
    mutationFn: (request: ContentGenerationRequest) => 
      contentService.generateContent(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
        setSelectedContent(data.data.content_id);
      }
    },
  });

  // Get content ideas by ID
  const useContentIdeas = (contentId: string) => {
    return useQuery({
      queryKey: ['content-ideas', contentId],
      queryFn: () => contentService.getContentIdeas(contentId),
      enabled: !!contentId,
    });
  };

  // List content ideas
  const useContentIdeasList = (query?: ContentIdeasQuery) => {
    return useQuery({
      queryKey: ['content-ideas', query],
      queryFn: () => contentService.listContentIdeas(query),
    });
  };

  // Update content ideas
  const updateContentIdeasMutation = useMutation({
    mutationFn: ({ contentId, update }: { contentId: string; update: ContentUpdateRequest }) =>
      contentService.updateContentIdeas(contentId, update),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['content-ideas', variables.contentId] });
        queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      }
    },
  });

  // Delete content ideas
  const deleteContentIdeasMutation = useMutation({
    mutationFn: (contentId: string) => contentService.deleteContentIdeas(contentId),
    onSuccess: (data, contentId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
        if (selectedContent === contentId) {
          setSelectedContent(null);
        }
      }
    },
  });

  // Get content outline
  const useContentOutline = (contentId: string, angleId: string) => {
    return useQuery({
      queryKey: ['content-outline', contentId, angleId],
      queryFn: () => contentService.getContentOutline(contentId, angleId),
      enabled: !!contentId && !!angleId,
    });
  };

  // Regenerate content
  const regenerateContentMutation = useMutation({
    mutationFn: ({ contentId, angleIds }: { contentId: string; angleIds: string[] }) =>
      contentService.regenerateContent(contentId, angleIds),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['content-ideas', variables.contentId] });
        queryClient.invalidateQueries({ queryKey: ['content-outline', variables.contentId] });
      }
    },
  });

  // Get SEO analysis
  const useSEOAnalysis = (contentId: string) => {
    return useQuery({
      queryKey: ['content-seo-analysis', contentId],
      queryFn: () => contentService.getSEOAnalysis(contentId),
      enabled: !!contentId,
    });
  };

  // Get competitor analysis
  const useCompetitorAnalysis = (contentId: string) => {
    return useQuery({
      queryKey: ['content-competitor-analysis', contentId],
      queryFn: () => contentService.getCompetitorAnalysis(contentId),
      enabled: !!contentId,
    });
  };

  // Get headline suggestions
  const useHeadlineSuggestions = (contentId: string, angleId: string) => {
    return useQuery({
      queryKey: ['content-headline-suggestions', contentId, angleId],
      queryFn: () => contentService.getHeadlineSuggestions(contentId, angleId),
      enabled: !!contentId && !!angleId,
    });
  };

  // Get analytics
  const useAnalytics = (contentId: string) => {
    return useQuery({
      queryKey: ['content-analytics', contentId],
      queryFn: () => contentService.getAnalytics(contentId),
      enabled: !!contentId,
    });
  };

  // Get templates
  const useTemplates = () => {
    return useQuery({
      queryKey: ['content-templates'],
      queryFn: () => contentService.getTemplates(),
    });
  };

  // Helper functions
  const generateContent = useCallback((request: ContentGenerationRequest) => {
    return generateContentMutation.mutateAsync(request);
  }, [generateContentMutation]);

  const updateContentIdeas = useCallback((contentId: string, update: ContentUpdateRequest) => {
    return updateContentIdeasMutation.mutateAsync({ contentId, update });
  }, [updateContentIdeasMutation]);

  const deleteContentIdeas = useCallback((contentId: string) => {
    return deleteContentIdeasMutation.mutateAsync(contentId);
  }, [deleteContentIdeasMutation]);

  const regenerateContent = useCallback((contentId: string, angleIds: string[]) => {
    return regenerateContentMutation.mutateAsync({ contentId, angleIds });
  }, [regenerateContentMutation]);

  return {
    // State
    selectedContent,
    setSelectedContent,
    
    // Mutations
    generateContent,
    updateContentIdeas,
    deleteContentIdeas,
    regenerateContent,
    
    // Mutation states
    isGeneratingContent: generateContentMutation.isPending,
    isUpdatingContentIdeas: updateContentIdeasMutation.isPending,
    isDeletingContentIdeas: deleteContentIdeasMutation.isPending,
    isRegeneratingContent: regenerateContentMutation.isPending,
    
    // Mutation errors
    generateContentError: generateContentMutation.error,
    updateContentIdeasError: updateContentIdeasMutation.error,
    deleteContentIdeasError: deleteContentIdeasMutation.error,
    regenerateContentError: regenerateContentMutation.error,
    
    // Hooks
    useContentIdeas,
    useContentIdeasList,
    useContentOutline,
    useSEOAnalysis,
    useCompetitorAnalysis,
    useHeadlineSuggestions,
    useAnalytics,
    useTemplates,
  };
};
