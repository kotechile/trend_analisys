/**
 * Titles Publish Service
 * 
 * Service for publishing selected ideas from Idea Burst to the Titles table
 * Handles the conversion of ContentIdea objects to Title records
 */

import { supabase } from '../lib/supabase';
import { ContentIdea } from '../types/ideaBurst';

// Title record interface matching the old Noodl structure
export interface TitleRecord {
  id: string;
  user_id: string;
  blog_idea_id: string;
  trend_analysis_id?: string;
  
  // Required fields
  Title: string;
  Keywords: string;
  userDescription: string;
  
  // Affiliate program tracking
  affiliate_program_ids?: string | null;
  monetization_score?: number;
  estimated_annual_revenue?: number;
  affiliate_opportunities?: any;
  revenue_breakdown?: any;
  monetization_priority?: string;
  monetization_analysis?: any;
  
  // Additional blog idea data
  content_format?: string;
  difficulty_level?: string;
  estimated_word_count?: number;
  estimated_reading_time?: number;
  target_audience?: string;
  
  // Quality scores
  overall_quality_score?: number;
  viral_potential_score?: number;
  seo_optimization_score?: number;
  audience_alignment_score?: number;
  content_feasibility_score?: number;
  business_impact_score?: number;
  
  // Enhanced keyword data
  enhanced_primary_keywords?: any;
  enhanced_secondary_keywords?: any;
  keyword_research_data?: any;
  keyword_research_enhanced?: boolean;
  traffic_potential_score?: number;
  competition_score?: number;
  enhancement_timestamp?: string | null;
  
  // Content structure
  content_outline?: any;
  key_points?: any;
  engagement_hooks?: any;
  visual_elements?: any;
  call_to_action_text?: string;
  business_value?: string;
  
  // Priority and scheduling
  priority_level?: string;
  scheduled_publish_date?: string | null;
  
  // Workflow status
  workflow_status?: string;
  status?: string;
  content_generated?: boolean;
  content_brief_generated?: boolean;
  
  // Timestamps
  dateCreatedOn: string;
  last_updated: string;
  updated_by: string;
  
  // Additional metadata
  generation_source?: string;
  source_topic_id?: string | null;
  source_opportunity_id?: string | null;
  
  // Default values for optional fields
  Tone?: string;
  articleLength?: string;
  postType?: string;
  published?: boolean;
  tableOfContentsFlag?: boolean;
  sectionNumberingFlag?: boolean;
  iterativeGeneration?: boolean;
  affiliateDisclosure?: boolean;
  knowledge_gaps_closed?: boolean;
  knowledge_enhanced?: boolean;
  additional_knowledge_enhanced?: boolean;
}

// Publish request interface
export interface PublishIdeasRequest {
  ideas: ContentIdea[];
  trend_analysis_id?: string;
  source_topic_id?: string;
  source_opportunity_id?: string;
  user_id: string;
}

// Publish response interface
export interface PublishIdeasResponse {
  success: boolean;
  published_count: number;
  failed_count: number;
  published_titles: TitleRecord[];
  errors: string[];
}

class TitlesPublishService {
  private tableName = 'Titles';

  /**
   * Publish selected ideas to the Titles table
   */
  async publishIdeas(request: PublishIdeasRequest): Promise<PublishIdeasResponse> {
    const { ideas, trend_analysis_id, source_topic_id, source_opportunity_id, user_id } = request;
    
    const publishedTitles: TitleRecord[] = [];
    const errors: string[] = [];
    let publishedCount = 0;
    let failedCount = 0;

    console.log('Publishing ideas to Titles table:', {
      ideasCount: ideas.length,
      trend_analysis_id,
      source_topic_id,
      source_opportunity_id,
      user_id
    });

    for (const idea of ideas) {
      try {
        const titleRecord = this.convertIdeaToTitleRecord(idea, {
          trend_analysis_id,
          source_topic_id,
          source_opportunity_id,
          user_id
        });

        const { data, error } = await supabase
          .from(this.tableName)
          .insert([titleRecord])
          .select()
          .single();

        if (error) {
          console.error('Error publishing idea to Titles:', error);
          errors.push(`Failed to publish "${idea.title}": ${error.message}`);
          failedCount++;
        } else {
          console.log('Successfully published idea to Titles:', data);
          publishedTitles.push(data as TitleRecord);
          publishedCount++;
          
          // Mark idea as published in content_ideas table
          try {
            console.log('Updating content_ideas table for idea:', idea.id, 'with titles_record_id:', data.id);
            
            const updatePayload = { 
              published: true,
              published_at: new Date().toISOString(),
              published_to_titles: true,
              titles_record_id: data.id,
              status: 'published',
              workflow_status: 'published_to_titles'
            };
            
            console.log('Updating content_ideas with payload:', updatePayload);
            console.log('Idea ID to update:', idea.id);
            
            console.log('Supabase client URL:', supabase.supabaseUrl);
            console.log('Supabase client key present:', !!supabase.supabaseKey);
            
            const { data: updateData, error: updateError } = await supabase
              .from('content_ideas')
              .update(updatePayload)
              .eq('id', idea.id)
              .select();
            
            if (updateError) {
              console.error(`Error: Failed to mark idea "${idea.title}" as published:`, updateError);
              errors.push(`Warning: Failed to mark "${idea.title}" as published: ${updateError.message}`);
            } else {
              console.log(`Successfully marked idea "${idea.title}" as published:`, updateData);
              console.log('Updated idea data:', updateData?.[0]);
            }
          } catch (updateError) {
            console.error(`Error: Failed to mark idea "${idea.title}" as published:`, updateError);
            errors.push(`Warning: Failed to mark "${idea.title}" as published: ${updateError}`);
          }
        }
      } catch (error: any) {
        console.error('Unexpected error publishing idea:', error);
        errors.push(`Unexpected error publishing "${idea.title}": ${error.message}`);
        failedCount++;
      }
    }

    return {
      success: publishedCount > 0,
      published_count: publishedCount,
      failed_count: failedCount,
      published_titles: publishedTitles,
      errors
    };
  }

  /**
   * Convert a ContentIdea to a TitleRecord
   */
  private convertIdeaToTitleRecord(
    idea: ContentIdea, 
    context: {
      trend_analysis_id?: string;
      source_topic_id?: string;
      source_opportunity_id?: string;
      user_id: string;
    }
  ): TitleRecord {
    const now = new Date().toISOString();
    
    // Extract keywords as comma-separated string with primary keywords first
    const primaryKeywords = idea.primary_keywords || [];
    const secondaryKeywords = idea.secondary_keywords || [];
    const keywords = [...primaryKeywords, ...secondaryKeywords].join(', ');
    
    // Debug logging for keywords and description
    console.log('Publishing idea data:', {
      title: idea.title,
      primaryKeywords,
      secondaryKeywords,
      finalKeywords: keywords,
      description: idea.description,
      hasDescription: !!idea.description
    });

    // Map content type to content format
    const contentFormatMap: Record<string, string> = {
      'article': 'how_to_guide',
      'comparison': 'comparison_guide',
      'guide': 'how_to_guide',
      'tutorial': 'tutorial',
      'review': 'product_review',
      'list': 'listicle',
      'case_study': 'case_study',
      'whitepaper': 'whitepaper',
      'infographic': 'infographic',
      'video_script': 'video_script',
      'podcast_script': 'podcast_script'
    };

    // Map difficulty scores to difficulty levels
    const getDifficultyLevel = (score: number): string => {
      if (score <= 30) return 'beginner';
      if (score <= 60) return 'intermediate';
      if (score <= 80) return 'advanced';
      return 'expert';
    };

    // Use estimated word count from idea if available, otherwise calculate
    const estimatedWordCount = idea.estimated_word_count || (idea.estimated_read_time ? idea.estimated_read_time * 200 : 2500);
    const estimatedReadingTime = idea.estimated_read_time || Math.ceil(estimatedWordCount / 200);

    return {
      id: crypto.randomUUID(),
      user_id: context.user_id,
      blog_idea_id: idea.id,
      trend_analysis_id: context.trend_analysis_id,
      
      // Required fields
      Title: idea.title || 'Untitled',
      Keywords: keywords || 'No keywords available',
      userDescription: idea.description || 'No description available',
      
      // Affiliate program tracking (default values)
      affiliate_program_ids: null,
      monetization_score: 0,
      estimated_annual_revenue: 0,
      affiliate_opportunities: {},
      revenue_breakdown: {},
      monetization_priority: 'medium',
      monetization_analysis: {},
      
      // Additional blog idea data
      content_format: contentFormatMap[idea.content_type] || 'how_to_guide',
      difficulty_level: getDifficultyLevel(idea.average_difficulty || 50),
      estimated_word_count: estimatedWordCount,
      estimated_reading_time: estimatedReadingTime,
      target_audience: idea.target_audience || '',
      
      // Quality scores (map from idea scores and Ahrefs data)
      overall_quality_score: idea.overall_quality_score || Math.round((idea.seo_optimization_score + idea.traffic_potential_score) / 2) || 0,
      viral_potential_score: idea.traffic_potential_score || 0,
      seo_optimization_score: idea.seo_optimization_score || 0,
      audience_alignment_score: 0,
      content_feasibility_score: 0,
      business_impact_score: 0,
      
      // Enhanced keyword data with Ahrefs information
      enhanced_primary_keywords: idea.primary_keywords || null,
      enhanced_secondary_keywords: idea.secondary_keywords || null,
      keyword_research_data: {
        search_volume: idea.total_search_volume || 0,
        difficulty: idea.average_difficulty || 0,
        cpc: idea.average_cpc || 0,
        optimization_tips: idea.optimization_tips || [],
        // Add Ahrefs-specific data if available
        viral_score: idea.viral_score || idea.traffic_potential_score || 0,
        competition_level: idea.competition_level || (idea.average_difficulty > 70 ? 'high' : idea.average_difficulty > 40 ? 'medium' : 'low'),
        ahrefs_enhanced: !!(idea.ahrefs_keywords || idea.generation_method === 'ahrefs')
      },
      keyword_research_enhanced: !!(idea.ahrefs_keywords || idea.generation_method === 'ahrefs'),
      traffic_potential_score: idea.traffic_potential_score || 0,
      competition_score: idea.average_difficulty || 0,
      enhancement_timestamp: idea.generation_method === 'ahrefs' ? now : null,
      
      // Content structure
      content_outline: idea.content_outline || null,
      key_points: idea.content_outline?.map((section: any) => section.title) || null,
      engagement_hooks: null,
      visual_elements: null,
      call_to_action_text: '',
      business_value: '',
      
      // Priority and scheduling
      priority_level: 'medium',
      scheduled_publish_date: null,
      
      // Workflow status
      workflow_status: 'idea_selected',
      status: 'NEW',
      content_generated: false,
      content_brief_generated: false,
      
      // Timestamps
      dateCreatedOn: now,
      last_updated: now,
      updated_by: context.user_id,
      
      // Additional metadata
      generation_source: idea.generation_method === 'ahrefs' ? 'ahrefs_enhanced_idea' : 'blog_idea_selection',
      source_topic_id: context.source_topic_id || null,
      source_opportunity_id: context.source_opportunity_id || null,
      
      // Default values for optional fields
      Tone: 'professional',
      articleLength: `${estimatedWordCount} words`,
      postType: 'post',
      published: false,
      tableOfContentsFlag: true,
      sectionNumberingFlag: true,
      iterativeGeneration: false,
      affiliateDisclosure: false,
      knowledge_gaps_closed: false,
      knowledge_enhanced: false,
      additional_knowledge_enhanced: false
    };
  }

  /**
   * Get published titles for a user
   */
  async getPublishedTitles(userId: string, limit: number = 50): Promise<TitleRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('dateCreatedOn', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching published titles:', error);
        throw new Error(`Failed to fetch published titles: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Unexpected error fetching published titles:', error);
      throw new Error(`Failed to fetch published titles: ${error.message}`);
    }
  }

  /**
   * Delete a published title
   */
  async deletePublishedTitle(titleId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', titleId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting published title:', error);
        throw new Error(`Failed to delete published title: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Unexpected error deleting published title:', error);
      throw new Error(`Failed to delete published title: ${error.message}`);
    }
  }

  /**
   * Update a published title
   */
  async updatePublishedTitle(titleId: string, updates: Partial<TitleRecord>, userId: string): Promise<TitleRecord> {
    try {
      const updateData = {
        ...updates,
        last_updated: new Date().toISOString(),
        updated_by: userId
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', titleId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating published title:', error);
        throw new Error(`Failed to update published title: ${error.message}`);
      }

      return data as TitleRecord;
    } catch (error: any) {
      console.error('Unexpected error updating published title:', error);
      throw new Error(`Failed to update published title: ${error.message}`);
    }
  }
}

// Export singleton instance
export const titlesPublishService = new TitlesPublishService();
export default titlesPublishService;
