/**
 * Enhanced Topics Hook
 * React Query hook for Google Autocomplete integration with topic decomposition
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import {
  EnhancedTopicDecompositionRequest,
  EnhancedTopicDecompositionResponse,
  AutocompleteResponse,
  MethodComparisonRequest,
  MethodComparisonResponse,
  UseEnhancedTopicsOptions,
  UseEnhancedTopicsReturn,
  UseAutocompleteOptions,
  UseAutocompleteReturn,
  EnhancedSubtopic,
  SubtopicSource
} from '../../../../shared/types/enhanced-topics';
import { enhancedTopicsService, autocompleteService, serviceUtils } from '../services/enhancedTopicService';
import { debounce, validateQuery, formatProcessingTime, formatRelevanceScore } from '../../../../shared/utils/autocomplete-helpers';

/**
 * Enhanced Topics Hook
 * Provides methods for enhanced topic decomposition with Google Autocomplete
 */
export function useEnhancedTopics(options: UseEnhancedTopicsOptions = {}): UseEnhancedTopicsReturn {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000 // 10 minutes
  } = options;

  const queryClient = useQueryClient();
  const [currentData, setCurrentData] = useState<EnhancedTopicDecompositionResponse | null>(null);

  // Decompose topic mutation
  const decomposeTopicMutation = useMutation({
    mutationFn: async (request: EnhancedTopicDecompositionRequest) => {
      return await serviceUtils.retryWithBackoff(
        () => enhancedTopicsService.decomposeTopic(request),
        3,
        1000
      );
    },
    onSuccess: (data) => {
      setCurrentData(data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['enhanced-topics'] });
    },
    onError: (error) => {
      console.error('Enhanced topic decomposition failed:', error);
    }
  });

  // Get autocomplete suggestions mutation
  const getAutocompleteSuggestionsMutation = useMutation({
    mutationFn: async (query: string) => {
      return await serviceUtils.retryWithBackoff(
        () => autocompleteService.getSuggestions(query),
        2,
        500
      );
    },
    onError: (error) => {
      console.error('Autocomplete suggestions failed:', error);
    }
  });

  // Compare methods mutation
  const compareMethodsMutation = useMutation({
    mutationFn: async (request: MethodComparisonRequest) => {
      return await serviceUtils.retryWithBackoff(
        () => enhancedTopicsService.compareMethods(request),
        3,
        1000
      );
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['method-comparison'] });
    },
    onError: (error) => {
      console.error('Method comparison failed:', error);
    }
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        enhancedTopicsService.clearCache(),
        autocompleteService.clearCache()
      ]);
    },
    onSuccess: () => {
      // Invalidate all queries
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Clear cache failed:', error);
    }
  });

  // Memoized methods
  const decomposeTopic = useCallback(async (request: EnhancedTopicDecompositionRequest) => {
    return await decomposeTopicMutation.mutateAsync(request);
  }, [decomposeTopicMutation]);

  const getAutocompleteSuggestions = useCallback(async (query: string) => {
    return await getAutocompleteSuggestionsMutation.mutateAsync(query);
  }, [getAutocompleteSuggestionsMutation]);

  const compareMethods = useCallback(async (request: MethodComparisonRequest) => {
    return await compareMethodsMutation.mutateAsync(request);
  }, [compareMethodsMutation]);

  const clearCache = useCallback(async () => {
    await clearCacheMutation.mutateAsync();
  }, [clearCacheMutation]);

  // Combined loading state
  const isLoading = useMemo(() => {
    return decomposeTopicMutation.isPending ||
           getAutocompleteSuggestionsMutation.isPending ||
           compareMethodsMutation.isPending ||
           clearCacheMutation.isPending;
  }, [
    decomposeTopicMutation.isPending,
    getAutocompleteSuggestionsMutation.isPending,
    compareMethodsMutation.isPending,
    clearCacheMutation.isPending
  ]);

  // Combined error state
  const error = useMemo(() => {
    return decomposeTopicMutation.error ||
           getAutocompleteSuggestionsMutation.error ||
           compareMethodsMutation.error ||
           clearCacheMutation.error;
  }, [
    decomposeTopicMutation.error,
    getAutocompleteSuggestionsMutation.error,
    compareMethodsMutation.error,
    clearCacheMutation.error
  ]);

  return {
    decomposeTopic,
    getAutocompleteSuggestions,
    compareMethods,
    isLoading,
    error: error as Error | null,
    data: currentData,
    clearCache
  };
}

/**
 * Autocomplete Hook
 * Specialized hook for autocomplete functionality
 */
export function useAutocomplete(options: UseAutocompleteOptions = {}): UseAutocompleteReturn {
  const {
    enabled = true,
    debounceMs = 300,
    minQueryLength = 2,
    maxSuggestions = 10
  } = options;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounced get suggestions function
  const debouncedGetSuggestions = useMemo(
    () => debounce(async (query: string) => {
      if (!enabled || query.length < minQueryLength) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await autocompleteService.getSuggestions(query);
        if (response.success) {
          const filteredSuggestions = response.suggestions.slice(0, maxSuggestions);
          setSuggestions(filteredSuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        setSuggestions([]);
        console.error('Autocomplete error:', error);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [enabled, minQueryLength, maxSuggestions, debounceMs]
  );

  const getSuggestions = useCallback(async (query: string) => {
    // Validate query
    const validation = validateQuery(query);
    if (!validation.isValid) {
      setError(new Error(validation.error || 'Invalid query'));
      return;
    }

    await debouncedGetSuggestions(query);
  }, [debouncedGetSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  };
}

/**
 * Enhanced Topic Decomposition Hook
 * Specialized hook for topic decomposition with enhanced features
 */
export function useEnhancedTopicDecomposition() {
  const [selectedSubtopics, setSelectedSubtopics] = useState<EnhancedSubtopic[]>([]);
  const [methodComparison, setMethodComparison] = useState<MethodComparisonResponse | null>(null);
  const [showMethodComparison, setShowMethodComparison] = useState(false);

  const {
    decomposeTopic,
    compareMethods,
    isLoading,
    error,
    data
  } = useEnhancedTopics();

  // Enhanced decompose topic with method comparison
  const decomposeTopicWithComparison = useCallback(async (
    request: EnhancedTopicDecompositionRequest,
    includeComparison: boolean = false
  ) => {
    try {
      // Decompose topic
      const result = await decomposeTopic(request);
      
      if (includeComparison) {
        // Compare methods
        const comparison = await compareMethods({
          search_query: request.search_query,
          user_id: request.user_id,
          max_subtopics: request.max_subtopics
        });
        
        setMethodComparison(comparison);
        setShowMethodComparison(true);
      }

      return result;
    } catch (error) {
      console.error('Enhanced topic decomposition with comparison failed:', error);
      throw error;
    }
  }, [decomposeTopic, compareMethods]);

  // Select subtopic
  const selectSubtopic = useCallback((subtopic: EnhancedSubtopic) => {
    setSelectedSubtopics(prev => {
      if (prev.find(s => s.id === subtopic.id)) {
        return prev; // Already selected
      }
      return [...prev, subtopic];
    });
  }, []);

  // Deselect subtopic
  const deselectSubtopic = useCallback((subtopic: EnhancedSubtopic) => {
    setSelectedSubtopics(prev => prev.filter(s => s.id !== subtopic.id));
  }, []);

  // Toggle subtopic selection
  const toggleSubtopic = useCallback((subtopic: EnhancedSubtopic) => {
    setSelectedSubtopics(prev => {
      if (prev.find(s => s.id === subtopic.id)) {
        return prev.filter(s => s.id !== subtopic.id);
      } else {
        return [...prev, subtopic];
      }
    });
  }, []);

  // Clear selected subtopics
  const clearSelectedSubtopics = useCallback(() => {
    setSelectedSubtopics([]);
  }, []);

  // Get subtopics by source
  const getSubtopicsBySource = useCallback((source: SubtopicSource) => {
    if (!data?.subtopics) return [];
    return data.subtopics.filter(subtopic => subtopic.source === source);
  }, [data?.subtopics]);

  // Get subtopics by relevance score range
  const getSubtopicsByRelevanceRange = useCallback((minScore: number, maxScore: number = 1.0) => {
    if (!data?.subtopics) return [];
    return data.subtopics.filter(subtopic => 
      subtopic.relevance_score >= minScore && subtopic.relevance_score <= maxScore
    );
  }, [data?.subtopics]);

  // Get high relevance subtopics
  const getHighRelevanceSubtopics = useCallback((threshold: number = 0.8) => {
    return getSubtopicsByRelevanceRange(threshold);
  }, [getSubtopicsByRelevanceRange]);

  // Get processing time formatted
  const getFormattedProcessingTime = useCallback(() => {
    if (!data?.processing_time) return '0ms';
    return formatProcessingTime(data.processing_time);
  }, [data?.processing_time]);

  // Get enhancement methods display
  const getEnhancementMethodsDisplay = useCallback(() => {
    if (!data?.enhancement_methods) return 'None';
    return data.enhancement_methods.join(' + ');
  }, [data?.enhancement_methods]);

  // Get autocomplete data summary
  const getAutocompleteDataSummary = useCallback(() => {
    if (!data?.autocomplete_data) return null;
    
    const autocompleteData = data.autocomplete_data;
    return {
      query: autocompleteData.query,
      suggestionsCount: autocompleteData.total_suggestions,
      processingTime: formatProcessingTime(autocompleteData.processing_time),
      success: autocompleteData.success
    };
  }, [data?.autocomplete_data]);

  return {
    // Core functionality
    decomposeTopic: decomposeTopicWithComparison,
    compareMethods,
    isLoading,
    error,
    data,
    
    // Subtopic management
    selectedSubtopics,
    selectSubtopic,
    deselectSubtopic,
    toggleSubtopic,
    clearSelectedSubtopics,
    
    // Filtering and analysis
    getSubtopicsBySource,
    getSubtopicsByRelevanceRange,
    getHighRelevanceSubtopics,
    
    // Display helpers
    getFormattedProcessingTime,
    getEnhancementMethodsDisplay,
    getAutocompleteDataSummary,
    
    // Method comparison
    methodComparison,
    showMethodComparison,
    setShowMethodComparison
  };
}

/**
 * Autocomplete Input Hook
 * Specialized hook for autocomplete input functionality
 */
export function useAutocompleteInput() {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  } = useAutocomplete({
    debounceMs: 300,
    minQueryLength: 2,
    maxSuggestions: 10
  });

  // Handle input change
  const handleInputChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (newValue.trim()) {
      getSuggestions(newValue);
      setIsOpen(true);
    } else {
      clearSuggestions();
      setIsOpen(false);
    }
  }, [getSuggestions, clearSuggestions]);

  // Handle suggestion select
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setValue(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, suggestions, highlightedIndex, handleSuggestionSelect]);

  // Close suggestions when clicking outside
  const handleBlur = useCallback(() => {
    // Delay to allow suggestion click to register
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  return {
    value,
    setValue,
    suggestions,
    isLoading,
    error,
    isOpen,
    highlightedIndex,
    handleInputChange,
    handleSuggestionSelect,
    handleKeyDown,
    handleBlur,
    clearSuggestions
  };
}

export default useEnhancedTopics;
