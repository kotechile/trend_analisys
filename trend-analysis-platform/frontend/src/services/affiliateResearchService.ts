/**
 * Affiliate Research Service
 * Handles affiliate research operations using existing backend APIs
 */

import { supabase } from '../lib/supabase';

export interface AffiliateOffer {
  id: string;
  offer_name: string;
  offer_description?: string;
  commission_rate?: string;
  access_instructions?: string;
  subtopic_id?: string;
  linkup_data: Record<string, any>;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  // New fields for multi-subtopic support
  subtopics?: string[];
  relevance_score?: number;
}

export interface Subtopic {
  id: string;
  title: string;
  description?: string;
  relevance_score: number;
  category: string;
  created_at: string;
}

export interface AffiliateResearchRequest {
  search_term: string;
  topic: string;
  user_id: string;
}

export interface AffiliateResearchResponse {
  success: boolean;
  message: string;
  data: {
    programs: AffiliateOffer[];
    subtopics: Subtopic[];
  };
}

export interface TopicDecompositionRequest {
  search_query: string;
  user_id: string;
}

export interface TopicDecompositionResponse {
  success: boolean;
  message: string;
  data: {
    subtopics: string[];
  };
}

class AffiliateResearchService {
  private baseUrl = 'http://localhost:8000'; // Backend API URL

  /**
   * Get Google autocomplete suggestions
   */
  async getGoogleAutocompleteSuggestions(query: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/google-autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Google autocomplete error:', error);
      return [];
    }
  }

  /**
   * Decompose topic into subtopics using Google Autocomplete + LLM hybrid approach
   */
  async decomposeTopic(searchQuery: string, userId: string): Promise<string[]> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        // Try enhanced approach first (Google Autocomplete + LLM)
        const enhancedResponse = await fetch(`${this.baseUrl}/api/enhanced-topic-decomposition`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            search_query: searchQuery,
            user_id: userId,
            max_subtopics: 8,
            use_autocomplete: true,
            use_llm: true,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (enhancedResponse.ok) {
          const enhancedData = await enhancedResponse.json();
          if (enhancedData.subtopics && Array.isArray(enhancedData.subtopics)) {
            console.log('Using enhanced approach (Google Autocomplete + LLM)');
            return enhancedData.subtopics;
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.log('Enhanced API timeout, falling back to LLM-only approach');
        } else {
          console.log('Enhanced API failed, falling back to LLM-only approach');
        }
      }

      // Fallback to simple LLM-only approach with timeout
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 8000); // 8 second timeout

      try {
        console.log('Falling back to LLM-only approach');
        const response = await fetch(`${this.baseUrl}/api/topic-decomposition`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            search_query: searchQuery,
            user_id: userId,
            max_subtopics: 8,
            use_autocomplete: true,
            use_llm: true,
          }),
          signal: controller2.signal,
        });

        clearTimeout(timeoutId2);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.subtopics || [];
      } catch (fetchError) {
        clearTimeout(timeoutId2);
        if (fetchError.name === 'AbortError') {
          console.log('LLM API timeout, using fallback subtopics');
        } else {
          console.log('LLM API failed, using fallback subtopics');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Topic decomposition error:', error);
      console.log('Using fallback subtopics generation');
      // Fallback to basic subtopics
      return this.generateFallbackSubtopics(searchQuery);
    }
  }

  /**
   * Search for affiliate programs for multiple subtopics
   */
  async searchAffiliateProgramsForSubtopics(
    subtopics: string[],
    mainTopic: string,
    userId: string
  ): Promise<{ [subtopic: string]: AffiliateOffer[] }> {
    try {
      console.log('Searching affiliate programs for subtopics:', subtopics);
      
      const results: { [subtopic: string]: AffiliateOffer[] } = {};
      
      // Search for each subtopic
      for (const subtopic of subtopics) {
        try {
          console.log(`Searching offers for subtopic: ${subtopic}`);
          const offers = await this.searchAffiliatePrograms(subtopic, mainTopic, userId);
          results[subtopic] = offers;
          console.log(`Found ${offers.length} offers for subtopic: ${subtopic}`);
        } catch (error) {
          console.error(`Failed to search offers for subtopic ${subtopic}:`, error);
          results[subtopic] = [];
        }
      }
      
      return results;
    } catch (error) {
      console.error('Multi-subtopic affiliate research error:', error);
      return {};
    }
  }

  /**
   * Deduplicate and combine offers from multiple subtopics
   */
  deduplicateOffersBySubtopics(
    offersBySubtopic: { [subtopic: string]: AffiliateOffer[] }
  ): { 
    combinedOffers: AffiliateOffer[], 
    offersBySubtopic: { [subtopic: string]: AffiliateOffer[] },
    duplicateMap: { [offerId: string]: string[] }
  } {
    const seenOffers = new Map<string, AffiliateOffer>();
    const duplicateMap: { [offerId: string]: string[] } = {};
    const deduplicatedBySubtopic: { [subtopic: string]: AffiliateOffer[] } = {};
    
    // First pass: collect all unique offers and track duplicates
    for (const [subtopic, offers] of Object.entries(offersBySubtopic)) {
      deduplicatedBySubtopic[subtopic] = [];
      
      for (const offer of offers) {
        // Create a unique key based on offer name and network
        const offerKey = `${offer.offer_name.toLowerCase()}_${offer.linkup_data?.network || 'unknown'}`;
        
        if (seenOffers.has(offerKey)) {
          // This is a duplicate - add to duplicate map
          if (!duplicateMap[offerKey]) {
            duplicateMap[offerKey] = [];
          }
          duplicateMap[offerKey].push(subtopic);
        } else {
          // New offer
          seenOffers.set(offerKey, offer);
          deduplicatedBySubtopic[subtopic].push(offer);
        }
      }
    }
    
    // Second pass: add subtopic information to offers
    const combinedOffers = Array.from(seenOffers.values()).map(offer => ({
      ...offer,
      subtopics: this._getSubtopicsForOffer(offer, offersBySubtopic),
      relevance_score: this._calculateRelevanceScore(offer, offersBySubtopic)
    }));
    
    return {
      combinedOffers,
      offersBySubtopic: deduplicatedBySubtopic,
      duplicateMap
    };
  }

  /**
   * Get subtopics that contain this offer
   */
  private _getSubtopicsForOffer(
    offer: AffiliateOffer, 
    offersBySubtopic: { [subtopic: string]: AffiliateOffer[] }
  ): string[] {
    const subtopics: string[] = [];
    
    for (const [subtopic, offers] of Object.entries(offersBySubtopic)) {
      const offerKey = `${offer.offer_name.toLowerCase()}_${offer.linkup_data?.network || 'unknown'}`;
      const hasOffer = offers.some(o => 
        `${o.offer_name.toLowerCase()}_${o.linkup_data?.network || 'unknown'}` === offerKey
      );
      
      if (hasOffer) {
        subtopics.push(subtopic);
      }
    }
    
    return subtopics;
  }

  /**
   * Calculate relevance score based on how many subtopics contain this offer
   */
  private _calculateRelevanceScore(
    offer: AffiliateOffer,
    offersBySubtopic: { [subtopic: string]: AffiliateOffer[] }
  ): number {
    const totalSubtopics = Object.keys(offersBySubtopic).length;
    const matchingSubtopics = this._getSubtopicsForOffer(offer, offersBySubtopic).length;
    
    return totalSubtopics > 0 ? matchingSubtopics / totalSubtopics : 0;
  }

  /**
   * Search for affiliate programs (single search term)
   */
  async searchAffiliatePrograms(
    searchTerm: string,
    topic: string,
    userId: string
  ): Promise<AffiliateOffer[]> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${this.baseUrl}/api/affiliate-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_term: searchTerm,
          topic: topic,
          user_id: userId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      
      // Handle both response formats: {programs: [...]} and {data: {programs: [...]}}
      let programs = [];
      if (data.programs) {
        programs = data.programs;
      } else if (data.data?.programs) {
        programs = data.data.programs;
      } else {
        console.warn('Unexpected response format:', data);
        return [];
      }
      
      // Map backend fields to frontend interface
      return programs.map((program: any) => {
        // Keep commission rate as string to preserve ranges like "4-6%"
        let commissionRate = program.commission_rate || 'Unknown';
        
        return {
          id: program.id,
          offer_name: program.name || program.offer_name,
          offer_description: program.description || program.offer_description,
          commission_rate: commissionRate,
          access_instructions: program.access_instructions || 'Contact the affiliate network for access instructions',
          subtopic_id: program.subtopic_id,
          linkup_data: program.linkup_data || { link: program.link, network: program.network, epc: program.epc },
          status: program.status || 'active',
          created_at: program.created_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error('Affiliate research error:', error);
      if (error.name === 'AbortError') {
        console.log('Affiliate research timeout, returning empty results');
      } else {
        console.log('Affiliate research failed, returning empty results');
      }
      return []; // Return empty array instead of fallback offers
    }
  }

  /**
   * Load existing affiliate offers from Supabase for a topic
   */
  async loadExistingOffers(topicId: string, userId: string): Promise<AffiliateOffer[]> {
    try {
      console.log('Loading existing offers for topic:', topicId, 'user:', userId);
      
      // First, let's check what offers exist for this user
      const { data: allUserOffers, error: allError } = await supabase
        .from('affiliate_offers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('All offers for user:', allUserOffers?.length || 0);
      console.log('Sample offer workflow_session_id:', allUserOffers?.[0]?.workflow_session_id);
      
      // Try to load offers by workflow_session_id first
      let { data, error } = await supabase
        .from('affiliate_offers')
        .select('*')
        .eq('user_id', userId)
        .eq('workflow_session_id', topicId) // Using topicId as session identifier
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error loading existing offers by workflow_session_id:', error);
        // Try fallback approach - load all offers for user and filter by recent ones
        const fallbackQuery = await supabase
          .from('affiliate_offers')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(100); // Get recent offers
        
        if (fallbackQuery.error) {
          console.log('Fallback query also failed:', fallbackQuery.error);
          return [];
        }
        
        data = fallbackQuery.data;
        console.log('Using fallback query, found offers:', data?.length || 0);
      } else {
        console.log('Loaded existing offers for topic', topicId, ':', data?.length || 0);
        console.log('Query details - user_id:', userId, 'workflow_session_id:', topicId);
        
        // If no offers found with topic ID, try to load offers with "temp-session" as fallback
        if ((data?.length || 0) === 0) {
          console.log('No offers found for topic ID, trying temp-session fallback...');
          const fallbackQuery = await supabase
            .from('affiliate_offers')
            .select('*')
            .eq('user_id', userId)
            .eq('workflow_session_id', 'temp-session')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          
          if (!fallbackQuery.error && fallbackQuery.data && fallbackQuery.data.length > 0) {
            console.log('Found offers with temp-session fallback:', fallbackQuery.data.length);
            data = fallbackQuery.data;
          }
        }
      }
      
      // Convert database format to frontend format
      return (data || []).map(offer => ({
        id: offer.id,
        offer_name: offer.offer_name,
        offer_description: offer.offer_description,
        commission_rate: offer.commission_rate?.toString() || 'Unknown',
        access_instructions: offer.access_instructions,
        subtopic_id: offer.subtopic_id,
        linkup_data: offer.linkup_data || {},
        status: offer.status,
        created_at: offer.created_at,
        // Add any additional fields that might be stored
        subtopics: offer.subtopics || [],
        relevance_score: offer.relevance_score || 0
      }));
    } catch (error) {
      console.error('Failed to load existing offers:', error);
      return [];
    }
  }

  /**
   * Load existing offers grouped by subtopic
   */
  async loadExistingOffersBySubtopics(topicId: string, userId: string): Promise<{ [subtopic: string]: AffiliateOffer[] }> {
    try {
      const offers = await this.loadExistingOffers(topicId, userId);
      
      // Group offers by subtopic
      const offersBySubtopic: { [subtopic: string]: AffiliateOffer[] } = {};
      
      for (const offer of offers) {
        const subtopics = offer.subtopics || ['General'];
        
        for (const subtopic of subtopics) {
          if (!offersBySubtopic[subtopic]) {
            offersBySubtopic[subtopic] = [];
          }
          offersBySubtopic[subtopic].push(offer);
        }
      }
      
      return offersBySubtopic;
    } catch (error) {
      console.error('Failed to load existing offers by subtopics:', error);
      return {};
    }
  }

  /**
   * Store affiliate offers in Supabase (optional - won't fail if table doesn't exist)
   */
  async storeAffiliateOffers(offers: AffiliateOffer[], userId: string, topicId?: string): Promise<void> {
    try {
      console.log('Storing offers:', offers.length, 'for topic:', topicId, 'user:', userId);
      
      const { error } = await supabase
        .from('affiliate_offers')
        .insert(
          offers.map(offer => {
            // Convert commission rate string to number for database storage
            let commissionRate = 0;
            if (offer.commission_rate) {
              // Extract the first number from strings like "5-8%" or "4-6%"
              const match = offer.commission_rate.match(/(\d+(?:\.\d+)?)/);
              if (match) {
                commissionRate = parseFloat(match[1]);
              }
            }
            
            const offerData = {
              user_id: userId,
              workflow_session_id: topicId || 'unknown-topic', // Use topicId as session identifier
              offer_name: offer.offer_name,
              offer_description: offer.offer_description,
              commission_rate: commissionRate,
              access_instructions: offer.access_instructions,
              linkup_data: offer.linkup_data,
              status: offer.status,
              // Store additional fields for future retrieval
              subtopics: offer.subtopics || [],
              relevance_score: offer.relevance_score || 0
            };
            
            console.log('Storing offer data:', offerData);
            return offerData;
          })
        );

      if (error) {
        // Don't throw error for missing table - just log and continue
        if (error.message.includes('Could not find the table') || 
            error.message.includes('relation') || 
            error.message.includes('does not exist')) {
          console.log('Affiliate offers table not found - skipping storage');
          return;
        }
        throw new Error(`Failed to store affiliate offers: ${error.message}`);
      }
      console.log('Affiliate offers stored successfully in Supabase');
    } catch (error) {
      console.error('Store affiliate offers error:', error);
      // Don't throw - just log and continue
      console.log('Continuing without storing affiliate offers in database');
    }
  }

  /**
   * Store subtopics in Supabase (optional - won't fail if table doesn't exist)
   */
  async storeSubtopics(subtopics: string[], userId: string, mainTopic: string, researchTopicId?: string): Promise<void> {
    try {
      console.log('storeSubtopics - Input parameters:', {
        subtopics,
        userId,
        mainTopic,
        researchTopicId
      });

      const insertData: any = {
        user_id: userId,
        search_query: mainTopic,
        subtopics: subtopics,
      };

      // Add research_topic_id if provided
      if (researchTopicId) {
        insertData.research_topic_id = researchTopicId;
      }

      console.log('storeSubtopics - Insert data:', insertData);

      const { error } = await supabase
        .from('topic_decompositions')
        .insert(insertData);

      if (error) {
        // Don't throw error for missing table - just log and continue
        if (error.message.includes('Could not find the table') || 
            error.message.includes('relation') || 
            error.message.includes('does not exist')) {
          console.log('Topic decompositions table not found - skipping storage');
          return;
        }
        throw new Error(`Failed to store subtopics: ${error.message}`);
      }
      console.log('storeSubtopics - Success! Subtopics stored successfully in Supabase');
      console.log('storeSubtopics - Stored data:', insertData);
    } catch (error) {
      console.error('Store subtopics error:', error);
      // Don't throw - just log and continue
      console.log('Continuing without storing subtopics in database');
    }
  }

  /**
   * Get subtopics for a research topic
   */
  async getSubtopicsForTopic(researchTopicId: string, userId: string): Promise<string[]> {
    try {
      console.log('getSubtopicsForTopic - researchTopicId:', researchTopicId);
      console.log('getSubtopicsForTopic - userId:', userId);
      
      const { data, error } = await supabase
        .from('topic_decompositions')
        .select('subtopics, research_topic_id, user_id, created_at')
        .eq('research_topic_id', researchTopicId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('getSubtopicsForTopic - Query result:', { data, error });

      if (error) {
        console.error('Error fetching subtopics:', error);
        return [];
      }

      if (data && data.length > 0) {
        console.log('getSubtopicsForTopic - Found subtopics:', data[0].subtopics);
        return data[0].subtopics || [];
      }

      console.log('getSubtopicsForTopic - No subtopics found for topic:', researchTopicId);
      return [];
    } catch (error) {
      console.error('Failed to get subtopics:', error);
      return [];
    }
  }

  /**
   * Get existing research topics for dropdown
   */
  async getResearchTopics(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('research_topics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get research topics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get research topics error:', error);
      return [];
    }
  }

  /**
   * Migrate existing offers from temp-session to proper topic IDs
   * This is a one-time migration function
   */
  async migrateOffersToTopicId(topicId: string, userId: string): Promise<void> {
    try {
      console.log('=== MIGRATION: Updating offers to use topic ID ===');
      
      // Find all offers with temp-session for this user
      const { data: tempOffers, error: fetchError } = await supabase
        .from('affiliate_offers')
        .select('*')
        .eq('user_id', userId)
        .eq('workflow_session_id', 'temp-session');

      if (fetchError) {
        console.log('Error fetching temp-session offers:', fetchError);
        return;
      }

      if (!tempOffers || tempOffers.length === 0) {
        console.log('No temp-session offers found to migrate');
        return;
      }

      console.log(`Found ${tempOffers.length} offers to migrate to topic: ${topicId}`);

      // Update all temp-session offers to use the topic ID
      const { error: updateError } = await supabase
        .from('affiliate_offers')
        .update({ workflow_session_id: topicId })
        .eq('user_id', userId)
        .eq('workflow_session_id', 'temp-session');

      if (updateError) {
        console.log('Error updating offers:', updateError);
        return;
      }

      console.log(`Successfully migrated ${tempOffers.length} offers to topic: ${topicId}`);
      console.log('=== MIGRATION COMPLETE ===');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  /**
   * Debug function to check what offers are stored in the database
   */
  async debugStoredOffers(userId: string): Promise<void> {
    try {
      console.log('=== DEBUG: Checking stored offers ===');
      
      const { data, error } = await supabase
        .from('affiliate_offers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching offers:', error);
        return;
      }

      console.log('Total offers in database:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('Sample offers:');
        data.slice(0, 3).forEach((offer, index) => {
          console.log(`Offer ${index + 1}:`, {
            id: offer.id,
            offer_name: offer.offer_name,
            workflow_session_id: offer.workflow_session_id,
            created_at: offer.created_at,
            user_id: offer.user_id
          });
        });
        
        // Group by workflow_session_id
        const groupedBySession = data.reduce((acc, offer) => {
          const sessionId = offer.workflow_session_id || 'no-session';
          if (!acc[sessionId]) {
            acc[sessionId] = [];
          }
          acc[sessionId].push(offer);
          return acc;
        }, {} as { [key: string]: any[] });
        
        console.log('Offers grouped by workflow_session_id:', groupedBySession);
      }
      
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Debug function failed:', error);
    }
  }

  /**
   * Generate fallback subtopics when LLM is not available
   */
  private generateFallbackSubtopics(topic: string): string[] {
    // More sophisticated fallback subtopics based on common patterns
    const fallbackSubtopics = [
      `${topic} for beginners`,
      `${topic} advanced techniques`,
      `${topic} tools and resources`,
      `${topic} best practices`,
      `${topic} case studies`,
      `${topic} trends 2024`,
      `${topic} comparison`,
      `${topic} reviews`,
      `${topic} tutorials`,
      `${topic} guides`,
      `${topic} tips and tricks`,
      `${topic} strategies`,
      `${topic} examples`,
      `${topic} benefits`,
      `${topic} challenges`,
    ];
    
    // Return 8-12 subtopics for better variety
    return fallbackSubtopics.slice(0, Math.min(12, fallbackSubtopics.length));
  }

}

export const affiliateResearchService = new AffiliateResearchService();
export default affiliateResearchService;
