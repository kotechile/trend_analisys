/**
 * Keyword Research Service
 * 
 * Service for loading keywords by topic and user from the backend API
 */

export interface KeywordData {
  id: string;
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition_value: number;
  intent_type: string;
  priority_score: number;
  related_keywords: string[];
  search_volume_trend: any[];
  topic_id: string;
  user_id: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface KeywordResearchResponse {
  success: boolean;
  keywords: KeywordData[];
  count: number;
  topic_id: string;
  user_id: string;
}

class KeywordResearchService {
  private baseUrl = 'http://localhost:8000/api/v1';

  /**
   * Load keywords for a specific topic and user
   */
  async loadKeywordsByTopic(topicId: string, userId: string): Promise<KeywordData[]> {
    try {
      console.log(`Loading keywords for topic ${topicId} and user ${userId}`);
      
      const response = await fetch(
        `${this.baseUrl}/keyword-research/by-topic/${topicId}?user_id=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load keywords:', response.status, errorText);
        throw new Error(`Failed to load keywords: ${response.status} ${errorText}`);
      }

      const data: KeywordResearchResponse = await response.json();
      
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }

      console.log(`Successfully loaded ${data.count} keywords for topic ${topicId}`);
      return data.keywords;
      
    } catch (error) {
      console.error('Error loading keywords by topic:', error);
      throw error;
    }
  }

  /**
   * Get keywords grouped by intent type
   */
  groupKeywordsByIntent(keywords: KeywordData[]): Record<string, KeywordData[]> {
    return keywords.reduce((groups, keyword) => {
      const intent = keyword.intent_type || 'INFORMATIONAL';
      if (!groups[intent]) {
        groups[intent] = [];
      }
      groups[intent].push(keyword);
      return groups;
    }, {} as Record<string, KeywordData[]>);
  }

  /**
   * Filter keywords by search volume range
   */
  filterBySearchVolume(keywords: KeywordData[], minVolume: number, maxVolume?: number): KeywordData[] {
    return keywords.filter(keyword => {
      const volume = keyword.search_volume || 0;
      if (maxVolume !== undefined) {
        return volume >= minVolume && volume <= maxVolume;
      }
      return volume >= minVolume;
    });
  }

  /**
   * Filter keywords by difficulty range
   */
  filterByDifficulty(keywords: KeywordData[], maxDifficulty: number): KeywordData[] {
    return keywords.filter(keyword => {
      const difficulty = keyword.keyword_difficulty || 0;
      return difficulty <= maxDifficulty;
    });
  }

  /**
   * Sort keywords by priority score (descending)
   */
  sortByPriority(keywords: KeywordData[]): KeywordData[] {
    return [...keywords].sort((a, b) => {
      const scoreA = a.priority_score || 0;
      const scoreB = b.priority_score || 0;
      return scoreB - scoreA;
    });
  }

  /**
   * Sort keywords by search volume (descending)
   */
  sortBySearchVolume(keywords: KeywordData[]): KeywordData[] {
    return [...keywords].sort((a, b) => {
      const volumeA = a.search_volume || 0;
      const volumeB = b.search_volume || 0;
      return volumeB - volumeA;
    });
  }
}

export const keywordResearchService = new KeywordResearchService();
