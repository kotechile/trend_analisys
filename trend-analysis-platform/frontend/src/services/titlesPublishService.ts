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
  monetization_score?: string | number;
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
  // content_feasibility_score?: number; // Removed as per request
  // business_impact_score?: number; // Removed as per request

  // Search Metrics
  total_search_volume?: number;
  avg_keyword_difficulty?: number;

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

  // SEO meta fields
  metaTitle?: string;
  metaDescription?: string;

  // Default values for optional fields
  Tone?: string;
  articleLength?: number;
  postType?: string;
  published?: boolean;
  tableOfContentsFlag?: boolean;
  sectionNumberingFlag?: boolean;
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
  user_id?: string; // Optional now, will use auth user if not provided or to override
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
    const { ideas, trend_analysis_id, source_topic_id, source_opportunity_id } = request;

    // Get current user from Supabase Auth to ensure we use the correct auth ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ No authenticated user found');
      return {
        success: false,
        published_count: 0,
        failed_count: ideas.length,
        published_titles: [],
        errors: ['User not authenticated: No active session found']
      };
    }

    const user_id = user.id;

    const publishedTitles: TitleRecord[] = [];
    const errors: string[] = [];
    let publishedCount = 0;
    let failedCount = 0;

    console.log('🚀 Publishing ideas to Titles table:', {
      ideasCount: ideas.length,
      trend_analysis_id,
      source_topic_id,
      source_opportunity_id,
      user_id,
      tableName: this.tableName
    });

    // Diagnostic: Check if table exists and can be queried
    try {
      const { error: testError } = await supabase
        .from(this.tableName)
        .select('id')
        .limit(1);
      if (testError) {
        console.error('❌ Cannot access Titles table:', testError);
        errors.push(`Cannot access Titles table: ${testError.message}`);
        return {
          success: false,
          published_count: 0,
          failed_count: ideas.length,
          published_titles: [],
          errors: [`Cannot access Titles table: ${testError.message}`]
        };
      } else {
        console.log('✅ Titles table is accessible');
      }
    } catch (diagError: any) {
      console.error('❌ Diagnostic error:', diagError);
      errors.push(`Table diagnostic failed: ${diagError.message}`);
    }

    for (const idea of ideas) {
      try {
        console.log(`📝 Processing idea: "${idea.title}"`);

        const titleRecord = await this.convertIdeaToTitleRecord(idea, {
          trend_analysis_id,
          source_topic_id,
          source_opportunity_id,
          user_id
        });

        console.log(`📊 Title record prepared for: "${idea.title}"`, {
          Title: titleRecord.Title,
          Keywords: titleRecord.Keywords,
          affiliate_program_ids: titleRecord.affiliate_program_ids,
          user_id: titleRecord.user_id
        });

        // Log the complete title record before inserting
        console.log('📄 Complete title record before insert:', {
          Title: titleRecord.Title,
          Keywords: titleRecord.Keywords,
          affiliate_program_ids: titleRecord.affiliate_program_ids,
          affiliate_opportunities: titleRecord.affiliate_opportunities,
          monetization_score: titleRecord.monetization_score,
          user_id: titleRecord.user_id,
          blog_idea_id: titleRecord.blog_idea_id
        });
        console.log('📄 Raw affiliate_opportunities:', JSON.stringify(titleRecord.affiliate_opportunities, null, 2));
        console.log('📄 affiliate_program_ids type:', typeof titleRecord.affiliate_program_ids);
        console.log('📄 affiliate_opportunities type:', typeof titleRecord.affiliate_opportunities);
        console.log('📄 affiliate_opportunities is object?', typeof titleRecord.affiliate_opportunities === 'object');
        console.log('📄 affiliate_opportunities keys:', titleRecord.affiliate_opportunities ? Object.keys(titleRecord.affiliate_opportunities) : 'null');

        const { data, error } = await supabase
          .from(this.tableName)
          .insert([titleRecord])
          .select()
          .single();

        if (error) {
          console.error('❌ Error publishing idea to Titles:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.error('Title record that failed:', JSON.stringify(titleRecord, null, 2));
          errors.push(`Failed to publish "${idea.title}": ${error.message}`);
          failedCount++;
        } else {
          console.log('✅ Successfully published idea to Titles:', data?.id);
          console.log('📊 Published data from Supabase:', {
            id: data.id,
            affiliate_program_ids: data.affiliate_program_ids,
            affiliate_opportunities: data.affiliate_opportunities,
            monetization_score: data.monetization_score
          });
          console.log('📊 Raw affiliate_program_ids:', typeof data.affiliate_program_ids, data.affiliate_program_ids);
          console.log('📊 Raw affiliate_opportunities:', typeof data.affiliate_opportunities, data.affiliate_opportunities);
          console.log('📊 affiliate_opportunities after insert type:', typeof data.affiliate_opportunities, '- is string?', typeof data.affiliate_opportunities === 'string');

          // Try to access the nested properties if it's an object
          if (typeof data.affiliate_opportunities === 'object' && data.affiliate_opportunities !== null) {
            console.log('📊 affiliate_opportunities.matching_programs:', data.affiliate_opportunities.matching_programs);
            console.log('📊 affiliate_opportunities.programs count:', data.affiliate_opportunities.programs?.length);
          } else if (typeof data.affiliate_opportunities === 'string') {
            console.log('⚠️ affiliate_opportunities is STILL a string (FIX DID NOT WORK)');
            console.log('⚠️ String length:', data.affiliate_opportunities.length);
            console.log('⚠️ First 200 chars:', data.affiliate_opportunities.substring(0, 200));
          }

          // If affiliate data is in the record but not in the response, try to fetch it
          if (data && (!data.affiliate_program_ids || !data.affiliate_opportunities)) {
            console.log('⚠️ Affiliate data missing from response, trying to fetch...');
            const { data: fullData } = await supabase
              .from(this.tableName)
              .select('id, affiliate_program_ids, affiliate_opportunities, monetization_score')
              .eq('id', data.id)
              .single();
            console.log('📊 Full record from database:', fullData);
          }

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
  private async convertIdeaToTitleRecord(
    idea: ContentIdea,
    context: {
      trend_analysis_id?: string;
      source_topic_id?: string;
      source_opportunity_id?: string;
      user_id: string;
    }
  ): Promise<TitleRecord> {
    const now = new Date().toISOString();

    // Extract keywords as comma-separated string with primary keywords first
    const primaryKeywords = idea.primary_keywords || [];
    const secondaryKeywords = idea.secondary_keywords || [];
    const allKeywords = idea.keywords || []; // Also check the main keywords array

    console.log('🔑 Extracting keywords for affiliate matching:', {
      primaryKeywords,
      secondaryKeywords,
      allKeywords,
      hasPrimary: primaryKeywords.length > 0,
      hasSecondary: secondaryKeywords.length > 0,
      hasAll: allKeywords.length > 0
    });

    // Combine all keywords: primary first, then secondary, then any remaining
    const keywordSet = new Set([...primaryKeywords, ...secondaryKeywords, ...allKeywords]);
    const keywords = Array.from(keywordSet).join(', ');

    console.log(`🔑 Final keywords string for affiliate matching: "${keywords}"`);

    // Try to find matching affiliate programs based on keywords
    let affiliateProgramIds: string[] = [];
    let affiliateOpportunities: any = {};

    console.log('🔍 Starting affiliate program matching...');
    console.log('🔑 Keywords to match:', keywords);
    console.log('👤 User ID:', context.user_id);

    try {
      console.log('📞 Calling findMatchingAffiliatePrograms...');
      const matchingPrograms = await this.findMatchingAffiliatePrograms(keywords, context.user_id);
      console.log(`📊 findMatchingAffiliatePrograms returned ${matchingPrograms.length} programs`);

      affiliateProgramIds = matchingPrograms.map(p => p.id);

      console.log(`✅ Found ${affiliateProgramIds.length} matching affiliate programs for keywords: "${keywords}"`);
      if (affiliateProgramIds.length > 0) {
        console.log('📋 Program IDs:', affiliateProgramIds);
        // Populate affiliate_opportunities with program details
        affiliateOpportunities = {
          matching_programs: matchingPrograms.length,
          program_ids: affiliateProgramIds,
          keywords_matched: keywords,
          programs: matchingPrograms.map(p => ({
            id: p.id,
            name: p.offer_name,
            description: p.offer_description,
            commission_rate: p.commission_rate,
            status: p.status,
            network: p.network_name
          }))
        };
        console.log('💰 Affiliate opportunities data:', affiliateOpportunities);
      } else {
        console.log('⚠️ No affiliate programs matched for keywords:', keywords);
      }
    } catch (error) {
      console.error('❌ ERROR in affiliate program matching:', error);
      console.warn('⚠️ Could not find matching affiliate programs:', error);
    }

    // Debug logging for keywords and description
    console.log('Publishing idea data:', {
      title: idea.title,
      primaryKeywords,
      secondaryKeywords,
      allKeywords,
      keywordSet: Array.from(keywordSet),
      finalKeywords: keywords,
      affiliateProgramIds,
      description: idea.description,
      hasDescription: !!idea.description
    });

    // Calculate estimated annual revenue
    const calculateEstimatedRevenue = () => {
      if (!affiliateOpportunities || !affiliateOpportunities.programs || affiliateOpportunities.programs.length === 0) {
        return 0;
      }

      // Base assumptions
      const avgMonthlyTraffic = idea.traffic_potential_score ?
        Math.floor(idea.traffic_potential_score / 10) * 100 : 500; // 10% of traffic score * 100 visitors
      const conversionRate = 0.02; // 2% click-through rate
      const avgOrderValue = 100; // Average order value in dollars

      // Calculate revenue per program
      let totalAnnualRevenue = 0;
      affiliateOpportunities.programs.forEach((program: any) => {
        const commissionRate = parseFloat(program.commission_rate) || 0;
        const monthlyClicks = avgMonthlyTraffic * conversionRate;
        const monthlyOrders = monthlyClicks * 0.1; // 10% of clicks become orders
        const monthlyRevenue = (monthlyOrders * avgOrderValue * commissionRate) / 100;
        const annualRevenue = monthlyRevenue * 12;
        totalAnnualRevenue += annualRevenue;
      });

      return Math.round(totalAnnualRevenue);
    };

    const estimatedRevenue = calculateEstimatedRevenue();

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
    // UPDATE: User requested to keep the score 0-100 instead of text categories
    const getDifficultyLevel = (score: number): string => {
      return score.toString();
    };

    // Use estimated word count from idea if available, otherwise calculate
    const estimatedWordCount = idea.estimated_word_count || (idea.estimated_read_time ? idea.estimated_read_time * 200 : 2500);
    const estimatedReadingTime = idea.estimated_read_time || Math.ceil(estimatedWordCount / 200);

    // Generate SEO meta fields
    // metaTitle: 50-60 characters (SEO best practice)
    const generateMetaTitle = (title: string): string => {
      if (!title) return '';
      if (title.length <= 60) return title;
      // Truncate at word boundary near 60 characters
      const truncated = title.substring(0, 57);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    };

    // metaDescription: 150-160 characters (SEO best practice)
    const generateMetaDescription = (description: string, title: string, keywords: string): string => {
      // Use description if available, otherwise create from title and keywords
      let baseText = description || title;

      // If we have keywords, try to incorporate them naturally
      if (keywords && !description) {
        const keywordList = keywords.split(',').slice(0, 3).map(k => k.trim()).join(', ');
        baseText = `${title}. Learn about ${keywordList} and more.`;
      }

      if (baseText.length <= 160) return baseText;

      // Truncate at word boundary near 160 characters
      const truncated = baseText.substring(0, 157);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    };

    const metaTitle = generateMetaTitle(idea.title || 'Untitled');
    // Access description - it exists at runtime even if not in TypeScript interface
    const ideaDescription = (idea as any).description || '';
    const metaDescription = generateMetaDescription(
      ideaDescription,
      idea.title || 'Untitled',
      keywords
    );

    return {
      id: crypto.randomUUID(),
      user_id: context.user_id,
      blog_idea_id: idea.id,
      trend_analysis_id: context.trend_analysis_id,

      // Required fields
      Title: idea.title || 'Untitled',
      Keywords: keywords || 'No keywords available',
      userDescription: idea.description || 'No description available',

      // Affiliate program tracking
      affiliate_program_ids: affiliateProgramIds.length > 0 ? JSON.stringify(affiliateProgramIds) : null,
      monetization_score: affiliateProgramIds.length > 0 ? '75' : '0', // Database expects text
      estimated_annual_revenue: estimatedRevenue,
      affiliate_opportunities: affiliateProgramIds.length > 0 ? affiliateOpportunities : null,
      revenue_breakdown: {
        monthly_visitors: idea.traffic_potential_score ? Math.floor(idea.traffic_potential_score / 10) * 100 : 500,
        conversion_rate: '2%',
        avg_order_value: 100,
        calculation_method: 'estimated'
      },
      monetization_priority: idea.monetization_potential || 'medium',
      monetization_analysis: {
        programs_count: affiliateProgramIds.length,
        avg_commission_rate: affiliateOpportunities?.programs?.length > 0
          ? (affiliateOpportunities.programs.reduce((sum: number, p: any) => sum + (parseFloat(p.commission_rate) || 0), 0) / affiliateOpportunities.programs.length).toFixed(1)
          : '0'
      },

      // Additional blog idea data
      content_format: contentFormatMap[idea.content_type] || 'how_to_guide',
      difficulty_level: getDifficultyLevel(idea.average_difficulty || 50),
      estimated_word_count: estimatedWordCount,
      estimated_reading_time: estimatedReadingTime,
      target_audience: idea.target_audience || '',

      // Quality scores (map from idea scores and Ahrefs data)
      // Round all scores to integers since database expects integer type
      // Quality scores (map from idea scores and Ahrefs data)
      // Round all scores to integers since database expects integer type
      overall_quality_score: Math.round(idea.overall_quality_score || (idea.seo_optimization_score + idea.traffic_potential_score) / 2 || 0),
      viral_potential_score: Math.round(idea.viral_score || idea.traffic_potential_score || 0),
      seo_optimization_score: Math.round(idea.seo_optimization_score || 0),
      audience_alignment_score: Math.round(idea.overall_quality_score || 0), // Fallback map if explicit field missing, but expected from LLM
      // content_feasibility_score: 0, // Removed as per request
      // business_impact_score: 0, // Removed as per request

      // Search Metrics
      total_search_volume: idea.total_search_volume || 0,
      avg_keyword_difficulty: Math.round(idea.average_difficulty || 0),

      // Extended metrics from LLM if available
      ...((idea as any).audience_alignment_score !== undefined && { audience_alignment_score: Math.round((idea as any).audience_alignment_score) }),
      // ...((idea as any).content_feasibility_score !== undefined && { content_feasibility_score: Math.round((idea as any).content_feasibility_score) }),
      // ...((idea as any).business_impact_score !== undefined && { business_impact_score: Math.round((idea as any).business_impact_score) }),

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
      traffic_potential_score: Math.round(idea.traffic_potential_score || 0),
      competition_score: Math.round(idea.average_difficulty || 0),
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

      // SEO meta fields
      metaTitle: metaTitle,
      metaDescription: metaDescription,

      // Default values for optional fields
      Tone: 'professional',
      articleLength: estimatedWordCount,
      postType: 'post',
      published: false,
      tableOfContentsFlag: true,
      sectionNumberingFlag: true,
      affiliateDisclosure: false,
      knowledge_gaps_closed: false,
      knowledge_enhanced: false,
      additional_knowledge_enhanced: false
    };
  }

  /**
   * Get published titles for a user
   */
  async getPublishedTitles(userId?: string, limit: number = 50): Promise<TitleRecord[]> {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', targetUserId)
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
  async deletePublishedTitle(titleId: string, userId?: string): Promise<void> {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        targetUserId = user.id;
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', titleId)
        .eq('user_id', targetUserId);

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
  async updatePublishedTitle(titleId: string, updates: Partial<TitleRecord>, userId?: string): Promise<TitleRecord> {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        targetUserId = user.id;
      }

      const updateData = {
        ...updates,
        last_updated: new Date().toISOString(),
        updated_by: targetUserId
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', titleId)
        .eq('user_id', targetUserId)
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

  /**
   * Find matching affiliate programs based on keywords
   * Returns array of program objects with id, program_name, company_name, industry
   */
  private async findMatchingAffiliatePrograms(keywords: string, userId: string): Promise<any[]> {
    console.log('🔍 findMatchingAffiliatePrograms CALLED with:', { keywords, userId });
    try {
      // Split keywords into individual terms
      const keywordTerms = keywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k.length > 0);

      console.log('📝 Keyword terms extracted:', keywordTerms);

      if (keywordTerms.length === 0) {
        console.log('⚠️ No keywords provided for affiliate matching');
        return [];
      }

      console.log(`🔍 Searching for affiliate programs matching keywords: ${keywordTerms.join(', ')}`);

      // First, let's try to get ALL affiliate programs (they are system-wide, not user-specific)
      // Then filter in-memory for better reliability
      console.log('📡 Fetching affiliate offers from Supabase...');
      const { data: allOffers, error: fetchError } = await supabase
        .from('affiliate_offers')
        .select('id, offer_name, offer_description, commission_rate, status, network_name')
        .limit(100); // Get up to 100 offers

      if (fetchError) {
        console.error('❌ Error fetching all affiliate offers:', fetchError);
        console.error('Error details:', JSON.stringify(fetchError, null, 2));
        return [];
      }

      console.log(`📊 Supabase query returned ${allOffers?.length || 0} offers`);

      if (!allOffers || allOffers.length === 0) {
        console.warn('⚠️ No affiliate offers found in system');
        return [];
      }

      console.log(`📋 Found ${allOffers.length} total affiliate offers in system`);
      console.log('📋 Sample offers:', allOffers.slice(0, 3).map(p => ({
        id: p.id,
        name: p.offer_name,
        description: p.offer_description
      })));

      // Filter offers that match keywords
      const matchingPrograms = allOffers.filter(offer => {
        const offerName = (offer.offer_name || '').toLowerCase();
        const description = (offer.offer_description || '').toLowerCase();
        const network = (offer.network_name || '').toLowerCase();

        // Create a combined searchable text
        const searchableText = `${offerName} ${description} ${network}`;

        // Check if any keyword term appears in the searchable text
        // Also check if any word from the keyword appears (for multi-word keywords like "career mentor")
        return keywordTerms.some(term => {
          const termLower = term.toLowerCase();

          // Direct match
          if (searchableText.includes(termLower)) {
            return true;
          }

          // Word-by-word match for multi-word keywords (e.g., "career mentor" -> match if "career" OR "mentor" appears)
          const words = termLower.split(' ');
          if (words.length > 1) {
            return words.some(word => searchableText.includes(word));
          }

          return false;
        });
      });

      if (matchingPrograms.length === 0) {
        console.log('ℹ️ No matching affiliate programs found for keywords:', keywordTerms);
        console.log(`ℹ️ Searched through ${allOffers.length} total offers`);
        return [];
      }

      console.log(`✅ Found ${matchingPrograms.length} matching affiliate programs out of ${allOffers.length} total offers`);
      console.log('📊 Matching programs:', matchingPrograms.map(p => ({
        id: p.id,
        name: p.offer_name,
        description: p.offer_description
      })));

      // Log which keywords matched for each program
      if (matchingPrograms.length > 0) {
        matchingPrograms.forEach(offer => {
          const offerText = `${offer.offer_name} ${offer.offer_description} ${offer.network_name}`.toLowerCase();
          const matchedTerms = keywordTerms.filter(term =>
            offerText.includes(term.toLowerCase()) ||
            term.toLowerCase().split(' ').some(word => offerText.includes(word))
          );
          console.log(`  💡 "${offer.offer_name}" matched because of keywords: ${matchedTerms.join(', ')}`);
        });
      }

      return matchingPrograms;
    } catch (error) {
      console.error('❌ Error in findMatchingAffiliatePrograms:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return [];
    }
  }
}

// Export singleton instance
export const titlesPublishService = new TitlesPublishService();
export default titlesPublishService;
