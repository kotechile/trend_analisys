import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

const CONTENT_API_ENDPOINTS = {
  generateContent: '/api/content/generate',
  getContentIdeasList: '/api/content/ideas',
  getContentIdeas: (contentId: string) => `/api/content/ideas/${contentId}`,
  deleteContentIdeas: (contentId: string) => `/api/content/ideas/${contentId}`,
};

export const useContent = () => {
  const queryClient = useQueryClient();

  const useContentIdeasList = (params: { skip: number; limit: number }) => {
    return useQuery({
      queryKey: ['content-ideas-list', params],
      queryFn: () => apiService.get(`${CONTENT_API_ENDPOINTS.getContentIdeasList}?skip=${params.skip}&limit=${params.limit}`),
    });
  };

  const useContentIdeas = (contentId: string) => {
    return useQuery({
      queryKey: ['content-ideas', contentId],
      queryFn: () => apiService.get(CONTENT_API_ENDPOINTS.getContentIdeas(contentId)),
      enabled: !!contentId,
    });
  };

  const { mutateAsync: generateContent, isPending: isGeneratingContent, error: generateContentError } = useMutation({
    mutationFn: (data: any) => apiService.post(CONTENT_API_ENDPOINTS.generateContent, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas-list'] });
    },
  });

  const { mutateAsync: deleteContentIdeas, isPending: isDeletingContentIdeas, error: deleteContentIdeasError } = useMutation({
    mutationFn: (contentId: string) => apiService.delete(CONTENT_API_ENDPOINTS.deleteContentIdeas(contentId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas-list'] });
    },
  });

  return {
    useContentIdeasList,
    useContentIdeas,
    generateContent,
    isGeneratingContent,
    generateContentError,
    deleteContentIdeas,
    isDeletingContentIdeas,
    deleteContentIdeasError,
  };
};