import { supabase } from '../lib/supabase';

export interface Keyword {
  id: string;
  keyword: string;
  search_volume?: number;
  difficulty?: number;
  cpc?: number;
  topic_id: string;
  user_id: string;
  source: 'llm' | 'ahrefs' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface KeywordGenerationRequest {
  subtopics: string[];
  topicId: string;
  topicTitle: string;
}

export interface KeywordGenerationResponse {
  keywords: string[];
  success: boolean;
  message?: string;
}

class KeywordService {
  /**
   * Load existing keywords for a topic
   */
  async loadExistingKeywords(topicId: string, userId: string): Promise<Keyword[]> {
    try {
      console.log('KeywordService - Loading keywords for topic:', topicId, 'user:', userId);
      
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('topic_id', topicId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('KeywordService - Supabase query result:', { data, error });
      
      // Debug: Check the first few keywords to see their topic_id values
      if (data && data.length > 0) {
        console.log('KeywordService - First 3 keywords topic_ids:', data.slice(0, 3).map(k => ({ keyword: k.keyword, topic_id: k.topic_id })));
        console.log('KeywordService - Searching for topic_id:', topicId);
        console.log('KeywordService - Topic ID type:', typeof topicId);
        
        // Check if any keywords match the topic_id we're searching for
        const matchingKeywords = data.filter(k => k.topic_id === topicId);
        console.log('KeywordService - Keywords matching topic_id:', matchingKeywords.length);
        console.log('KeywordService - All unique topic_ids in database:', [...new Set(data.map(k => k.topic_id))]);
      }

      if (error) {
        console.error('KeywordService - Error loading keywords:', error);
        return [];
      }

      console.log('KeywordService - Returning keywords:', data?.length || 0, 'items');
      return data || [];
    } catch (error) {
      console.error('Failed to load existing keywords:', error);
      return [];
    }
  }

  /**
   * Debug function to check all keywords for a user
   */
  async debugAllKeywords(userId: string): Promise<void> {
    try {
      console.log('=== DEBUG: Checking all keywords for user ===');
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('user_id', userId);

      console.log('All keywords for user:', { data, error });
      if (data) {
        console.log('Total keywords found:', data.length);
        data.forEach((keyword, index) => {
          console.log(`Keyword ${index + 1}:`, {
            id: keyword.id,
            keyword: keyword.keyword,
            topic_id: keyword.topic_id,
            user_id: keyword.user_id,
            source: keyword.source
          });
        });
      }
    } catch (error) {
      console.error('Failed to debug keywords:', error);
    }
  }

  /**
   * Generate keywords using LLM
   */
  async generateKeywordsWithLLM(request: KeywordGenerationRequest): Promise<KeywordGenerationResponse> {
    try {
      // Use the working endpoint from minimal_main.py
      const response = await fetch('http://localhost:8000/api/keywords/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtopics: request.subtopics,
          topic_title: request.topicTitle,
          user_id: 'demo-user' // Use demo user for now
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the response to match the expected interface
      return {
        success: true,
        keywords: data.keywords || [],
        message: `Generated ${data.keywords?.length || 0} keywords`
      };
    } catch (error) {
      console.error('Failed to generate keywords with LLM:', error);
      
      // Return mock keywords as fallback
      const mockKeywords = [];
      for (const subtopic of request.subtopics.slice(0, 5)) {
        mockKeywords.push(
          `${subtopic} guide`,
          `${subtopic} tips`,
          `best ${subtopic}`,
          `${subtopic} tutorial`,
          `how to ${subtopic}`,
          `${subtopic} for beginners`
        );
      }
      
      return {
        success: true,
        keywords: mockKeywords.slice(0, 20),
        message: 'Generated mock keywords (backend unavailable)'
      };
    }
  }

  /**
   * Save keywords to database
   */
  async saveKeywords(keywords: string[], topicId: string, userId: string, source: 'llm' | 'ahrefs' | 'manual' = 'manual'): Promise<Keyword[]> {
    try {
      console.log('Saving keywords to database:', { keywords, topicId, userId, source });
      
      const keywordData = keywords.map(keyword => ({
        keyword: keyword.trim(),
        topic_id: topicId,
        user_id: userId,
        source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      console.log('Keyword data to insert:', keywordData);

      const { data, error } = await supabase
        .from('keywords')
        .insert(keywordData)
        .select();

      if (error) {
        console.error('Error saving keywords:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        // Don't throw error, just log it and return mock data
        console.log('Keywords not saved to database, but will be displayed locally');
        return keywordData.map((kd, index) => ({
          id: `mock-${index}`,
          keyword: kd.keyword,
          topic_id: kd.topic_id,
          user_id: kd.user_id,
          source: kd.source as 'llm' | 'ahrefs' | 'manual',
          created_at: kd.created_at,
          updated_at: kd.updated_at,
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Failed to save keywords:', error);
      // Return mock data instead of throwing
      return keywords.map((keyword, index) => ({
        id: `mock-${index}`,
        keyword: keyword.trim(),
        topic_id: topicId,
        user_id: userId,
        source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
  }

  /**
   * Delete a keyword
   */
  async deleteKeyword(keywordId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', keywordId);

      if (error) {
        console.error('Error deleting keyword:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      throw error;
    }
  }

  /**
   * Update keyword data
   */
  async updateKeyword(keywordId: string, updates: Partial<Keyword>): Promise<Keyword> {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', keywordId)
        .select()
        .single();

      if (error) {
        console.error('Error updating keyword:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update keyword:', error);
      throw error;
    }
  }

  /**
   * Parse Ahrefs keyword data from text
   */
  parseAhrefsKeywords(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Extract keyword from line (assuming format: "keyword, volume, difficulty")
        const parts = line.split(',');
        return parts[0]?.trim() || line.trim();
      })
      .filter(keyword => keyword.length > 0);
  }

  /**
   * Get keyword statistics for a topic
   */
  async getKeywordStats(topicId: string, userId: string): Promise<{
    total: number;
    bySource: Record<string, number>;
    avgVolume: number;
    avgDifficulty: number;
  }> {
    try {
      const keywords = await this.loadExistingKeywords(topicId, userId);
      
      const stats = {
        total: keywords.length,
        bySource: keywords.reduce((acc, keyword) => {
          acc[keyword.source] = (acc[keyword.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        avgVolume: keywords.reduce((sum, k) => sum + (k.search_volume || 0), 0) / keywords.length || 0,
        avgDifficulty: keywords.reduce((sum, k) => sum + (k.difficulty || 0), 0) / keywords.length || 0,
      };

      return stats;
    } catch (error) {
      console.error('Failed to get keyword stats:', error);
      throw error;
    }
  }
}

export const keywordService = new KeywordService();