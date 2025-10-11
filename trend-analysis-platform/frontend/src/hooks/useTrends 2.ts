import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

const TRENDS_API_ENDPOINTS = {
  startAnalysis: '/api/trends/start-analysis',
  getAnalysis: (analysisId: string) => `/api/trends/analysis/${analysisId}`,
  getForecast: (analysisId: string) => `/api/trends/analysis/${analysisId}/forecast`,
  getKeywordSuggestions: '/api/trends/keyword-suggestions',
  getRegions: '/api/trends/regions',
};

export const useTrends = () => {
  const queryClient = useQueryClient();

  const useAnalysis = (analysisId: string) => {
    return useQuery({
      queryKey: ['trend-analysis', analysisId],
      queryFn: () => apiService.get(TRENDS_API_ENDPOINTS.getAnalysis(analysisId)),
      enabled: !!analysisId,
    });
  };

  const useForecast = (analysisId: string) => {
    return useQuery({
      queryKey: ['trend-forecast', analysisId],
      queryFn: () => apiService.get(TRENDS_API_ENDPOINTS.getForecast(analysisId)),
      enabled: !!analysisId,
    });
  };

  const useKeywordSuggestions = (keyword: string, geo: string) => {
    return useQuery({
      queryKey: ['keyword-suggestions', keyword, geo],
      queryFn: () => apiService.get(`${TRENDS_API_ENDPOINTS.getKeywordSuggestions}?keyword=${keyword}&geo=${geo}`),
      enabled: !!keyword,
    });
  };

  const useRegions = () => {
    return useQuery({
      queryKey: ['regions'],
      queryFn: () => apiService.get(TRENDS_API_ENDPOINTS.getRegions),
    });
  };

  const { mutateAsync: startAnalysis, isPending: isStartingAnalysis, error: startAnalysisError } = useMutation({
    mutationFn: (data: any) => apiService.post(TRENDS_API_ENDPOINTS.startAnalysis, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['trend-analysis', data.data.id] });
    },
  });

  return {
    useAnalysis,
    useForecast,
    useKeywordSuggestions,
    useRegions,
    startAnalysis,
    isStartingAnalysis,
    startAnalysisError,
  };
};