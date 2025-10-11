/**
 * Unit tests for useResearchTopics hooks
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useResearchTopics,
  useResearchTopic,
  useResearchTopicComplete,
  useCreateResearchTopic,
  useUpdateResearchTopic,
  useDeleteResearchTopic,
  useResearchTopicForm,
  useSubtopicForm
} from '../../hooks/useResearchTopics';
import { researchTopicsService } from '../../services/researchTopicsService';
import { ResearchTopicStatus } from '../../types/researchTopics';

// Mock the service
jest.mock('../../services/researchTopicsService', () => ({
  researchTopicsService: {
    listResearchTopics: jest.fn(),
    getResearchTopic: jest.fn(),
    getCompleteDataflow: jest.fn(),
    createResearchTopic: jest.fn(),
    updateResearchTopic: jest.fn(),
    deleteResearchTopic: jest.fn(),
    getDataflowProgress: jest.fn(),
    validateDataflowIntegrity: jest.fn()
  }
}));

const mockService = researchTopicsService as jest.Mocked<typeof researchTopicsService>;

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useResearchTopics hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useResearchTopics', () => {
    it('fetches research topics successfully', async () => {
      const mockData = {
        items: [
          {
            id: '1',
            user_id: 'user1',
            title: 'Test Topic',
            description: 'Test Description',
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

      mockService.listResearchTopics.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useResearchTopics(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockService.listResearchTopics).toHaveBeenCalledWith(undefined);
    });

    it('handles fetch error', async () => {
      const error = new Error('Fetch failed');
      mockService.listResearchTopics.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useResearchTopics(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useResearchTopic', () => {
    it('fetches single research topic successfully', async () => {
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

      mockService.getResearchTopic.mockResolvedValueOnce(mockTopic);

      const { result } = renderHook(() => useResearchTopic('1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTopic);
      expect(mockService.getResearchTopic).toHaveBeenCalledWith('1');
    });

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useResearchTopic(''), {
        wrapper: createWrapper()
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockService.getResearchTopic).not.toHaveBeenCalled();
    });
  });

  describe('useResearchTopicComplete', () => {
    it('fetches complete dataflow successfully', async () => {
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
        trend_analyses: [],
        content_ideas: []
      };

      mockService.getCompleteDataflow.mockResolvedValueOnce(mockDataflow);

      const { result } = renderHook(() => useResearchTopicComplete('1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDataflow);
      expect(mockService.getCompleteDataflow).toHaveBeenCalledWith('1');
    });
  });

  describe('useCreateResearchTopic', () => {
    it('creates research topic successfully', async () => {
      const mockTopic = {
        id: '1',
        user_id: 'user1',
        title: 'New Topic',
        description: 'New Description',
        status: ResearchTopicStatus.ACTIVE,
        version: 1,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z'
      };

      mockService.createResearchTopic.mockResolvedValueOnce(mockTopic);

      const { result } = renderHook(() => useCreateResearchTopic(), {
        wrapper: createWrapper()
      });

      const topicData = {
        title: 'New Topic',
        description: 'New Description',
        status: ResearchTopicStatus.ACTIVE
      };

      await act(async () => {
        await result.current.mutateAsync(topicData);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockTopic);
      expect(mockService.createResearchTopic).toHaveBeenCalledWith(topicData);
    });

    it('handles creation error', async () => {
      const error = new Error('Creation failed');
      mockService.createResearchTopic.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useCreateResearchTopic(), {
        wrapper: createWrapper()
      });

      const topicData = {
        title: 'New Topic',
        description: 'New Description',
        status: ResearchTopicStatus.ACTIVE
      };

      await act(async () => {
        try {
          await result.current.mutateAsync(topicData);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useUpdateResearchTopic', () => {
    it('updates research topic successfully', async () => {
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

      mockService.updateResearchTopic.mockResolvedValueOnce(mockTopic);

      const { result } = renderHook(() => useUpdateResearchTopic(), {
        wrapper: createWrapper()
      });

      const updateData = {
        id: '1',
        data: {
          title: 'Updated Topic',
          description: 'Updated Description',
          status: ResearchTopicStatus.COMPLETED,
          version: 1
        }
      };

      await act(async () => {
        await result.current.mutateAsync(updateData);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockTopic);
      expect(mockService.updateResearchTopic).toHaveBeenCalledWith('1', updateData.data);
    });
  });

  describe('useDeleteResearchTopic', () => {
    it('deletes research topic successfully', async () => {
      mockService.deleteResearchTopic.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteResearchTopic(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.mutateAsync('1');
      });

      expect(result.current.isSuccess).toBe(true);
      expect(mockService.deleteResearchTopic).toHaveBeenCalledWith('1');
    });
  });

  describe('useResearchTopicForm', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useResearchTopicForm());

      expect(result.current.formData).toEqual({
        title: '',
        description: '',
        status: ResearchTopicStatus.ACTIVE
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(false);
    });

    it('initializes with provided data', () => {
      const initialData = {
        title: 'Test Title',
        description: 'Test Description',
        status: ResearchTopicStatus.COMPLETED
      };

      const { result } = renderHook(() => useResearchTopicForm(initialData));

      expect(result.current.formData).toEqual(initialData);
    });

    it('updates field values', () => {
      const { result } = renderHook(() => useResearchTopicForm());

      act(() => {
        result.current.updateField('title', 'New Title');
      });

      expect(result.current.formData.title).toBe('New Title');
    });

    it('validates form correctly', () => {
      const { result } = renderHook(() => useResearchTopicForm());

      // Test empty title validation
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.title).toBe('Title is required');
      expect(result.current.isValid).toBe(false);

      // Test valid form
      act(() => {
        result.current.updateField('title', 'Valid Title');
        result.current.validateForm();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it('validates title length', () => {
      const { result } = renderHook(() => useResearchTopicForm());

      act(() => {
        result.current.updateField('title', 'a'.repeat(256));
        result.current.validateForm();
      });

      expect(result.current.errors.title).toBe('Title must be less than 255 characters');
    });

    it('validates description length', () => {
      const { result } = renderHook(() => useResearchTopicForm());

      act(() => {
        result.current.updateField('title', 'Valid Title');
        result.current.updateField('description', 'a'.repeat(1001));
        result.current.validateForm();
      });

      expect(result.current.errors.description).toBe('Description must be less than 1000 characters');
    });

    it('clears errors when field is updated', () => {
      const { result } = renderHook(() => useResearchTopicForm());

      // Create an error
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.title).toBe('Title is required');

      // Update field should clear error
      act(() => {
        result.current.updateField('title', 'New Title');
      });

      expect(result.current.errors.title).toBe('');
    });

    it('resets form to initial values', () => {
      const initialData = {
        title: 'Initial Title',
        description: 'Initial Description',
        status: ResearchTopicStatus.ACTIVE
      };

      const { result } = renderHook(() => useResearchTopicForm(initialData));

      // Change values
      act(() => {
        result.current.updateField('title', 'Changed Title');
        result.current.updateField('description', 'Changed Description');
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual(initialData);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('useSubtopicForm', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useSubtopicForm());

      expect(result.current.formData).toEqual({
        search_query: '',
        subtopics: [],
        original_topic_included: true
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(false);
    });

    it('adds subtopic', () => {
      const { result } = renderHook(() => useSubtopicForm());

      act(() => {
        result.current.addSubtopic();
      });

      expect(result.current.formData.subtopics).toHaveLength(1);
      expect(result.current.formData.subtopics[0]).toEqual({
        name: '',
        description: ''
      });
    });

    it('removes subtopic', () => {
      const { result } = renderHook(() => useSubtopicForm());

      // Add two subtopics
      act(() => {
        result.current.addSubtopic();
        result.current.addSubtopic();
      });

      expect(result.current.formData.subtopics).toHaveLength(2);

      // Remove first subtopic
      act(() => {
        result.current.removeSubtopic(0);
      });

      expect(result.current.formData.subtopics).toHaveLength(1);
    });

    it('updates subtopic field', () => {
      const { result } = renderHook(() => useSubtopicForm());

      act(() => {
        result.current.addSubtopic();
        result.current.updateSubtopic(0, 'name', 'Test Name');
        result.current.updateSubtopic(0, 'description', 'Test Description');
      });

      expect(result.current.formData.subtopics[0]).toEqual({
        name: 'Test Name',
        description: 'Test Description'
      });
    });

    it('validates form correctly', () => {
      const { result } = renderHook(() => useSubtopicForm());

      // Test empty form validation
      act(() => {
        result.current.validateForm();
      });

      expect(result.current.errors.search_query).toBe('Search query is required');
      expect(result.current.errors.subtopics).toBe('At least one subtopic is required');
      expect(result.current.isValid).toBe(false);

      // Test valid form
      act(() => {
        result.current.updateField('search_query', 'test query');
        result.current.addSubtopic();
        result.current.updateSubtopic(0, 'name', 'Test Name');
        result.current.updateSubtopic(0, 'description', 'Test Description');
        result.current.validateForm();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it('validates individual subtopic fields', () => {
      const { result } = renderHook(() => useSubtopicForm());

      act(() => {
        result.current.updateField('search_query', 'test query');
        result.current.addSubtopic();
        result.current.validateForm();
      });

      expect(result.current.errors['subtopic_0_name']).toBe('Subtopic name is required');
      expect(result.current.errors['subtopic_0_description']).toBe('Subtopic description is required');
    });

    it('resets form', () => {
      const { result } = renderHook(() => useSubtopicForm());

      // Add data
      act(() => {
        result.current.updateField('search_query', 'test query');
        result.current.addSubtopic();
        result.current.updateSubtopic(0, 'name', 'Test Name');
      });

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData).toEqual({
        search_query: '',
        subtopics: [],
        original_topic_included: true
      });
      expect(result.current.errors).toEqual({});
    });
  });
});
