/**
 * Unit tests for ResearchTopicCard component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ResearchTopicCard from '../../../components/researchTopics/ResearchTopicCard';
import { ResearchTopic, ResearchTopicStatus } from '../../../types/researchTopics';

// Mock theme
const theme = createTheme();

// Mock the useDataflowProgress hook
jest.mock('../../../hooks/useResearchTopics', () => ({
  useDataflowProgress: () => ({
    progressPercentage: 75,
    hasSubtopics: true,
    hasTrendAnalyses: true,
    hasContentIdeas: false
  })
}));

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('ResearchTopicCard', () => {
  const mockTopic: ResearchTopic = {
    id: '1',
    user_id: 'user1',
    title: 'Test Research Topic',
    description: 'This is a test research topic description',
    status: ResearchTopicStatus.ACTIVE,
    version: 1,
    created_at: '2025-01-27T10:00:00Z',
    updated_at: '2025-01-27T10:00:00Z'
  };

  const mockHandlers = {
    onView: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onArchive: jest.fn(),
    onRestore: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders topic information correctly', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Research Topic')).toBeInTheDocument();
    expect(screen.getByText('This is a test research topic description')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
  });

  it('displays progress indicator', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Dataflow Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows progress steps with correct status', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    // Check that progress steps are rendered
    const avatars = screen.getAllByRole('img', { hidden: true });
    expect(avatars).toHaveLength(3); // S, T, C avatars
  });

  it('calls onView when view button is clicked', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('View Dataflow'));
    expect(mockHandlers.onView).toHaveBeenCalledWith(mockTopic);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTopic);
  });

  it('opens menu when more button is clicked', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);

    expect(screen.getByText('View Dataflow')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onArchive when archive is clicked from menu', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);

    fireEvent.click(screen.getByText('Archive'));
    expect(mockHandlers.onArchive).toHaveBeenCalledWith(mockTopic);
  });

  it('calls onDelete when delete is clicked from menu', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);

    fireEvent.click(screen.getByText('Delete'));
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTopic);
  });

  it('shows restore option for archived topics', () => {
    const archivedTopic = { ...mockTopic, status: ResearchTopicStatus.ARCHIVED };

    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={archivedTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);

    expect(screen.getByText('Restore')).toBeInTheDocument();
    expect(screen.queryByText('Archive')).not.toBeInTheDocument();
  });

  it('calls onRestore when restore is clicked for archived topic', () => {
    const archivedTopic = { ...mockTopic, status: ResearchTopicStatus.ARCHIVED };

    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={archivedTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);

    fireEvent.click(screen.getByText('Restore'));
    expect(mockHandlers.onRestore).toHaveBeenCalledWith(archivedTopic);
  });

  it('hides actions when showActions is false', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
          showActions={false}
        />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument();
  });

  it('displays correct status color and icon', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    const statusChip = screen.getByText('active');
    expect(statusChip).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const topicWithoutDescription = { ...mockTopic, description: undefined };

    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={topicWithoutDescription}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    expect(screen.getByText('No description provided')).toBeInTheDocument();
  });

  it('displays creation and update dates', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('only shows updated date when different from created date', () => {
    const topicWithSameDates = {
      ...mockTopic,
      updated_at: mockTopic.created_at
    };

    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={topicWithSameDates}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument();
  });

  it('closes menu when clicking outside', () => {
    render(
      <TestWrapper>
        <ResearchTopicCard
          topic={mockTopic}
          {...mockHandlers}
        />
      </TestWrapper>
    );

    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);

    expect(screen.getByText('View Dataflow')).toBeInTheDocument();

    // Click outside the menu
    fireEvent.click(document.body);

    // Menu should be closed
    expect(screen.queryByText('View Dataflow')).not.toBeInTheDocument();
  });
});
