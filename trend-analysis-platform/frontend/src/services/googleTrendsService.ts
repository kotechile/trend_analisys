import { supabase } from './supabaseClient';

export interface TrendData {
  id: string;
  keyword: string;
  topic_id: string;
  user_id: string;
  trend_data: {
    interest_over_time: Array<{
      time: string;
      value: number;
    }>;
    related_queries: Array<{
      query: string;
      value: number;
      relatedness: number;
    }>;
    related_topics: Array<{
      topic: string;
      value: number;
      relatedness: number;
    }>;
  };
  search_volume?: number;
  competition_level?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface TrendAnalysisResult {
  keyword: string;
  trend_score: number;
  search_volume: number;
  competition: 'low' | 'medium' | 'high';
  peak_periods: string[];
  related_keywords: string[];
  insights: string[];
}

class GoogleTrendsService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  /**
   * Analyze trends for a specific keyword/subtopic
   */
  async analyzeTrends(
    keyword: string,
    topicId: string,
    userId: string,
    timeRange: string = '12m'
  ): Promise<TrendAnalysisResult> {
    try {
      console.log('Analyzing trends for keyword:', keyword, 'topic:', topicId);
      
      // Check if we have cached data first
      const cachedData = await this.getCachedTrendData(keyword, topicId, userId);
      if (cachedData && this.isDataRecent(cachedData.created_at)) {
        console.log('Using cached trend data for:', keyword);
        return this.processTrendData(cachedData);
      }

      // For now, use fallback data since backend API is not implemented
      console.log('Using fallback trend data for:', keyword);
      const fallbackData = this.generateFallbackTrendData(keyword);
      
      // Store the fallback result in cache
      await this.storeTrendData(keyword, topicId, userId, fallbackData);

      return fallbackData;

      // TODO: Implement actual Google Trends API integration
      // The following code will be used when the backend API is ready:
      /*
      const response = await fetch(`${this.baseUrl}/api/trends/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          topic_id: topicId,
          user_id: userId,
          time_range: timeRange,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Trend analysis response:', data);

      // Store the result in cache
      await this.storeTrendData(keyword, topicId, userId, data);

      return this.processTrendData(data);
      */
    } catch (error) {
      console.error('Trend analysis failed:', error);
      // Return fallback data
      return this.generateFallbackTrendData(keyword);
    }
  }

  /**
   * Analyze trends for multiple keywords/subtopics
   */
  async analyzeMultipleTrends(
    keywords: string[],
    topicId: string,
    userId: string,
    timeRange: string = '12m'
  ): Promise<{ [keyword: string]: TrendAnalysisResult }> {
    const results: { [keyword: string]: TrendAnalysisResult } = {};
    
    // Process keywords in parallel with rate limiting
    const batchSize = 3;
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      const batchPromises = batch.map(keyword => 
        this.analyzeTrends(keyword, topicId, userId, timeRange)
          .then(result => ({ keyword, result }))
          .catch(error => {
            console.error(`Failed to analyze trends for ${keyword}:`, error);
            return { keyword, result: this.generateFallbackTrendData(keyword) };
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ keyword, result }) => {
        results[keyword] = result;
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Get cached trend data
   */
  private async getCachedTrendData(
    keyword: string,
    topicId: string,
    userId: string
  ): Promise<TrendData | null> {
    try {
      const { data, error } = await supabase
        .from('trend_analysis')
        .select('*')
        .eq('keyword', keyword)
        .eq('topic_id', topicId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('No cached data found for:', keyword);
        return null;
      }

      return data;
    } catch (error) {
      console.log('Error fetching cached data:', error);
      return null;
    }
  }

  /**
   * Store trend data in cache
   */
  private async storeTrendData(
    keyword: string,
    topicId: string,
    userId: string,
    trendData: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('trend_analysis')
        .insert({
          keyword,
          topic_id: topicId,
          user_id: userId,
          trend_data: trendData,
          search_volume: trendData.search_volume || 0,
          competition_level: trendData.competition_level || 'medium',
        });

      if (error) {
        console.log('Failed to store trend data:', error);
      } else {
        console.log('Trend data stored successfully for:', keyword);
      }
    } catch (error) {
      console.log('Error storing trend data:', error);
    }
  }

  /**
   * Check if data is recent (less than 24 hours old)
   */
  private isDataRecent(createdAt: string): boolean {
    const dataAge = Date.now() - new Date(createdAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return dataAge < twentyFourHours;
  }

  /**
   * Process raw trend data into analysis result
   */
  private processTrendData(data: TrendData | TrendAnalysisResult): TrendAnalysisResult {
    // If it's already a TrendAnalysisResult (from fallback), return it directly
    if ('trend_score' in data && 'search_volume' in data) {
      return data as TrendAnalysisResult;
    }
    
    // Otherwise, process the raw TrendData
    const trendData = (data as TrendData).trend_data;
    
    // Calculate trend score based on recent interest
    const recentData = trendData.interest_over_time.slice(-12); // Last 12 data points
    const avgInterest = recentData.reduce((sum, point) => sum + point.value, 0) / recentData.length;
    const trendScore = Math.min(100, Math.max(0, avgInterest));

    // Find peak periods
    const sortedData = [...recentData].sort((a, b) => b.value - a.value);
    const peakPeriods = sortedData.slice(0, 3).map(point => point.time);

    // Extract related keywords
    const relatedKeywords = trendData.related_queries
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(item => item.query);

    // Generate insights
    const insights = this.generateInsights(trendData, trendScore);

    return {
      keyword: (data as TrendData).keyword,
      trend_score: Math.round(trendScore),
      search_volume: (data as TrendData).search_volume || 0,
      competition: (data as TrendData).competition_level || 'medium',
      peak_periods: peakPeriods,
      related_keywords: relatedKeywords,
      insights,
    };
  }

  /**
   * Generate insights from trend data
   */
  private generateInsights(trendData: any, trendScore: number): string[] {
    const insights: string[] = [];
    
    if (trendScore > 70) {
      insights.push('High trending potential - consider prioritizing this topic');
    } else if (trendScore > 40) {
      insights.push('Moderate trending potential - good for content strategy');
    } else {
      insights.push('Lower trending potential - may need more niche approach');
    }

    if (trendData.related_queries.length > 0) {
      insights.push(`Strong related query ecosystem (${trendData.related_queries.length} related terms)`);
    }

    if (trendData.related_topics.length > 0) {
      insights.push(`Connected to ${trendData.related_topics.length} trending topics`);
    }

    return insights;
  }

  /**
   * Generate fallback data when API fails
   */
  private generateFallbackTrendData(keyword: string): TrendAnalysisResult {
    // Generate more realistic data based on keyword characteristics
    const keywordLower = keyword.toLowerCase();
    let baseScore = 30; // Default moderate score
    
    // Adjust score based on keyword characteristics
    if (keywordLower.includes('trend') || keywordLower.includes('2024') || keywordLower.includes('new')) {
      baseScore += 25; // Higher for trend-related keywords
    }
    if (keywordLower.includes('beginner') || keywordLower.includes('guide') || keywordLower.includes('how to')) {
      baseScore += 15; // Higher for educational content
    }
    if (keywordLower.includes('advanced') || keywordLower.includes('professional')) {
      baseScore += 10; // Moderate for advanced topics
    }
    
    // Add some randomness but keep it realistic
    const trendScore = Math.min(95, Math.max(15, baseScore + (Math.random() * 20 - 10)));
    
    // Generate search volume based on keyword length and complexity
    const searchVolume = keyword.length < 10 ? 
      Math.floor(Math.random() * 50000) + 10000 : // Shorter keywords = higher volume
      Math.floor(Math.random() * 20000) + 2000;   // Longer keywords = lower volume
    
    // Determine competition based on keyword characteristics
    let competition: 'low' | 'medium' | 'high' = 'medium';
    if (keywordLower.includes('niche') || keywordLower.includes('specific') || keyword.length > 15) {
      competition = 'low';
    } else if (keywordLower.includes('best') || keywordLower.includes('top') || keyword.length < 8) {
      competition = 'high';
    }
    
    // Generate realistic peak periods
    const currentYear = new Date().getFullYear();
    const peakPeriods = [
      `${currentYear}-01`,
      `${currentYear}-03`,
      `${currentYear}-06`
    ];
    
    // Generate related keywords based on the main keyword
    const relatedKeywords = [
      `${keyword} guide`,
      `${keyword} tips`,
      `${keyword} ${currentYear}`,
      `best ${keyword}`,
      `${keyword} for beginners`
    ].slice(0, 5);
    
    return {
      keyword,
      trend_score: Math.round(trendScore),
      search_volume: searchVolume,
      competition,
      peak_periods: peakPeriods,
      related_keywords: relatedKeywords,
      insights: [
        '📊 Demo trend data - Backend API not yet implemented',
        '🔍 Use this as a starting point for manual research',
        '💡 Consider implementing Google Trends API integration',
        `📈 Estimated ${Math.round(trendScore)}% trending potential for "${keyword}"`
      ],
    };
  }

  /**
   * Get trend comparison between multiple keywords
   */
  async compareTrends(
    keywords: string[],
    topicId: string,
    userId: string
  ): Promise<{
    comparison: Array<{
      keyword: string;
      trend_score: number;
      search_volume: number;
      rank: number;
    }>;
    insights: string[];
  }> {
    const results = await this.analyzeMultipleTrends(keywords, topicId, userId);
    
    const comparison = Object.entries(results)
      .map(([keyword, data]) => ({
        keyword,
        trend_score: data.trend_score,
        search_volume: data.search_volume,
        rank: 0, // Will be set after sorting
      }))
      .sort((a, b) => b.trend_score - a.trend_score)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const insights = this.generateComparisonInsights(comparison);

    return { comparison, insights };
  }

  /**
   * Generate insights for trend comparison
   */
  private generateComparisonInsights(comparison: any[]): string[] {
    const insights: string[] = [];
    
    if (comparison.length > 0) {
      const topKeyword = comparison[0];
      insights.push(`"${topKeyword.keyword}" is your highest trending subtopic (${topKeyword.trend_score}% trend score)`);
      
      if (comparison.length > 1) {
        const avgScore = comparison.reduce((sum, item) => sum + item.trend_score, 0) / comparison.length;
        insights.push(`Average trend score across all subtopics: ${Math.round(avgScore)}%`);
        
        const highTrending = comparison.filter(item => item.trend_score > 60).length;
        if (highTrending > 0) {
          insights.push(`${highTrending} subtopic(s) showing high trending potential (>60%)`);
        }
      }
    }

    return insights;
  }
}

export const googleTrendsService = new GoogleTrendsService();
