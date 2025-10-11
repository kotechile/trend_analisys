/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import IdeaBurstPage from '../IdeaBurstPage';
import * as api from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

// Create a theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('IdeaBurstPage Component', () => {
  const mockContentIdeas = [
    {
      id: 'idea-1',
      title: 'Best Project Management Tools for Remote Teams in 2024',
      content_type: 'list-article',
      primary_keywords: [
        'best project management tools',
        'project management software',
        'team collaboration software'
      ],
      secondary_keywords: [
        'remote work tools',
        'project tracking',
        'workflow management'
      ],
      seo_optimization_score: 92,
      traffic_potential_score: 88,
      total_search_volume: 45000,
      average_difficulty: 45,
      average_cpc: 3.20,
      optimization_tips: [
        'Include \'best project management tools\' in your title and first paragraph',
        'Create comparison sections for commercial keywords'
      ],
      content_outline: 'Introduction → Top 10 Tools → Conclusion'
    },
    {
      id: 'idea-2',
      title: 'How to Manage Projects Effectively: A Complete Guide',
      content_type: 'how-to-guide',
      primary_keywords: [
        'how to manage projects',
        'agile project management',
        'project management best practices'
      ],
      secondary_keywords: [
        'project planning',
        'team coordination',
        'project tracking'
      ],
      seo_optimization_score: 89,
      traffic_potential_score: 82,
      total_search_volume: 28000,
      average_difficulty: 35,
      average_cpc: 2.20,
      optimization_tips: [
        'Include \'how to manage projects\' in your title and first paragraph',
        'Create step-by-step sections for informational keywords'
      ],
      content_outline: 'Introduction → Project Planning → Execution → Conclusion'
    }
  ];

  const mockSelectionIndicators = [
    {
      id: 'indicator-1',
      type: 'seo_score',
      value: 92,
      label: 'SEO Score',
      color: 'green'
    },
    {
      id: 'indicator-2',
      type: 'traffic_potential',
      value: 88,
      label: 'Traffic Potential',
      color: 'blue'
    },
    {
      id: 'indicator-3',
      type: 'difficulty',
      value: 45,
      label: 'Difficulty',
      color: 'orange'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Idea Burst page correctly', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    expect(screen.getByText('Idea Burst')).toBeInTheDocument();
    expect(screen.getByText('Content Ideas')).toBeInTheDocument();
    expect(screen.getByText('Selection Indicators')).toBeInTheDocument();
  });

  it('displays content ideas with selection indicators', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    expect(screen.getByText('Best Project Management Tools for Remote Teams in 2024')).toBeInTheDocument();
    expect(screen.getByText('How to Manage Projects Effectively: A Complete Guide')).toBeInTheDocument();
    
    // Check selection indicators
    expect(screen.getByText('SEO Score')).toBeInTheDocument();
    expect(screen.getByText('Traffic Potential')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
  });

  it('handles idea selection with indicators', async () => {
    const user = userEvent.setup();
    const mockOnSelectIdea = jest.fn();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={mockOnSelectIdea}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    const selectButton = screen.getByText('Select Idea');
    await user.click(selectButton);

    expect(mockOnSelectIdea).toHaveBeenCalledWith(mockContentIdeas[0]);
  });

  it('handles filtering by content type', async () => {
    const user = userEvent.setup();
    const mockOnFilterIdeas = jest.fn();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={mockOnFilterIdeas}
        onSortIdeas={jest.fn()}
      />
    );

    const filterSelect = screen.getByLabelText('Filter by content type');
    await user.selectOptions(filterSelect, 'list-article');

    expect(mockOnFilterIdeas).toHaveBeenCalledWith('content_type', 'list-article');
  });

  it('handles sorting by SEO score', async () => {
    const user = userEvent.setup();
    const mockOnSortIdeas = jest.fn();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={mockOnSortIdeas}
      />
    );

    const sortSelect = screen.getByLabelText('Sort by');
    await user.selectOptions(sortSelect, 'seo_score');

    expect(mockOnSortIdeas).toHaveBeenCalledWith('seo_optimization_score', 'desc');
  });

  it('handles sorting by traffic potential', async () => {
    const user = userEvent.setup();
    const mockOnSortIdeas = jest.fn();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={mockOnSortIdeas}
      />
    );

    const sortSelect = screen.getByLabelText('Sort by');
    await user.selectOptions(sortSelect, 'traffic_potential');

    expect(mockOnSortIdeas).toHaveBeenCalledWith('traffic_potential_score', 'desc');
  });

  it('displays selection indicators with correct values', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    expect(screen.getByText('92')).toBeInTheDocument(); // SEO Score
    expect(screen.getByText('88')).toBeInTheDocument(); // Traffic Potential
    expect(screen.getByText('45')).toBeInTheDocument(); // Difficulty
  });

  it('handles indicator color coding', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    // Check that indicators have appropriate colors
    const seoIndicator = screen.getByText('92');
    const trafficIndicator = screen.getByText('88');
    const difficultyIndicator = screen.getByText('45');

    expect(seoIndicator).toBeInTheDocument();
    expect(trafficIndicator).toBeInTheDocument();
    expect(difficultyIndicator).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search content ideas...');
    await user.type(searchInput, 'project management');

    expect(searchInput).toHaveValue('project management');
  });

  it('handles bulk selection', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('Select all ideas');
    await user.click(selectAllCheckbox);

    const individualCheckboxes = screen.getAllByRole('checkbox');
    individualCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
  });

  it('handles idea comparison', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    const compareButton = screen.getByText('Compare Ideas');
    await user.click(compareButton);

    expect(screen.getByText('Idea Comparison')).toBeInTheDocument();
    expect(screen.getByText('Best Project Management Tools for Remote Teams in 2024')).toBeInTheDocument();
    expect(screen.getByText('How to Manage Projects Effectively: A Complete Guide')).toBeInTheDocument();
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    mockApi.exportIdeas.mockResolvedValue({
      content: 'exported ideas',
      filename: 'content_ideas.json',
      content_type: 'application/json'
    });

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    const exportButton = screen.getByText('Export Ideas');
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockApi.exportIdeas).toHaveBeenCalledWith(mockContentIdeas);
    });
  });

  it('handles empty content ideas', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={[]}
        selectionIndicators={[]}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    expect(screen.getByText('No content ideas available')).toBeInTheDocument();
    expect(screen.getByText('Generate some content ideas first')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={[]}
        selectionIndicators={[]}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading content ideas...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={[]}
        selectionIndicators={[]}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
        error="Failed to load content ideas"
      />
    );

    expect(screen.getByText('Error: Failed to load content ideas')).toBeInTheDocument();
  });

  it('handles responsive design', () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    // Component should still render correctly on mobile
    expect(screen.getByText('Idea Burst')).toBeInTheDocument();
  });

  it('handles indicator tooltips', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    const indicator = screen.getByText('SEO Score');
    await user.hover(indicator);

    expect(screen.getByText('SEO optimization score based on keyword selection and content structure')).toBeInTheDocument();
  });

  it('handles idea ranking', () => {
    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    // Check that ideas are ranked by their scores
    const ideaCards = screen.getAllByTestId('content-idea-card');
    expect(ideaCards[0]).toHaveTextContent('Best Project Management Tools for Remote Teams in 2024');
    expect(ideaCards[1]).toHaveTextContent('How to Manage Projects Effectively: A Complete Guide');
  });

  it('handles indicator filtering', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <IdeaBurstPage
        contentIdeas={mockContentIdeas}
        selectionIndicators={mockSelectionIndicators}
        onSelectIdea={jest.fn()}
        onFilterIdeas={jest.fn()}
        onSortIdeas={jest.fn()}
      />
    );

    const indicatorFilter = screen.getByLabelText('Filter by indicator');
    await user.selectOptions(indicatorFilter, 'seo_score');

    expect(screen.getByText('Filtering by SEO Score')).toBeInTheDocument();
  });
});
