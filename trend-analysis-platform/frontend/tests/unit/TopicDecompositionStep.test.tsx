/**
 * Unit tests for TopicDecompositionStep component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TopicDecompositionStep from '../../src/components/workflow/TopicDecompositionStep';
import { WorkflowStepProps } from '../../src/types/workflow';

const theme = createTheme();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const mockProps: WorkflowStepProps = {
  onNext: jest.fn(),
  onBack: jest.fn(),
  data: {
    sessionId: 'test-session',
    searchQuery: '',
  },
  loading: false,
  error: null,
};

describe('TopicDecompositionStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithProviders(<TopicDecompositionStep {...mockProps} />);
    
    expect(screen.getByText('🧠 Topic Decomposition')).toBeInTheDocument();
    expect(screen.getByText('Enter your search query and let AI break it down into relevant subtopics for deeper analysis.')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter your search query')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('disables analyze button when search query is empty', () => {
    renderWithProviders(<TopicDecompositionStep {...mockProps} />);
    
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    expect(analyzeButton).toBeDisabled();
  });

  it('enables analyze button when search query is provided', () => {
    renderWithProviders(<TopicDecompositionStep {...mockProps} />);
    
    const searchInput = screen.getByLabelText('Enter your search query');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    expect(analyzeButton).toBeEnabled();
  });

  it('calls onNext when continue button is clicked with selected subtopics', async () => {
    const mockOnNext = jest.fn();
    const propsWithData = {
      ...mockProps,
      onNext: mockOnNext,
      data: {
        ...mockProps.data,
        subtopics: [
          { name: 'Test Subtopic 1', description: 'Description 1', relevanceScore: 0.9, selected: false },
          { name: 'Test Subtopic 2', description: 'Description 2', relevanceScore: 0.8, selected: false },
        ],
      },
    };

    renderWithProviders(<TopicDecompositionStep {...propsWithData} />);
    
    // Select a subtopic
    const checkbox = screen.getByLabelText(/Test Subtopic 1/);
    fireEvent.click(checkbox);
    
    // Click continue button
    const continueButton = screen.getByRole('button', { name: /continue to affiliate research/i });
    fireEvent.click(continueButton);
    
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('disables continue button when no subtopics are selected', () => {
    const propsWithData = {
      ...mockProps,
      data: {
        ...mockProps.data,
        subtopics: [
          { name: 'Test Subtopic 1', description: 'Description 1', relevanceScore: 0.9, selected: false },
        ],
      },
    };

    renderWithProviders(<TopicDecompositionStep {...propsWithData} />);
    
    const continueButton = screen.getByRole('button', { name: /continue to affiliate research/i });
    expect(continueButton).toBeDisabled();
  });

  it('calls onBack when back button is clicked', () => {
    const mockOnBack = jest.fn();
    const propsWithBack = { ...mockProps, onBack: mockOnBack };

    renderWithProviders(<TopicDecompositionStep {...propsWithBack} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('displays error message when error prop is provided', () => {
    const propsWithError = {
      ...mockProps,
      error: 'Test error message',
    };

    renderWithProviders(<TopicDecompositionStep {...propsWithError} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    const propsWithLoading = {
      ...mockProps,
      loading: true,
    };

    renderWithProviders(<TopicDecompositionStep {...propsWithLoading} />);
    
    const analyzeButton = screen.getByRole('button', { name: /analyzing/i });
    expect(analyzeButton).toBeDisabled();
  });
});
