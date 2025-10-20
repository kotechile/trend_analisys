/**
 * useKeywordResearch - Custom hook for keyword research functionality
 * 
 * Provides state management and API integration for keyword research features
 * powered by DataForSEO APIs.
 */

import { useState, useCallback } from 'react';
import { keywordResearchAPI } from '../services/dataforseo/keywordResearchAPI';
import { KeywordData } from '../types/dataforseo';

interface KeywordResearchRequest {
  seedKeywords: string[];
  maxDifficulty: number;
  minVolume: number;
  intentTypes: string[];
  maxResults: number;
}

interface KeywordPrioritizationRequest {
  keywords: KeywordData[];
  priorityFactors: {
    cpcWeight: number;
    volumeWeight: number;
    trendWeight: number;
  };
}

interface UseKeywordResearchReturn {
  keywords: KeywordData[] | null;
  prioritizedKeywords: KeywordData[] | null;
  loading: boolean;
  error: string | null;
  fetchKeywords: (request: KeywordResearchRequest) => Promise<void>;
  prioritizeKeywords: (request: KeywordPrioritizationRequest) => Promise<void>;
  clearError: () => void;
}

export const useKeywordResearch = (): UseKeywordResearchReturn => {
  const [keywords, setKeywords] = useState<KeywordData[] | null>(null);
  const [prioritizedKeywords, setPrioritizedKeywords] = useState<KeywordData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchKeywords = useCallback(async (request: KeywordResearchRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await keywordResearchAPI.getKeywords(request);
      setKeywords(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch keywords';
      setError(errorMessage);
      console.error('Error fetching keywords:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const prioritizeKeywords = useCallback(async (request: KeywordPrioritizationRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await keywordResearchAPI.prioritizeKeywords(request);
      setPrioritizedKeywords(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to prioritize keywords';
      setError(errorMessage);
      console.error('Error prioritizing keywords:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    keywords,
    prioritizedKeywords,
    loading,
    error,
    fetchKeywords,
    prioritizeKeywords,
    clearError
  };
};
