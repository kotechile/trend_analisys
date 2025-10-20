import { supabase } from '../lib/supabase';

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  content_type: 'blog' | 'software';
  category: string;
  subtopic: string;
  topic_id: string;
  user_id: string;
  keywords: string[];
  seo_score?: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  estimated_read_time?: number;
  target_audience: string;
  content_angle: string;
  monetization_potential: 'low' | 'medium' | 'high';
  technical_complexity?: 'low' | 'medium' | 'high';
  development_effort?: 'low' | 'medium' | 'high';
  market_demand?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  
  // Status and workflow fields
  status?: 'draft' | 'in_progress' | 'completed' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  workflow_status?: string;
  
  // Publishing tracking
  published?: boolean;
  published_at?: string;
  published_to_titles?: boolean;
  titles_record_id?: string;
  
  // Quality scores
  overall_quality_score?: number;
  seo_optimization_score?: number;
  traffic_potential_score?: number;
  viral_potential_score?: number;
  competition_score?: number;
  
  // Content structure
  content_outline?: any[];
  key_points?: any[];
  
  // Enhanced keywords
  primary_keywords?: string[];
  secondary_keywords?: string[];
  enhanced_keywords?: string[];
  keyword_research_data?: any;
  keyword_research_enhanced?: boolean;
  
  // Affiliate and monetization
  affiliate_opportunities?: any;
  monetization_score?: number;
  estimated_annual_revenue?: number;
  monetization_priority?: string;
  
  // Generation metadata
  generation_method?: string;
  generation_prompt?: string;
  generation_parameters?: any;
  enhancement_timestamp?: string;
  
  // Content metrics
  estimated_word_count?: number;
  estimated_reading_time?: number;
  
  // Workflow flags
  content_generated?: boolean;
  content_brief_generated?: boolean;
}

export interface ContentIdeaGenerationRequest {
  topic_id: string;
  topic_title: string;
  subtopics: string[];
  keywords: KeywordData[];  // Changed to accept rich keyword data
  user_id: string;
  content_types?: ('blog' | 'software')[];
}

export interface OptimizedContentIdeaGenerationRequest {
  topic_id: string;
  topic_title: string;
  subtopics?: string[];
  user_id: string;
  content_types?: ('blog' | 'software')[];
  max_keywords?: number;
}

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

export interface ContentIdeaGenerationResponse {
  success: boolean;
  message: string;
  total_ideas: number;
  blog_ideas: number;
  software_ideas: number;
  ideas: ContentIdea[];
}

class ContentIdeasService {
  /**
   * Check if the backend is ready
   */
  private async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8000/docs', { method: 'GET' });
      return response.ok;
    } catch (error) {
      console.log('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Generate content ideas based on subtopics and keywords
   */
  async generateContentIdeas(request: ContentIdeaGenerationRequest): Promise<ContentIdeaGenerationResponse> {
    // Check if backend is ready first
    const isBackendReady = await this.checkBackendHealth();
    if (!isBackendReady) {
      console.log('⚠️ Backend not ready, waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use the working endpoint from minimal_main.py
        const requestBody = {
          topic_id: request.topic_id,
          topic_title: request.topic_title,
          subtopics: request.subtopics,
          keywords: request.keywords || [], // Include keywords field
          user_id: request.user_id,
          content_types: request.content_types || ['blog', 'software']
        };
        
        console.log(`🔍 Frontend sending request (attempt ${attempt}/${maxRetries}):`, JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('http://localhost:8000/api/content-ideas/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Backend error response (attempt ${attempt}):`, errorText);
          
          // If it's a 404 and we have retries left, wait and try again
          if (response.status === 404 && attempt < maxRetries) {
            console.log(`⏳ Waiting 1 second before retry ${attempt + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            lastError = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            continue;
          }
          
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        // Transform the response to match the expected interface
        return {
          success: result.success || true,
          message: `Generated ${result.total_ideas} content ideas`,
          total_ideas: result.total_ideas || 0,
          blog_ideas: result.blog_ideas || 0,
          software_ideas: result.software_ideas || 0,
          ideas: result.ideas || []
        };
      } catch (error) {
        console.error(`Failed to generate content ideas (attempt ${attempt}):`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If this is not the last attempt, wait and try again
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting 1 second before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Failed to generate content ideas after all retries');
  }

  /**
   * Generate content ideas using optimized backend endpoint
   * This method doesn't send keyword data from frontend - backend queries database directly
   */
  async generateContentIdeasOptimized(request: OptimizedContentIdeaGenerationRequest): Promise<ContentIdeaGenerationResponse> {
    // Check if backend is ready first
    const isBackendReady = await this.checkBackendHealth();
    if (!isBackendReady) {
      console.log('⚠️ Backend not ready, waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const requestBody = {
          topic_id: request.topic_id,
          topic_title: request.topic_title,
          subtopics: request.subtopics || [],
          user_id: request.user_id,
          content_types: request.content_types || ['blog', 'software'],
          max_keywords: request.max_keywords || 50
        };
        
        console.log(`🔍 Frontend sending optimized request (attempt ${attempt}/${maxRetries}):`, JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('http://localhost:8000/api/content-ideas/generate-optimized', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Backend error response (attempt ${attempt}):`, errorText);
          
          // If it's a 404 and we have retries left, wait and try again
          if (response.status === 404 && attempt < maxRetries) {
            console.log(`⏳ Waiting 1 second before retry ${attempt + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            lastError = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            continue;
          }
          
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        // Transform the response to match the expected interface
        return {
          success: result.success || true,
          message: `Generated ${result.total_ideas} content ideas using ${result.keywords_used} keywords`,
          total_ideas: result.total_ideas || 0,
          blog_ideas: result.blog_ideas || 0,
          software_ideas: result.software_ideas || 0,
          ideas: result.ideas || []
        };
      } catch (error) {
        console.error(`Failed to generate content ideas (optimized attempt ${attempt}):`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If this is not the last attempt, wait and try again
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting 1 second before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Failed to generate content ideas after all retries');
  }

  /**
   * Get content ideas for a topic
   */
  async getContentIdeas(
    topicId: string,
    userId: string,
    contentType?: 'blog' | 'software'
  ): Promise<ContentIdea[]> {
    try {
      console.log('ContentIdeasService - Getting content ideas:', {
        topicId,
        userId,
        contentType
      });
      
      const response = await fetch('http://localhost:8000/api/content-ideas/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: topicId,
          user_id: userId,
          content_type: contentType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Content ideas from backend API:', data.ideas?.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        published: idea.published,
        published_at: idea.published_at,
        published_to_titles: idea.published_to_titles,
        status: idea.status
      })));
      return data.ideas || [];
    } catch (error) {
      console.error('Failed to get content ideas:', error);
      // Fallback to Supabase direct query
      return this.getContentIdeasFromSupabase(topicId, userId, contentType);
    }
  }

  /**
   * Fallback method to get content ideas directly from Supabase
   */
  private async getContentIdeasFromSupabase(
    topicId: string,
    userId: string,
    contentType?: 'blog' | 'software'
  ): Promise<ContentIdea[]> {
    try {
      let query = supabase
        .from('content_ideas')
        .select('*')
        .eq('topic_id', topicId)
        .eq('user_id', userId);

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        return [];
      }

      console.log('Content ideas from Supabase fallback:', data?.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        published: idea.published,
        published_at: idea.published_at,
        published_to_titles: idea.published_to_titles,
        status: idea.status
      })));
      return data || [];
    } catch (error) {
      console.error('Failed to get content ideas from Supabase:', error);
      return [];
    }
  }

  /**
   * Delete a content idea
   */
  async deleteContentIdea(ideaId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:8000/api/content-ideas/${ideaId}?user_id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete content idea:', error);
      return false;
    }
  }

  /**
   * Delete all content ideas for a topic
   */
  async deleteAllContentIdeasForTopic(topicId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:8000/api/content-ideas/topic/${topicId}?user_id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to delete all content ideas for topic:', error);
      return false;
    }
  }

  /**
   * Get content ideas grouped by type
   */
  async getContentIdeasGrouped(
    topicId: string,
    userId: string
  ): Promise<{ blog: ContentIdea[]; software: ContentIdea[] }> {
    try {
      const allIdeas = await this.getContentIdeas(topicId, userId);
      
      return {
        blog: allIdeas.filter(idea => idea.content_type === 'blog'),
        software: allIdeas.filter(idea => idea.content_type === 'software'),
      };
    } catch (error) {
      console.error('Failed to get grouped content ideas:', error);
      return { blog: [], software: [] };
    }
  }

  /**
   * Get content ideas by subtopic
   */
  async getContentIdeasBySubtopic(
    topicId: string,
    userId: string,
    subtopic: string
  ): Promise<ContentIdea[]> {
    try {
      const allIdeas = await this.getContentIdeas(topicId, userId);
      return allIdeas.filter(idea => idea.subtopic === subtopic);
    } catch (error) {
      console.error('Failed to get content ideas by subtopic:', error);
      return [];
    }
  }
}

export const contentIdeasService = new ContentIdeasService();
