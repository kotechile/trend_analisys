/**
 * useTrendAnalysis - Custom hook for trend analysis functionality
 * 
 * Provides state management and API integration for trend analysis features
 * powered by DataForSEO APIs.
 */

import { useState, useCallback } from 'react';
import { trendAnalysisAPI } from '../services/dataforseo/trendAnalysisAPI';
import { trendAnalysisService } from '../services/trendAnalysisService';
import { TrendData, SubtopicData } from '../types/dataforseo';

interface TrendAnalysisRequest {
  subtopics: string[];
  location: string;
  timeRange: string;
}

interface TrendComparisonRequest {
  subtopics: string[];
  location: string;
  timeRange: string;
}

interface SuggestionRequest {
  baseSubtopics: string[];
  maxSuggestions: number;
  location: string;
}

interface UseTrendAnalysisReturn {
  trendData: TrendData[] | null;
  suggestions: SubtopicData[] | null;
  loading: boolean;
  error: string | null;
  isFromCache: boolean;
  cacheTimestamp: string | null;
  fetchTrendData: (request: TrendAnalysisRequest) => Promise<void>;
  checkCachedData: (request: TrendAnalysisRequest) => Promise<TrendData[] | null>;
  fetchSuggestions: (request: SuggestionRequest) => Promise<void>;
  compareTrends: (request: TrendComparisonRequest) => Promise<void>;
  clearError: () => void;
}

export const useTrendAnalysis = (): UseTrendAnalysisReturn => {
  const [trendData, setTrendData] = useState<TrendData[] | null>(null);
  const [suggestions, setSuggestions] = useState<SubtopicData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkCachedData = useCallback(async (request: TrendAnalysisRequest): Promise<TrendData[] | null> => {
    console.log('🔍 Checking cached data for:', request);
    setLoading(true);
    setError(null);
    
    try {
      // Check cache for all subtopics at once first
      const cachedData = await trendAnalysisService.checkCachedTrendData(
        request.subtopics,
        request.location,
        request.timeRange
      );
      
      if (cachedData && cachedData.length > 0) {
        console.log('✅ Found cached data for all subtopics:', cachedData.length, 'records');
        setTrendData(cachedData);
        setIsFromCache(true);
        
        // Get cache timestamp
        const timestamp = await trendAnalysisService.getCachedDataTimestamp(
          request.subtopics,
          request.location,
          request.timeRange
        );
        setCacheTimestamp(timestamp);
        
        return cachedData;
      } else {
        console.log('📭 No cached data found for all subtopics, checking individual batches...');
        
        // If no cached data for all subtopics, check individual batches
        const BATCH_SIZE = 5;
        const allCachedData: TrendData[] = [];
        let hasAnyCachedData = false;
        
        for (let i = 0; i < request.subtopics.length; i += BATCH_SIZE) {
          const batch = request.subtopics.slice(i, i + BATCH_SIZE);
          console.log(`🔍 Checking cache for batch: ${batch.join(', ')}`);
          
          try {
            const batchCachedData = await trendAnalysisService.checkCachedTrendData(
              batch,
              request.location,
              request.timeRange
            );
            
            if (batchCachedData && batchCachedData.length > 0) {
              allCachedData.push(...batchCachedData);
              hasAnyCachedData = true;
              console.log(`✅ Found cached data for batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchCachedData.length, 'records');
            }
          } catch (batchError) {
            console.warn(`⚠️ Error checking cache for batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchError);
          }
        }
        
        if (hasAnyCachedData) {
          console.log('✅ Found partial cached data:', allCachedData.length, 'records');
          setTrendData(allCachedData);
          setIsFromCache(true);
          setCacheTimestamp('Multiple batches');
          return allCachedData;
        } else {
          console.log('📭 No cached data found for any batch');
          setIsFromCache(false);
          setCacheTimestamp(null);
          return null;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check cached data';
      console.error('❌ Error checking cached data:', err);
      setError(errorMessage);
      setIsFromCache(false);
      setCacheTimestamp(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendData = useCallback(async (request: TrendAnalysisRequest) => {
    console.log('🔄 fetchTrendData called with request:', request);
    setLoading(true);
    setError(null);
    setIsFromCache(false);
    setCacheTimestamp(null);
    setTrendData([]); // Clear previous trend data immediately
    
    try {
      console.log('🌐 Processing subtopics in batches...');
      
      // Process subtopics in batches of 5 (DataForSEO API limit discovered through testing)
      const BATCH_SIZE = 5;
      const allTrendData: TrendData[] = [];
      
      for (let i = 0; i < request.subtopics.length; i += BATCH_SIZE) {
        const batch = request.subtopics.slice(i, i + BATCH_SIZE);
        console.log(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(request.subtopics.length / BATCH_SIZE)}: ${batch.join(', ')}`);
        
        const batchRequest = {
          ...request,
          subtopics: batch
        };
        
        try {
          const response = await trendAnalysisAPI.getTrendData(batchRequest);
          console.log(`📊 Batch ${Math.floor(i / BATCH_SIZE) + 1} response:`, response);
          console.log(`📊 Batch ${Math.floor(i / BATCH_SIZE) + 1} data length:`, response.data?.length);
          
          if (response.success && response.data && response.data.length > 0) {
            allTrendData.push(...response.data);
            console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} data added, total items: ${allTrendData.length}`);
          } else {
            console.warn(`⚠️ Batch ${Math.floor(i / BATCH_SIZE) + 1} response not successful or empty:`, response);
          }
        } catch (batchError) {
          console.error(`❌ Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchError);
          // Continue with next batch instead of failing completely
        }
        
        // Add a small delay between batches to avoid overwhelming the backend
        if (i + BATCH_SIZE < request.subtopics.length) {
          console.log(`⏳ Waiting 2 seconds before processing next batch...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log('📊 All batches processed, total trend data:', allTrendData);
      console.log('📊 Total trend data length:', allTrendData.length);
      
      if (allTrendData.length > 0) {
        setTrendData(allTrendData);
        console.log('✅ All trend data set successfully, new trendData:', allTrendData);
        
        // Save to cache after successful API call
        try {
          await trendAnalysisService.saveTrendData(allTrendData);
          console.log('💾 All trend data saved to cache');
        } catch (cacheError) {
          console.warn('⚠️ Failed to save to cache:', cacheError);
          // Don't throw error for cache save failure
        }
      } else {
        console.warn('⚠️ No trend data received from any batch');
        setTrendData([]); // Clear any existing trend data
        setError('No trend data available for the selected subtopics. This might be due to API limitations or invalid subtopics.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trend data';
      console.error('❌ Error fetching trend data:', err);
      console.error('❌ Error details:', err);
      setError(errorMessage);
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (request: SuggestionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await trendAnalysisAPI.getSuggestions(request);
      setSuggestions(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setError(errorMessage);
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const compareTrends = useCallback(async (request: TrendComparisonRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await trendAnalysisAPI.compareTrends(request);
      setTrendData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compare trends';
      setError(errorMessage);
      console.error('Error comparing trends:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trendData,
    suggestions,
    loading,
    error,
    isFromCache,
    cacheTimestamp,
    fetchTrendData,
    checkCachedData,
    fetchSuggestions,
    compareTrends,
    clearError
  };
};
