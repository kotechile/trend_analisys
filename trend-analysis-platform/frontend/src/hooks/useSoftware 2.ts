/**
 * useSoftware hook for software solution management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { softwareService } from '../services/softwareService';
import {
  SoftwareGenerationRequest,
  SoftwareSolutionsResponse,
  SoftwareSolutionResponse,
  SoftwareUpdateRequest,
  SoftwareSolutionsQuery,
  ApiResult
} from '../types/api';

export const useSoftware = () => {
  const queryClient = useQueryClient();
  const [selectedSoftware, setSelectedSoftware] = useState<string | null>(null);

  // Generate software solutions
  const generateSolutionsMutation = useMutation({
    mutationFn: (request: SoftwareGenerationRequest) => 
      softwareService.generateSolutions(request),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['software-solutions'] });
      }
    },
  });

  // Get software solutions by ID
  const useSoftwareSolutions = (softwareSolutionsId: string) => {
    return useQuery({
      queryKey: ['software-solutions', softwareSolutionsId],
      queryFn: () => softwareService.getSoftwareSolutions(softwareSolutionsId),
      enabled: !!softwareSolutionsId,
    });
  };

  // List software solutions
  const useSoftwareSolutionsList = (query?: SoftwareSolutionsQuery) => {
    return useQuery({
      queryKey: ['software-solutions', query],
      queryFn: () => softwareService.listSoftwareSolutions(query),
    });
  };

  // Get individual software solution
  const useSoftwareSolution = (solutionId: string) => {
    return useQuery({
      queryKey: ['software-solution', solutionId],
      queryFn: () => softwareService.getSoftwareSolution(solutionId),
      enabled: !!solutionId,
    });
  };

  // Update software solution
  const updateSoftwareSolutionMutation = useMutation({
    mutationFn: ({ solutionId, update }: { solutionId: string; update: SoftwareUpdateRequest }) =>
      softwareService.updateSoftwareSolution(solutionId, update),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['software-solution', variables.solutionId] });
        queryClient.invalidateQueries({ queryKey: ['software-solutions'] });
      }
    },
  });

  // Delete software solution
  const deleteSoftwareSolutionMutation = useMutation({
    mutationFn: (solutionId: string) => softwareService.deleteSoftwareSolution(solutionId),
    onSuccess: (data, solutionId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['software-solutions'] });
        if (selectedSoftware === solutionId) {
          setSelectedSoftware(null);
        }
      }
    },
  });

  // Get development plan
  const useDevelopmentPlan = (solutionId: string) => {
    return useQuery({
      queryKey: ['software-development-plan', solutionId],
      queryFn: () => softwareService.getDevelopmentPlan(solutionId),
      enabled: !!solutionId,
    });
  };

  // Get monetization strategy
  const useMonetizationStrategy = (solutionId: string) => {
    return useQuery({
      queryKey: ['software-monetization', solutionId],
      queryFn: () => softwareService.getMonetizationStrategy(solutionId),
      enabled: !!solutionId,
    });
  };

  // Get SEO optimization
  const useSEOOptimization = (solutionId: string) => {
    return useQuery({
      queryKey: ['software-seo-optimization', solutionId],
      queryFn: () => softwareService.getSEOOptimization(solutionId),
      enabled: !!solutionId,
    });
  };

  // Get software types
  const useSoftwareTypes = () => {
    return useQuery({
      queryKey: ['software-types'],
      queryFn: () => softwareService.getSoftwareTypes(),
    });
  };

  // Get analytics
  const useAnalytics = (solutionId: string) => {
    return useQuery({
      queryKey: ['software-analytics', solutionId],
      queryFn: () => softwareService.getAnalytics(solutionId),
      enabled: !!solutionId,
    });
  };

  // Helper functions
  const generateSolutions = useCallback((request: SoftwareGenerationRequest) => {
    return generateSolutionsMutation.mutateAsync(request);
  }, [generateSolutionsMutation]);

  const updateSoftwareSolution = useCallback((solutionId: string, update: SoftwareUpdateRequest) => {
    return updateSoftwareSolutionMutation.mutateAsync({ solutionId, update });
  }, [updateSoftwareSolutionMutation]);

  const deleteSoftwareSolution = useCallback((solutionId: string) => {
    return deleteSoftwareSolutionMutation.mutateAsync(solutionId);
  }, [deleteSoftwareSolutionMutation]);

  return {
    // State
    selectedSoftware,
    setSelectedSoftware,
    
    // Mutations
    generateSolutions,
    updateSoftwareSolution,
    deleteSoftwareSolution,
    
    // Mutation states
    isGeneratingSolutions: generateSolutionsMutation.isPending,
    isUpdatingSoftwareSolution: updateSoftwareSolutionMutation.isPending,
    isDeletingSoftwareSolution: deleteSoftwareSolutionMutation.isPending,
    
    // Mutation errors
    generateSolutionsError: generateSolutionsMutation.error,
    updateSoftwareSolutionError: updateSoftwareSolutionMutation.error,
    deleteSoftwareSolutionError: deleteSoftwareSolutionMutation.error,
    
    // Hooks
    useSoftwareSolutions,
    useSoftwareSolutionsList,
    useSoftwareSolution,
    useDevelopmentPlan,
    useMonetizationStrategy,
    useSEOOptimization,
    useSoftwareTypes,
    useAnalytics,
  };
};
