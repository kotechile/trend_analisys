/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SEOContentIdeas from '../SEOContentIdeas';

// Create a theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SEOContentIdeas Component', () => {
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
        'Create comparison sections for commercial keywords like \'Asana vs Trello\'',
        'Use secondary keywords like \'remote work tools\' in H2 and H3 headings',
        'Include long-tail keywords in meta descriptions',
        'Add internal links to related project management guides'
      ],
      content_outline: 'Introduction → Top 10 Tools → Detailed Reviews → Comparison Table → Conclusion'
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
        'Create step-by-step sections for informational keywords',
        'Use secondary keywords like \'project planning\' in H2 headings',
        'Include FAQ section for long-tail keywords',
        'Add visual elements like project management diagrams'
      ],
      content_outline: 'Introduction → Project Planning → Execution → Monitoring → Conclusion'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SEO content ideas correctly', () => {
    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    expect(screen.getByText('SEO Content Ideas')).toBeInTheDocument();
    expect(screen.getByText('Best Project Management Tools for Remote Teams in 2024')).toBeInTheDocument();
    expect(screen.getByText('How to Manage Projects Effectively: A Complete Guide')).toBeInTheDocument();
  });

  it('displays content idea details correctly', () => {
    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    // Check first content idea details
    expect(screen.getByText('List Article')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument(); // seo_optimization_score
    expect(screen.getByText('88')).toBeInTheDocument(); // traffic_potential_score
    expect(screen.getByText('45,000')).toBeInTheDocument(); // total_search_volume
    expect(screen.getByText('45')).toBeInTheDocument(); // average_difficulty
    expect(screen.getByText('$3.20')).toBeInTheDocument(); // average_cpc
  });

  it('displays primary and secondary keywords correctly', () => {
    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    expect(screen.getByText('best project management tools')).toBeInTheDocument();
    expect(screen.getByText('project management software')).toBeInTheDocument();
    expect(screen.getByText('team collaboration software')).toBeInTheDocument();
    expect(screen.getByText('remote work tools')).toBeInTheDocument();
    expect(screen.getByText('project tracking')).toBeInTheDocument();
    expect(screen.getByText('workflow management')).toBeInTheDocument();
  });

  it('handles content idea selection', async () => {
    const user = userEvent.setup();
    const mockOnSelectIdea = jest.fn();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={mockOnSelectIdea}
        onExportIdeas={jest.fn()}
      />
    );

    const selectButton = screen.getByText('Select Idea');
    await user.click(selectButton);

    expect(mockOnSelectIdea).toHaveBeenCalledWith(mockContentIdeas[0]);
  });

  it('handles content idea expansion', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const expandButton = screen.getByText('View Details');
    await user.click(expandButton);

    expect(screen.getByText('Primary Keywords')).toBeInTheDocument();
    expect(screen.getByText('Secondary Keywords')).toBeInTheDocument();
    expect(screen.getByText('Optimization Tips')).toBeInTheDocument();
    expect(screen.getByText('Content Outline')).toBeInTheDocument();
  });

  it('displays optimization tips correctly', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const expandButton = screen.getByText('View Details');
    await user.click(expandButton);

    expect(screen.getByText('Include \'best project management tools\' in your title and first paragraph')).toBeInTheDocument();
    expect(screen.getByText('Create comparison sections for commercial keywords like \'Asana vs Trello\'')).toBeInTheDocument();
    expect(screen.getByText('Use secondary keywords like \'remote work tools\' in H2 and H3 headings')).toBeInTheDocument();
  });

  it('displays content outline correctly', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const expandButton = screen.getByText('View Details');
    await user.click(expandButton);

    expect(screen.getByText('Introduction → Top 10 Tools → Detailed Reviews → Comparison Table → Conclusion')).toBeInTheDocument();
  });

  it('handles filtering by content type', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const filterSelect = screen.getByLabelText('Filter by content type');
    await user.selectOptions(filterSelect, 'list-article');

    expect(screen.getByText('Best Project Management Tools for Remote Teams in 2024')).toBeInTheDocument();
    expect(screen.queryByText('How to Manage Projects Effectively: A Complete Guide')).not.toBeInTheDocument();
  });

  it('handles sorting by SEO score', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const sortSelect = screen.getByLabelText('Sort by');
    await user.selectOptions(sortSelect, 'seo_score');

    // Ideas should be sorted by SEO score (92, 89)
    const ideaCards = screen.getAllByTestId('content-idea-card');
    expect(ideaCards[0]).toHaveTextContent('Best Project Management Tools for Remote Teams in 2024');
    expect(ideaCards[1]).toHaveTextContent('How to Manage Projects Effectively: A Complete Guide');
  });

  it('handles sorting by traffic potential', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const sortSelect = screen.getByLabelText('Sort by');
    await user.selectOptions(sortSelect, 'traffic_potential');

    // Ideas should be sorted by traffic potential (88, 82)
    const ideaCards = screen.getAllByTestId('content-idea-card');
    expect(ideaCards[0]).toHaveTextContent('Best Project Management Tools for Remote Teams in 2024');
    expect(ideaCards[1]).toHaveTextContent('How to Manage Projects Effectively: A Complete Guide');
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    const mockOnExportIdeas = jest.fn();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={mockOnExportIdeas}
      />
    );

    const exportButton = screen.getByText('Export Ideas');
    await user.click(exportButton);

    expect(mockOnExportIdeas).toHaveBeenCalledWith(mockContentIdeas);
  });

  it('handles bulk selection', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('Select all ideas');
    await user.click(selectAllCheckbox);

    const individualCheckboxes = screen.getAllByRole('checkbox');
    individualCheckboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search content ideas...');
    await user.type(searchInput, 'project management');

    expect(screen.getByText('Best Project Management Tools for Remote Teams in 2024')).toBeInTheDocument();
    expect(screen.getByText('How to Manage Projects Effectively: A Complete Guide')).toBeInTheDocument();
  });

  it('handles empty content ideas', () => {
    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={[]}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    expect(screen.getByText('No content ideas generated')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your keyword analysis parameters')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={[]}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Generating content ideas...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={[]}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
        error="Failed to generate content ideas"
      />
    );

    expect(screen.getByText('Error: Failed to generate content ideas')).toBeInTheDocument();
  });

  it('displays score indicators correctly', () => {
    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    // Check for score indicators (color coding)
    const seoScore = screen.getByText('92');
    const trafficScore = screen.getByText('88');

    expect(seoScore).toBeInTheDocument();
    expect(trafficScore).toBeInTheDocument();
  });

  it('handles responsive design', () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    // Component should still render correctly on mobile
    expect(screen.getByText('SEO Content Ideas')).toBeInTheDocument();
  });

  it('handles keyword highlighting', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SEOContentIdeas
        contentIdeas={mockContentIdeas}
        onSelectIdea={jest.fn()}
        onExportIdeas={jest.fn()}
      />
    );

    const expandButton = screen.getByText('View Details');
    await user.click(expandButton);

    // Check that keywords are highlighted
    const primaryKeywords = screen.getByText('best project management tools');
    const secondaryKeywords = screen.getByText('remote work tools');

    expect(primaryKeywords).toBeInTheDocument();
    expect(secondaryKeywords).toBeInTheDocument();
  });
});
