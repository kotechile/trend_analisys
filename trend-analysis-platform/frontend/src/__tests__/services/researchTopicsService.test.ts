/**
 * Unit tests for ResearchTopicsService
 */

import { researchTopicsService } from '../../services/researchTopicsService';
import { apiClient } from '../../services/apiClient';
import {
  ResearchTopicCreate,
  ResearchTopicUpdate,
  ResearchTopicStatus,
  TopicDecompositionCreate,
  TrendAnalysisCreate,
  ContentIdeaCreate,
  ContentType,
  IdeaType,
  ContentStatus
} from '../../types/researchTopics';

// Mock the API client
jest.mock('../../services/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ResearchTopicsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Research Topics CRUD operations', () => {
    it('creates a research topic', async () => {
      const mockTopic = {
        id: '1',
        user_id: 'user1',
        title: 'Test Topic',
        description: 'Test Description',
        status: ResearchTopicStatus.ACTIVE,
        version: 1,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z'
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockTopic });

      const topicData: ResearchTopicCreate = {
        title: 'Test Topic',
        description: 'Test Description',
        status: ResearchTopicStatus.ACTIVE
      };

      const result = await researchTopicsService.createResearchTopic(topicData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/research-topics/', topicData);
      expect(result).toEqual(mockTopic);
    });

    it('gets a research topic by ID', async () => {
      const mockTopic = {
        id: '1',
        user_id: 'user1',
        title: 'Test Topic',
        description: 'Test Description',
        status: ResearchTopicStatus.ACTIVE,
        version: 1,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z'
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockTopic });

      const result = await researchTopicsService.getResearchTopic('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/research-topics/1');
      expect(result).toEqual(mockTopic);
    });

    it('updates a research topic', async () => {
      const mockTopic = {
        id: '1',
        user_id: 'user1',
        title: 'Updated Topic',
        description: 'Updated Description',
        status: ResearchTopicStatus.COMPLETED,
        version: 2,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T11:00:00Z'
      };

      mockApiClient.put.mockResolvedValueOnce({ data: mockTopic });

      const updateData: ResearchTopicUpdate = {
        title: 'Updated Topic',
        description: 'Updated Description',
        status: ResearchTopicStatus.COMPLETED,
        version: 1
      };

      const result = await researchTopicsService.updateResearchTopic('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/research-topics/1', updateData);
      expect(result).toEqual(mockTopic);
    });

    it('deletes a research topic', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ data: null });

      await researchTopicsService.deleteResearchTopic('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/research-topics/1');
    });

    it('lists research topics with pagination', async () => {
      const mockResponse = {
        items: [
          {
            id: '1',
            user_id: 'user1',
            title: 'Topic 1',
            description: 'Description 1',
            status: ResearchTopicStatus.ACTIVE,
            version: 1,
            created_at: '2025-01-27T10:00:00Z',
            updated_at: '2025-01-27T10:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        size: 10,
        has_next: false,
        has_prev: false
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await researchTopicsService.listResearchTopics({
        status: ResearchTopicStatus.ACTIVE,
        page: 1,
        size: 10
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/research-topics/', {
        params: {
          status: ResearchTopicStatus.ACTIVE,
          page: 1,
          size: 10
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('searches research topics', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_prev: false
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await researchTopicsService.searchResearchTopics({
        query: 'test',
        page: 1,
        size: 10
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/research-topics/search', {
        params: {
          query: 'test',
          page: 1,
          size: 10
        }
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Subtopic operations', () => {
    it('creates subtopics for a research topic', async () => {
      const mockDecomposition = {
        id: '1',
        research_topic_id: 'topic1',
        user_id: 'user1',
        search_query: 'test query',
        subtopics: [
          { name: 'Subtopic 1', description: 'Description 1' },
          { name: 'Subtopic 2', description: 'Description 2' }
        ],
        original_topic_included: true,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z'
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockDecomposition });

      const decompositionData: TopicDecompositionCreate = {
        research_topic_id: 'topic1',
        search_query: 'test query',
        subtopics: [
          { name: 'Subtopic 1', description: 'Description 1' },
          { name: 'Subtopic 2', description: 'Description 2' }
        ],
        original_topic_included: true
      };

      const result = await researchTopicsService.createSubtopics('topic1', decompositionData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/research-topics/topic1/subtopics', decompositionData);
      expect(result).toEqual(mockDecomposition);
    });

    it('gets subtopics for a research topic', async () => {
      const mockDecomposition = {
        id: '1',
        research_topic_id: 'topic1',
        user_id: 'user1',
        search_query: 'test query',
        subtopics: [
          { name: 'Subtopic 1', description: 'Description 1' }
        ],
        original_topic_included: true,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z'
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockDecomposition });

      const result = await researchTopicsService.getSubtopics('topic1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/research-topics/topic1/subtopics');
      expect(result).toEqual(mockDecomposition);
    });
  });

  describe('Trend Analysis operations', () => {
    it('creates a trend analysis', async () => {
      const mockAnalysis = {
        id: '1',
        user_id: 'user1',
        topic_decomposition_id: 'decomp1',
        analysis_name: 'Test Analysis',
        description: 'Test Description',
        subtopic_name: 'Subtopic 1',
        keywords: ['keyword1', 'keyword2'],
        timeframe: '12m',
        geo: 'US',
        status: 'completed',
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z'
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockAnalysis });

      const analysisData: TrendAnalysisCreate = {
        topic_decomposition_id: 'decomp1',
        analysis_name: 'Test Analysis',
        description: 'Test Description',
        subtopic_name: 'Subtopic 1',
        keywords: ['keyword1', 'keyword2'],
        timeframe: '12m',
        geo: 'US'
      };

      const result = await researchTopicsService.createTrendAnalysis(analysisData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/trend-analyses/', analysisData);
      expect(result).toEqual(mockAnalysis);
    });

    it('lists trend analyses', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_prev: false
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await researchTopicsService.listTrendAnalyses({
        page: 1,
        size: 10
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/trend-analyses/', {
        params: {
          page: 1,
          size: 10
        }
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Content Ideas operations', () => {
    it('creates a content idea', async () => {
      const mockIdea = {
        id: '1',
        user_id: 'user1',
        trend_analysis_id: 'analysis1',
        research_topic_id: 'topic1',
        title: 'Test Content Idea',
        description: 'Test Description',
        content_type: ContentType.BLOG_POST,
        idea_type: IdeaType.EVERGREEN,
        primary_keyword: 'test keyword',
        secondary_keywords: ['keyword1', 'keyword2'],
        target_audience: 'developers',
        key_points: ['point1', 'point2'],
        tags: ['tag1', 'tag2'],
        estimated_read_time: 5,
        difficulty_level: 'beginner',
        status: ContentStatus.DRAFT,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z'
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockIdea });

      const ideaData: ContentIdeaCreate = {
        trend_analysis_id: 'analysis1',
        research_topic_id: 'topic1',
        title: 'Test Content Idea',
        description: 'Test Description',
        content_type: ContentType.BLOG_POST,
        idea_type: IdeaType.EVERGREEN,
        primary_keyword: 'test keyword',
        secondary_keywords: ['keyword1', 'keyword2'],
        target_audience: 'developers',
        key_points: ['point1', 'point2'],
        tags: ['tag1', 'tag2'],
        estimated_read_time: 5,
        difficulty_level: 'beginner',
        status: ContentStatus.DRAFT
      };

      const result = await researchTopicsService.createContentIdea(ideaData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/content-ideas/', ideaData);
      expect(result).toEqual(mockIdea);
    });

    it('lists content ideas', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_prev: false
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await researchTopicsService.listContentIdeas({
        page: 1,
        size: 10
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/content-ideas/', {
        params: {
          page: 1,
          size: 10
        }
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Utility methods', () => {
    it('gets dataflow progress', async () => {
      const mockDataflow = {
        id: '1',
        user_id: 'user1',
        title: 'Test Topic',
        description: 'Test Description',
        status: ResearchTopicStatus.ACTIVE,
        version: 1,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z',
        subtopics: [{ name: 'Subtopic 1', description: 'Description 1' }],
        trend_analyses: [{ id: '1', subtopic_name: 'Subtopic 1' }],
        content_ideas: []
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockDataflow });

      const result = await researchTopicsService.getDataflowProgress('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/research-topics/1/complete');
      expect(result).toEqual({
        hasSubtopics: true,
        hasTrendAnalyses: true,
        hasContentIdeas: false,
        progressPercentage: 67 // 2/3 steps completed
      });
    });

    it('validates dataflow integrity', async () => {
      const mockDataflow = {
        id: '1',
        user_id: 'user1',
        title: 'Test Topic',
        description: 'Test Description',
        status: ResearchTopicStatus.ACTIVE,
        version: 1,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z',
        subtopics: [{ name: 'Subtopic 1', description: 'Description 1' }],
        trend_analyses: [{ id: '1', subtopic_name: 'Subtopic 1' }],
        content_ideas: [{ id: '1', trend_analysis_id: '1' }]
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockDataflow });

      const result = await researchTopicsService.validateDataflowIntegrity('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/research-topics/1/complete');
      expect(result).toEqual({
        isValid: true,
        issues: []
      });
    });

    it('handles dataflow integrity validation errors', async () => {
      const mockDataflow = {
        id: '1',
        user_id: 'user1',
        title: 'Test Topic',
        description: 'Test Description',
        status: ResearchTopicStatus.ACTIVE,
        version: 1,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z',
        subtopics: [],
        trend_analyses: [{ id: '1', subtopic_name: 'Invalid Subtopic' }],
        content_ideas: []
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockDataflow });

      const result = await researchTopicsService.validateDataflowIntegrity('1');

      expect(result).toEqual({
        isValid: false,
        issues: ['No subtopics found', '1 trend analyses linked to invalid subtopics']
      });
    });
  });

  describe('Error handling', () => {
    it('handles API errors gracefully', async () => {
      const error = new Error('API Error');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(researchTopicsService.getResearchTopic('1')).rejects.toThrow('API Error');
    });

    it('handles dataflow progress errors', async () => {
      const error = new Error('API Error');
      mockApiClient.get.mockRejectedValueOnce(error);

      const result = await researchTopicsService.getDataflowProgress('1');

      expect(result).toEqual({
        hasSubtopics: false,
        hasTrendAnalyses: false,
        hasContentIdeas: false,
        progressPercentage: 0
      });
    });

    it('handles dataflow integrity validation errors', async () => {
      const error = new Error('API Error');
      mockApiClient.get.mockRejectedValueOnce(error);

      const result = await researchTopicsService.validateDataflowIntegrity('1');

      expect(result).toEqual({
        isValid: false,
        issues: ['Failed to validate dataflow integrity']
      });
    });
  });
});
