/**
 * useAffiliate hook for affiliate research management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { affiliateService } from '../services/affiliateService';
import {
  AffiliateResearchRequest,
  AffiliateResearchResponse,
  AffiliateResearchUpdate,
  AffiliateResearchQuery,
  AffiliateProgramResponse,
  ApiResult
} from '../types/api';

export const useAffiliate = () => {
  const queryClient = useQueryClient();
  const [selectedResearch, setSelectedResearch] = useState<string | null>(null);

  // Start affiliate research
  const startResearchMutation = useMutation({
    mutationFn: (request: AffiliateResearchRequest) => 
      affiliateService.startResearch(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['affiliate-researches'] });
        setSelectedResearch(data.data.id);
      }
    },
  });

  // Get research by ID
  const useResearch = (researchId: string) => {
    return useQuery({
      queryKey: ['affiliate-research', researchId],
      queryFn: () => affiliateService.getResearch(researchId),
      enabled: !!researchId,
    });
  };

  // List researches
  const useResearches = (query?: AffiliateResearchQuery) => {
    return useQuery({
      queryKey: ['affiliate-researches', query],
      queryFn: () => affiliateService.listResearches(query),
    });
  };

  // Update research
  const updateResearchMutation = useMutation({
    mutationFn: ({ researchId, update }: { researchId: string; update: AffiliateResearchUpdate }) =>
      affiliateService.updateResearch(researchId, update),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['affiliate-research', variables.researchId] });
        queryClient.invalidateQueries({ queryKey: ['affiliate-researches'] });
      }
    },
  });

  // Delete research
  const deleteResearchMutation = useMutation({
    mutationFn: (researchId: string) => affiliateService.deleteResearch(researchId),
    onSuccess: (data, researchId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['affiliate-researches'] });
        if (selectedResearch === researchId) {
          setSelectedResearch(null);
        }
      }
    },
  });

  // Get programs
  const usePrograms = (researchId: string) => {
    return useQuery({
      queryKey: ['affiliate-programs', researchId],
      queryFn: () => affiliateService.getPrograms(researchId),
      enabled: !!researchId,
    });
  };

  // Select programs
  const selectProgramsMutation = useMutation({
    mutationFn: ({ researchId, programIds }: { researchId: string; programIds: string[] }) =>
      affiliateService.selectPrograms(researchId, programIds),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['affiliate-programs', variables.researchId] });
        queryClient.invalidateQueries({ queryKey: ['affiliate-research', variables.researchId] });
      }
    },
  });

  // Get networks
  const useNetworks = () => {
    return useQuery({
      queryKey: ['affiliate-networks'],
      queryFn: () => affiliateService.getNetworks(),
    });
  };

  // Get analytics
  const useAnalytics = (researchId: string) => {
    return useQuery({
      queryKey: ['affiliate-analytics', researchId],
      queryFn: () => affiliateService.getAnalytics(researchId),
      enabled: !!researchId,
    });
  };

  // Helper functions
  const startResearch = useCallback((request: AffiliateResearchRequest) => {
    return startResearchMutation.mutateAsync(request);
  }, [startResearchMutation]);

  const updateResearch = useCallback((researchId: string, update: AffiliateResearchUpdate) => {
    return updateResearchMutation.mutateAsync({ researchId, update });
  }, [updateResearchMutation]);

  const deleteResearch = useCallback((researchId: string) => {
    return deleteResearchMutation.mutateAsync(researchId);
  }, [deleteResearchMutation]);

  const selectPrograms = useCallback((researchId: string, programIds: string[]) => {
    return selectProgramsMutation.mutateAsync({ researchId, programIds });
  }, [selectProgramsMutation]);

  return {
    // State
    selectedResearch,
    setSelectedResearch,
    
    // Mutations
    startResearch,
    updateResearch,
    deleteResearch,
    selectPrograms,
    
    // Mutation states
    isStartingResearch: startResearchMutation.isPending,
    isUpdatingResearch: updateResearchMutation.isPending,
    isDeletingResearch: deleteResearchMutation.isPending,
    isSelectingPrograms: selectProgramsMutation.isPending,
    
    // Mutation errors
    startResearchError: startResearchMutation.error,
    updateResearchError: updateResearchMutation.error,
    deleteResearchError: deleteResearchMutation.error,
    selectProgramsError: selectProgramsMutation.error,
    
    // Hooks
    useResearch,
    useResearches,
    usePrograms,
    useNetworks,
    useAnalytics,
  };
};
