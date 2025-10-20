/**
 * Trend Analysis Service using Supabase SDK directly
 * This service handles caching and retrieval of trend analysis data
 */

import { supabase } from '../lib/supabase';
import { TrendData } from '../types/dataforseo';

interface CachedTrendData {
  id: string;
  subtopic: string;
  location: string;
  time_range: string;
  average_interest: number;
  peak_interest: number;
  timeline_data: any[];
  related_queries: string[];
  demographic_data?: any;
  created_at: string;
  updated_at: string;
}

class TrendAnalysisService {
  private tableName = 'trend_analysis_data';

  /**
   * Check for cached trend data in Supabase
   */
  async checkCachedTrendData(
    subtopics: string[], 
    location: string, 
    timeRange: string
  ): Promise<TrendData[] | null> {
    try {
      console.log('🔍 Checking cached trend data for:', { subtopics, location, timeRange });
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .in('subtopic', subtopics)
        .eq('location', location)
        .eq('time_range', timeRange)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error checking cached data:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('📭 No cached data found');
        return null;
      }

      console.log('✅ Found cached data:', data.length, 'records');
      
      // Convert cached data to TrendData format
      const trendData: TrendData[] = data.map((item: CachedTrendData) => ({
        keyword: item.subtopic,
        location: item.location,
        time_series: item.timeline_data || [],
        related_queries: item.related_queries || [],
        demographics: item.demographic_data,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return trendData;
    } catch (error) {
      console.error('❌ Error in checkCachedTrendData:', error);
      return null;
    }
  }

  /**
   * Save trend data to Supabase cache
   */
  async saveTrendData(trendData: TrendData[]): Promise<void> {
    try {
      console.log('💾 Saving trend data to cache:', trendData.length, 'records');
      
      // Convert TrendData to database format
      const dataToSave = trendData.map((trend) => ({
        subtopic: trend.keyword,
        location: trend.location,
        time_range: '12m', // Default time range
        average_interest: trend.time_series ? trend.time_series.reduce((sum, point) => sum + point.value, 0) / trend.time_series.length : 0,
        peak_interest: trend.time_series ? Math.max(...trend.time_series.map(point => point.value)) : 0,
        timeline_data: trend.time_series || [],
        related_queries: trend.related_queries || [],
        demographic_data: trend.demographics || null
      }));

      const { error } = await supabase
        .from(this.tableName)
        .upsert(dataToSave);

      if (error) {
        console.error('❌ Error saving trend data:', error);
        throw new Error(`Failed to save trend data: ${error.message}`);
      }

      console.log('✅ Trend data saved successfully');
    } catch (error) {
      console.error('❌ Error in saveTrendData:', error);
      throw error;
    }
  }

  /**
   * Get the most recent cached data timestamp for a set of subtopics
   */
  async getCachedDataTimestamp(
    subtopics: string[], 
    location: string, 
    timeRange: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('updated_at')
        .in('subtopic', subtopics)
        .eq('location', location)
        .eq('time_range', timeRange)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0].updated_at;
    } catch (error) {
      console.error('❌ Error getting cached data timestamp:', error);
      return null;
    }
  }

  /**
   * Clear cached data for specific subtopics
   */
  async clearCachedData(
    subtopics: string[], 
    location: string, 
    timeRange: string
  ): Promise<void> {
    try {
      console.log('🗑️ Clearing cached data for:', { subtopics, location, timeRange });
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in('subtopic', subtopics)
        .eq('location', location)
        .eq('time_range', timeRange);

      if (error) {
        console.error('❌ Error clearing cached data:', error);
        throw new Error(`Failed to clear cached data: ${error.message}`);
      }

      console.log('✅ Cached data cleared successfully');
    } catch (error) {
      console.error('❌ Error in clearCachedData:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const trendAnalysisService = new TrendAnalysisService();
export default trendAnalysisService;
