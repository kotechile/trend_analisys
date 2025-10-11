/**
 * Tests for Titles Publish Service
 */

import { titlesPublishService } from '../titlesPublishService';
import { ContentIdea } from '../../types/ideaBurst';

// Mock Supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-title-id',
              Title: 'Test Title',
              Keywords: 'test, keywords',
              userDescription: 'Test description',
              user_id: 'test-user-id',
              blog_idea_id: 'test-idea-id',
              dateCreatedOn: new Date().toISOString(),
              last_updated: new Date().toISOString(),
              updated_by: 'test-user-id'
            },
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('TitlesPublishService', () => {
  const mockContentIdea: ContentIdea = {
    id: 'test-idea-id',
    title: 'Test Blog Post Title',
    content_type: 'article',
    primary_keywords: ['test', 'blog'],
    secondary_keywords: ['content', 'writing'],
    seo_optimization_score: 85,
    traffic_potential_score: 75,
    total_search_volume: 1000,
    average_difficulty: 45,
    average_cpc: 2.50,
    optimization_tips: ['Use more keywords', 'Improve readability'],
    content_outline: [
      { id: '1', title: 'Introduction', description: 'Intro section', order: 1, estimated_word_count: 200, keywords: ['intro'], tips: [], created_at: new Date().toISOString() },
      { id: '2', title: 'Main Content', description: 'Main section', order: 2, estimated_word_count: 800, keywords: ['main'], tips: [], created_at: new Date().toISOString() }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1
  };

  describe('convertIdeaToTitleRecord', () => {
    it('should convert ContentIdea to TitleRecord correctly', () => {
      const result = (titlesPublishService as any).convertIdeaToTitleRecord(mockContentIdea, {
        trend_analysis_id: 'test-analysis-id',
        source_topic_id: 'test-topic-id',
        user_id: 'test-user-id'
      });

      expect(result).toMatchObject({
        Title: 'Test Blog Post Title',
        Keywords: 'test, blog, content, writing',
        userDescription: 'Intro section Main section',
        user_id: 'test-user-id',
        blog_idea_id: 'test-idea-id',
        trend_analysis_id: 'test-analysis-id',
        source_topic_id: 'test-topic-id',
        content_format: 'how_to_guide',
        difficulty_level: 'intermediate',
        estimated_word_count: 2500,
        estimated_reading_time: 13,
        seo_optimization_score: 85,
        traffic_potential_score: 75,
        overall_quality_score: 80,
        workflow_status: 'idea_selected',
        status: 'NEW',
        content_generated: false,
        content_brief_generated: false,
        generation_source: 'blog_idea_selection',
        Tone: 'professional',
        postType: 'post',
        published: false
      });
    });

    it('should handle missing fields gracefully', () => {
      const minimalIdea: ContentIdea = {
        id: 'minimal-idea',
        title: 'Minimal Title',
        content_type: 'article',
        primary_keywords: [],
        secondary_keywords: [],
        seo_optimization_score: 0,
        traffic_potential_score: 0,
        total_search_volume: 0,
        average_difficulty: 0,
        average_cpc: 0,
        optimization_tips: [],
        content_outline: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
      };

      const result = (titlesPublishService as any).convertIdeaToTitleRecord(minimalIdea, {
        user_id: 'test-user-id'
      });

      expect(result).toMatchObject({
        Title: 'Minimal Title',
        Keywords: 'No keywords available',
        userDescription: 'No description available',
        user_id: 'test-user-id',
        blog_idea_id: 'minimal-idea',
        content_format: 'how_to_guide',
        difficulty_level: 'beginner',
        estimated_word_count: 2500,
        estimated_reading_time: 13,
        seo_optimization_score: 0,
        traffic_potential_score: 0,
        overall_quality_score: 0
      });
    });
  });

  describe('publishIdeas', () => {
    it('should publish ideas successfully', async () => {
      const result = await titlesPublishService.publishIdeas({
        ideas: [mockContentIdea],
        user_id: 'test-user-id',
        trend_analysis_id: 'test-analysis-id'
      });

      expect(result.success).toBe(true);
      expect(result.published_count).toBe(1);
      expect(result.failed_count).toBe(0);
      expect(result.published_titles).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty ideas array', async () => {
      const result = await titlesPublishService.publishIdeas({
        ideas: [],
        user_id: 'test-user-id'
      });

      expect(result.success).toBe(true);
      expect(result.published_count).toBe(0);
      expect(result.failed_count).toBe(0);
      expect(result.published_titles).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});

