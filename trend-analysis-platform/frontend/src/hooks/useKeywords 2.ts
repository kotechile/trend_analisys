import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

const KEYWORDS_API_ENDPOINTS = {
  uploadKeywords: '/api/keywords/upload',
  getClusters: (keywordDataId: string) => `/api/keywords/clusters/${keywordDataId}`,
  clusterKeywords: (keywordDataId: string) => `/api/keywords/clusters/${keywordDataId}/cluster`,
};

export const useKeywords = () => {
  const queryClient = useQueryClient();

  const useClusters = (keywordDataId: string) => {
    return useQuery({
      queryKey: ['keyword-clusters', keywordDataId],
      queryFn: () => apiService.get(KEYWORDS_API_ENDPOINTS.getClusters(keywordDataId)),
      enabled: !!keywordDataId,
    });
  };

  const { mutateAsync: uploadKeywords, isPending: isUploadingKeywords, error: uploadKeywordsError } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiService.post(KEYWORDS_API_ENDPOINTS.uploadKeywords, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-clusters'] });
    },
  });

  const { mutateAsync: clusterKeywords, isPending: isClusteringKeywords, error: clusterKeywordsError } = useMutation({
    mutationFn: (keywordDataId: string) => apiService.post(KEYWORDS_API_ENDPOINTS.clusterKeywords(keywordDataId)),
    onSuccess: (data: any, keywordDataId) => {
      queryClient.invalidateQueries({ queryKey: ['keyword-clusters', keywordDataId] });
    },
  });

  return {
    useClusters,
    uploadKeywords,
    isUploadingKeywords,
    uploadKeywordsError,
    clusterKeywords,
    isClusteringKeywords,
    clusterKeywordsError,
  };
};