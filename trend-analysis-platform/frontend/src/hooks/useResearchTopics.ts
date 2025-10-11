/**
 * React hooks for research topics dataflow management
 * Provides state management and API integration for research topics functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseResearchTopicsService } from '../services/supabaseResearchTopicsService';
import {
  ResearchTopic,
  ResearchTopicCreate,
  ResearchTopicUpdate,
  ResearchTopicListParams,
  ResearchTopicSearchParams,
  ResearchTopicComplete,
  ResearchTopicStats,
  TopicDecomposition,
  TopicDecompositionCreate,
  TrendAnalysis,
  TrendAnalysisCreate,
  ContentIdea,
  ContentIdeaCreate,
  ResearchTopicStatus
} from '../types/researchTopics';

// Query keys for React Query
export const researchTopicsKeys = {
  all: ['researchTopics'] as const,
  lists: () => [...researchTopicsKeys.all, 'list'] as const,
  list: (params: ResearchTopicListParams) => [...researchTopicsKeys.lists(), params] as const,
  details: () => [...researchTopicsKeys.all, 'detail'] as const,
  detail: (id: string) => [...researchTopicsKeys.details(), id] as const,
  complete: (id: string) => [...researchTopicsKeys.detail(id), 'complete'] as const,
  stats: () => [...researchTopicsKeys.all, 'stats'] as const,
  search: (params: ResearchTopicSearchParams) => [...researchTopicsKeys.all, 'search', params] as const,
};

// Research Topics hooks
export const useResearchTopics = (params?: ResearchTopicListParams) => {
  return useQuery({
    queryKey: researchTopicsKeys.list(params || {}),
    queryFn: () => supabaseResearchTopicsService.listResearchTopics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useResearchTopic = (id: string) => {
  return useQuery({
    queryKey: researchTopicsKeys.detail(id),
    queryFn: () => supabaseResearchTopicsService.getResearchTopic(id),
    enabled: !!id,
  });
};

export const useResearchTopicComplete = (id: string) => {
  return useQuery({
    queryKey: researchTopicsKeys.complete(id),
    queryFn: () => supabaseResearchTopicsService.getCompleteDataflow(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useResearchTopicsStats = () => {
  return useQuery({
    queryKey: researchTopicsKeys.stats(),
    queryFn: () => supabaseResearchTopicsService.getOverviewStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchResearchTopics = (params: ResearchTopicSearchParams) => {
  return useQuery({
    queryKey: researchTopicsKeys.search(params),
    queryFn: () => supabaseResearchTopicsService.searchResearchTopics(params),
    enabled: !!params.query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutations
export const useCreateResearchTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ResearchTopicCreate) => supabaseResearchTopicsService.createResearchTopic(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.stats() });
    },
  });
};

export const useUpdateResearchTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResearchTopicUpdate }) =>
      supabaseResearchTopicsService.updateResearchTopic(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.stats() });
    },
  });
};

export const useDeleteResearchTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => supabaseResearchTopicsService.deleteResearchTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.stats() });
    },
  });
};

export const useArchiveResearchTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => supabaseResearchTopicsService.archiveResearchTopic(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.stats() });
    },
  });
};

export const useRestoreResearchTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => supabaseResearchTopicsService.restoreResearchTopic(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.stats() });
    },
  });
};

// Subtopic operations
export const useCreateSubtopics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ topicId, data }: { topicId: string; data: TopicDecompositionCreate }) =>
      researchTopicsService.createSubtopics(topicId, data),
    onSuccess: (_, { topicId }) => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.detail(topicId) });
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.complete(topicId) });
    },
  });
};

export const useSubtopics = (topicId: string) => {
  return useQuery({
    queryKey: [...researchTopicsKeys.detail(topicId), 'subtopics'],
    queryFn: () => researchTopicsService.getSubtopics(topicId),
    enabled: !!topicId,
  });
};

// Trend Analysis operations
export const useCreateTrendAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TrendAnalysisCreate) => researchTopicsService.createTrendAnalysis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.all });
    },
  });
};

export const useTrendAnalyses = (params?: any) => {
  return useQuery({
    queryKey: ['trendAnalyses', params],
    queryFn: () => researchTopicsService.listTrendAnalyses(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Content Ideas operations
export const useCreateContentIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ContentIdeaCreate) => researchTopicsService.createContentIdea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchTopicsKeys.all });
    },
  });
};

export const useContentIdeas = (params?: any) => {
  return useQuery({
    queryKey: ['contentIdeas', params],
    queryFn: () => researchTopicsService.listContentIdeas(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Custom hooks for complex operations
export const useDataflowProgress = (topicId: string) => {
  const [progress, setProgress] = useState({
    hasSubtopics: false,
    hasTrendAnalyses: false,
    hasContentIdeas: false,
    progressPercentage: 0
  });

  const updateProgress = useCallback(async () => {
    if (!topicId) return;
    
    try {
      const progressData = await researchTopicsService.getDataflowProgress(topicId);
      setProgress(progressData);
    } catch (error) {
      console.error('Error getting dataflow progress:', error);
    }
  }, [topicId]);

  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  return { ...progress, refresh: updateProgress };
};

export const useDataflowIntegrity = (topicId: string) => {
  const [integrity, setIntegrity] = useState({
    isValid: false,
    issues: [] as string[]
  });

  const checkIntegrity = useCallback(async () => {
    if (!topicId) return;
    
    try {
      const integrityData = await researchTopicsService.validateDataflowIntegrity(topicId);
      setIntegrity(integrityData);
    } catch (error) {
      console.error('Error checking dataflow integrity:', error);
      setIntegrity({
        isValid: false,
        issues: ['Failed to check dataflow integrity']
      });
    }
  }, [topicId]);

  useEffect(() => {
    checkIntegrity();
  }, [checkIntegrity]);

  return { ...integrity, refresh: checkIntegrity };
};

// Hook for managing research topic form state
export const useResearchTopicForm = (initialData?: Partial<ResearchTopic>) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || ResearchTopicStatus.ACTIVE
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof typeof formData, value: string | ResearchTopicStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || ResearchTopicStatus.ACTIVE
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0 && formData.title.trim().length > 0
  };
};

// Hook for managing subtopic form state
export const useSubtopicForm = () => {
  const [formData, setFormData] = useState({
    search_query: '',
    subtopics: [] as Array<{ name: string; description: string }>,
    original_topic_included: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSubtopic = () => {
    setFormData(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, { name: '', description: '' }]
    }));
  };

  const removeSubtopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index)
    }));
  };

  const updateSubtopic = (index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.map((subtopic, i) =>
        i === index ? { ...subtopic, [field]: value } : subtopic
      )
    }));
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.search_query.trim()) {
      newErrors.search_query = 'Search query is required';
    }

    if (formData.subtopics.length === 0) {
      newErrors.subtopics = 'At least one subtopic is required';
    }

    formData.subtopics.forEach((subtopic, index) => {
      if (!subtopic.name.trim()) {
        newErrors[`subtopic_${index}_name`] = 'Subtopic name is required';
      }
      if (!subtopic.description.trim()) {
        newErrors[`subtopic_${index}_description`] = 'Subtopic description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      search_query: '',
      subtopics: [],
      original_topic_included: true
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    addSubtopic,
    removeSubtopic,
    updateSubtopic,
    updateField,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0 && formData.search_query.trim().length > 0 && formData.subtopics.length > 0
  };
};
