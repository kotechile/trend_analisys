/**
 * Unit tests for ResearchTopicForm component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ResearchTopicForm from '../../../components/researchTopics/ResearchTopicForm';
import { ResearchTopicFormData, ResearchTopicStatus } from '../../../types/researchTopics';

// Mock theme
const theme = createTheme();

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

describe('ResearchTopicForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Research Topic Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByText('Create Topic')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders with initial data when provided', () => {
    const initialData: Partial<ResearchTopicFormData> = {
      title: 'Test Topic',
      description: 'Test Description',
      status: ResearchTopicStatus.COMPLETED
    };

    render(
      <TestWrapper>
        <ResearchTopicForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Test Topic')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('completed')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Create Topic');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates title length', async () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText('Research Topic Title');
    const longTitle = 'a'.repeat(256); // Exceeds 255 character limit

    fireEvent.change(titleInput, { target: { value: longTitle } });
    fireEvent.click(screen.getByText('Create Topic'));

    await waitFor(() => {
      expect(screen.getByText('Title must be less than 255 characters')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates description length', async () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText('Research Topic Title');
    const descriptionInput = screen.getByLabelText('Description');
    const longDescription = 'a'.repeat(1001); // Exceeds 1000 character limit

    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.change(descriptionInput, { target: { value: longDescription } });
    fireEvent.click(screen.getByText('Create Topic'));

    await waitFor(() => {
      expect(screen.getByText('Description must be less than 1000 characters')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText('Research Topic Title');
    const descriptionInput = screen.getByLabelText('Description');
    const statusSelect = screen.getByLabelText('Status');

    fireEvent.change(titleInput, { target: { value: 'Test Topic' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(statusSelect, { target: { value: ResearchTopicStatus.ACTIVE } });

    fireEvent.click(screen.getByText('Create Topic'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Topic',
        description: 'Test Description',
        status: ResearchTopicStatus.ACTIVE
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Create Topic')).toBeDisabled();
  });

  it('shows correct button text for edit mode', () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          mode="edit"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Update Topic')).toBeInTheDocument();
  });

  it('clears errors when user starts typing', async () => {
    render(
      <TestWrapper>
        <ResearchTopicForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Trigger validation error
    fireEvent.click(screen.getByText('Create Topic'));
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    // Start typing in title field
    const titleInput = screen.getByLabelText('Research Topic Title');
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  it('resets form when reset is called', () => {
    const initialData: Partial<ResearchTopicFormData> = {
      title: 'Initial Title',
      description: 'Initial Description',
      status: ResearchTopicStatus.ACTIVE
    };

    render(
      <TestWrapper>
        <ResearchTopicForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Change values
    const titleInput = screen.getByLabelText('Research Topic Title');
    fireEvent.change(titleInput, { target: { value: 'Changed Title' } });

    // Cancel should reset form
    fireEvent.click(screen.getByText('Cancel'));

    // Form should be reset to initial values
    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
  });
});
