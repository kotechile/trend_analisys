/**
 * Research Topics Service using Supabase SDK directly
 * This service bypasses the backend API and connects directly to Supabase
 */

import { supabase } from '../lib/supabase';
import {
  ResearchTopic,
  ResearchTopicCreate,
  ResearchTopicUpdate,
  ResearchTopicListResponse,
  ResearchTopicComplete,
  ResearchTopicStats,
  ResearchTopicStatus,
  ResearchTopicListParams,
  ResearchTopicSearchParams
} from '../types/researchTopics';

class SupabaseResearchTopicsService {
  private tableName = 'research_topics';
  private cachedUserId: string | null = null;

  // Helper method to map research_topics to ResearchTopic format
  private mapResearchTopicToResearchTopic(researchTopic: any): ResearchTopic {
    // Map research topic status
    const mapStatus = (status: string): ResearchTopicStatus => {
      switch (status) {
        case 'active':
          return ResearchTopicStatus.ACTIVE;
        case 'completed':
          return ResearchTopicStatus.COMPLETED;
        case 'archived':
          return ResearchTopicStatus.ARCHIVED;
        default:
          return ResearchTopicStatus.ACTIVE;
      }
    };

    return {
      id: researchTopic.id,
      title: researchTopic.title,
      description: researchTopic.description || `Research topic: ${researchTopic.title}`,
      status: mapStatus(researchTopic.status),
      version: researchTopic.version || 1,
      created_at: researchTopic.created_at,
      updated_at: researchTopic.updated_at,
      user_id: researchTopic.user_id
    };
  }

  // Helper method to map ResearchTopic status back to research_topics status
  private mapResearchTopicStatusToResearchTopicStatus(status: ResearchTopicStatus): string {
    switch (status) {
      case 'active':
        return 'active';
      case 'completed':
        return 'completed';
      case 'archived':
        return 'archived';
      default:
        return 'active';
    }
  }

  // Research Topics CRUD operations
  async createResearchTopic(data: ResearchTopicCreate): Promise<ResearchTopic> {
    // Get user ID from Supabase auth
    const currentUserId = await this.getCurrentUserId();
    console.log('createResearchTopic - currentUserId:', currentUserId);
    console.log('createResearchTopic - data:', data);
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([{
        title: data.title,
        description: data.description,
        status: this.mapResearchTopicStatusToResearchTopicStatus(data.status || ResearchTopicStatus.ACTIVE),
        user_id: currentUserId,
        version: 1
      }])
      .select()
      .single();

    if (error) {
      console.error('createResearchTopic - Supabase error:', error);
      throw new Error(`Failed to create research topic: ${error.message}`);
    }

    console.log('createResearchTopic - success, result:', result);
    // Map the result back to ResearchTopic format
    return this.mapResearchTopicToResearchTopic(result);
  }

  // Helper method to get current user ID from Supabase auth
  private async getCurrentUserId(): Promise<string> {
    // Return cached user ID if available
    if (this.cachedUserId) {
      return this.cachedUserId;
    }

    // Get user from Supabase auth
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Supabase auth response:', { user, error });
      console.log('User ID length:', user?.id?.length);
      console.log('User ID type:', typeof user?.id);
      
      if (!error && user?.id) {
        // Check if the user ID is truncated (less than 36 characters)
        if (user.id.length < 36) {
          console.warn('User ID appears to be truncated:', user.id);
          console.warn('User ID length:', user.id.length);
          console.warn('Expected UUID length: 36');
          
          // Try to find the full user ID in the database
          const { data: existingUsers } = await supabase
            .from('users')
            .select('id')
            .ilike('id', `%${user.id}%`)
            .limit(1);
          
          if (existingUsers && existingUsers.length > 0) {
            const fullUserId = existingUsers[0].id;
            console.log('Found full user ID in database:', fullUserId);
            this.cachedUserId = fullUserId;
            return fullUserId;
          }
        }
        
        this.cachedUserId = user.id;
        console.log('Using user ID from Supabase auth:', user.id);
        console.log('Full user object:', user);
        return user.id;
      } else {
        console.error('No authenticated user found:', error);
        throw new Error('No authenticated user found. Please log in.');
      }
    } catch (error) {
      console.error('Could not get user from Supabase auth:', error);
      throw new Error('Authentication required. Please log in.');
    }
  }

  async getResearchTopic(id: string): Promise<ResearchTopic> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get research topic: ${error.message}`);
    }

    return this.mapResearchTopicToResearchTopic(data);
  }

  async updateResearchTopic(id: string, data: ResearchTopicUpdate): Promise<ResearchTopic> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update({
        title: data.title,
        description: data.description,
        status: this.mapResearchTopicStatusToResearchTopicStatus(data.status || ResearchTopicStatus.ACTIVE),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update research topic: ${error.message}`);
    }

    return this.mapAffiliateResearchToResearchTopic(result);
  }

  async deleteResearchTopic(id: string): Promise<void> {
    // Get current user ID
    const currentUserId = await this.getCurrentUserId();
    
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', currentUserId); // Ensure user can only delete their own topics

    if (error) {
      throw new Error(`Failed to delete research topic: ${error.message}`);
    }
  }

  async listResearchTopics(params?: ResearchTopicListParams): Promise<ResearchTopicListResponse> {
    // Get current user ID
    const currentUserId = await this.getCurrentUserId();
    console.log('listResearchTopics - currentUserId:', currentUserId);
    console.log('listResearchTopics - cachedUserId:', this.cachedUserId);
    
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', currentUserId); // Filter by user ID

    // Apply filters
    if (params?.status) {
      query = query.eq('status', params.status);
    }

    // Apply sorting
    const orderBy = params?.order_by || 'created_at';
    const orderDirection = params?.order_direction || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Apply pagination
    const page = params?.page || 1;
    const size = params?.size || 10;
    const from = (page - 1) * size;
    const to = from + size - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    console.log('listResearchTopics - query result:', { data, error, count });

    if (error) {
      // If table doesn't exist, return empty result instead of throwing error
      if (error.message.includes('relation "research_topics" does not exist') || 
          error.message.includes('404') ||
          error.message.includes('Not Found')) {
        console.warn('Research topics table does not exist. Please check your database setup.');
        return {
          items: [],
          total: 0,
          page: page,
          size: size,
          has_next: false,
          has_prev: false
        };
      }
      throw new Error(`Failed to list research topics: ${error.message}`);
    }

    return {
      items: (data || []).map((item: any) => this.mapResearchTopicToResearchTopic(item)),
      total: count || 0,
      page: page,
      size: size,
      has_next: (count || 0) > page * size,
      has_prev: page > 1
    };
  }

  async searchResearchTopics(params: ResearchTopicSearchParams): Promise<ResearchTopicListResponse> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .or(`search_term.ilike.%${params.query}%,niche.ilike.%${params.query}%`);

    // Apply pagination
    const page = params.page || 1;
    const size = params.size || 10;
    const from = (page - 1) * size;
    const to = from + size - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to search research topics: ${error.message}`);
    }

    return {
      items: (data || []).map((item: any) => this.mapResearchTopicToResearchTopic(item)),
      total: count || 0,
      page: page,
      size: size,
      has_next: (count || 0) > page * size,
      has_prev: page > 1
    };
  }

  async getResearchTopicStats(id: string): Promise<ResearchTopicStats> {
    // Get basic stats for a research topic
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get research topic stats: ${error.message}`);
    }

    // For now, return basic stats
    // In a real implementation, you would join with related tables
    return {
      total_topics: 1,
      active_topics: data.status === 'active' ? 1 : 0,
      completed_topics: data.status === 'completed' ? 1 : 0,
      archived_topics: data.status === 'archived' ? 1 : 0,
      total_subtopics: 0,
      total_analyses: 0,
      total_content_ideas: 0
    };
  }

  async getOverviewStats(): Promise<ResearchTopicStats> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('status', { count: 'exact' });

    if (error) {
      throw new Error(`Failed to get overview stats: ${error.message}`);
    }

    const stats = {
      total_topics: data?.length || 0,
      active_topics: data?.filter((t: any) => t.status === 'active').length || 0,
      completed_topics: data?.filter((t: any) => t.status === 'completed').length || 0,
      archived_topics: data?.filter((t: any) => t.status === 'archived').length || 0,
      total_subtopics: 0,
      total_analyses: 0,
      total_content_ideas: 0
    };

    return stats;
  }

  async getCompleteDataflow(id: string): Promise<ResearchTopicComplete> {
    // Get the research topic
    const { data: topic, error: topicError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (topicError) {
      throw new Error(`Failed to get research topic: ${topicError.message}`);
    }

    // Get subtopics from topic_decompositions table
    const { data: decompositions, error: decompError } = await supabase
      .from('topic_decompositions')
      .select('subtopics')
      .eq('research_topic_id', id)
      .order('created_at', { ascending: false })
      .limit(1);

    let subtopics: any[] = [];
    if (!decompError && decompositions && decompositions.length > 0) {
      // Convert subtopics array to the expected format
      subtopics = decompositions[0].subtopics.map((subtopic: string, index: number) => ({
        id: `subtopic-${index}`,
        name: subtopic,
        description: `Subtopic: ${subtopic}`
      }));
    }

    // Get trend analyses (placeholder for now)
    const trend_analyses: any[] = [];

    // Get content ideas (placeholder for now)
    const content_ideas: any[] = [];

    return {
      ...topic,
      subtopics,
      trend_analyses,
      content_ideas
    };
  }

  async archiveResearchTopic(id: string): Promise<ResearchTopic> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ 
        status: 'cancelled', // Map archived to cancelled
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to archive research topic: ${error.message}`);
    }

    return this.mapResearchTopicToResearchTopic(data);
  }

  async restoreResearchTopic(id: string): Promise<ResearchTopic> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ 
        status: 'pending', // Map active to pending
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to restore research topic: ${error.message}`);
    }

    return this.mapResearchTopicToResearchTopic(data);
  }
}

// Export singleton instance
export const supabaseResearchTopicsService = new SupabaseResearchTopicsService();
export default supabaseResearchTopicsService;
