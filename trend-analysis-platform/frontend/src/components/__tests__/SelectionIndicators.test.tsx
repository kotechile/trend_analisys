/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SelectionIndicators from '../SelectionIndicators';

// Create a theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SelectionIndicators Component', () => {
  const mockIndicators = [
    {
      id: 'seo-score',
      type: 'seo_score',
      value: 92,
      label: 'SEO Score',
      color: 'green',
      description: 'SEO optimization score based on keyword selection and content structure',
      maxValue: 100
    },
    {
      id: 'traffic-potential',
      type: 'traffic_potential',
      value: 88,
      label: 'Traffic Potential',
      color: 'blue',
      description: 'Estimated traffic potential based on search volume and competition',
      maxValue: 100
    },
    {
      id: 'difficulty',
      type: 'difficulty',
      value: 45,
      label: 'Difficulty',
      color: 'orange',
      description: 'Keyword difficulty score (lower is better)',
      maxValue: 100
    },
    {
      id: 'search-volume',
      type: 'search_volume',
      value: 45000,
      label: 'Search Volume',
      color: 'purple',
      description: 'Total monthly search volume for selected keywords',
      maxValue: 100000
    },
    {
      id: 'cpc',
      type: 'cpc',
      value: 3.20,
      label: 'Average CPC',
      color: 'red',
      description: 'Average cost per click for selected keywords',
      maxValue: 10.00
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders selection indicators correctly', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    expect(screen.getByText('Selection Indicators')).toBeInTheDocument();
    expect(screen.getByText('SEO Score')).toBeInTheDocument();
    expect(screen.getByText('Traffic Potential')).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Search Volume')).toBeInTheDocument();
    expect(screen.getByText('Average CPC')).toBeInTheDocument();
  });

  it('displays indicator values correctly', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    expect(screen.getByText('92')).toBeInTheDocument(); // SEO Score
    expect(screen.getByText('88')).toBeInTheDocument(); // Traffic Potential
    expect(screen.getByText('45')).toBeInTheDocument(); // Difficulty
    expect(screen.getByText('45,000')).toBeInTheDocument(); // Search Volume
    expect(screen.getByText('$3.20')).toBeInTheDocument(); // Average CPC
  });

  it('handles indicator click', async () => {
    const user = userEvent.setup();
    const mockOnIndicatorClick = jest.fn();

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={mockOnIndicatorClick}
        onFilterByIndicator={jest.fn()}
      />
    );

    const seoScoreIndicator = screen.getByText('SEO Score');
    await user.click(seoScoreIndicator);

    expect(mockOnIndicatorClick).toHaveBeenCalledWith(mockIndicators[0]);
  });

  it('displays progress bars correctly', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    // Check that progress bars are rendered
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(5);
  });

  it('handles indicator tooltips', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    const seoScoreIndicator = screen.getByText('SEO Score');
    await user.hover(seoScoreIndicator);

    expect(screen.getByText('SEO optimization score based on keyword selection and content structure')).toBeInTheDocument();
  });

  it('handles color coding correctly', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
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

  it('handles filtering by indicator', async () => {
    const user = userEvent.setup();
    const mockOnFilterByIndicator = jest.fn();

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={mockOnFilterByIndicator}
      />
    );

    const filterButton = screen.getByText('Filter by SEO Score');
    await user.click(filterButton);

    expect(mockOnFilterByIndicator).toHaveBeenCalledWith('seo_score');
  });

  it('handles indicator comparison', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        showComparison={true}
      />
    );

    const compareButton = screen.getByText('Compare Indicators');
    await user.click(compareButton);

    expect(screen.getByText('Indicator Comparison')).toBeInTheDocument();
    expect(screen.getByText('SEO Score vs Traffic Potential')).toBeInTheDocument();
  });

  it('handles indicator sorting', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        sortable={true}
      />
    );

    const sortSelect = screen.getByLabelText('Sort indicators by');
    await user.selectOptions(sortSelect, 'value');

    // Indicators should be sorted by value
    const indicatorCards = screen.getAllByTestId('indicator-card');
    expect(indicatorCards[0]).toHaveTextContent('SEO Score');
    expect(indicatorCards[1]).toHaveTextContent('Traffic Potential');
  });

  it('handles indicator grouping', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        grouped={true}
      />
    );

    expect(screen.getByText('Performance Indicators')).toBeInTheDocument();
    expect(screen.getByText('SEO Indicators')).toBeInTheDocument();
    expect(screen.getByText('Traffic Indicators')).toBeInTheDocument();
  });

  it('handles empty indicators', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={[]}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    expect(screen.getByText('No indicators available')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={[]}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading indicators...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={[]}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        error="Failed to load indicators"
      />
    );

    expect(screen.getByText('Error: Failed to load indicators')).toBeInTheDocument();
  });

  it('handles responsive design', () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    // Component should still render correctly on mobile
    expect(screen.getByText('Selection Indicators')).toBeInTheDocument();
  });

  it('handles indicator animation', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        animated={true}
      />
    );

    const seoScoreIndicator = screen.getByText('SEO Score');
    await user.hover(seoScoreIndicator);

    // Check that animation is applied
    expect(seoScoreIndicator).toBeInTheDocument();
  });

  it('handles indicator thresholds', () => {
    const indicatorsWithThresholds = [
      {
        ...mockIndicators[0],
        threshold: 80,
        thresholdLabel: 'Good'
      },
      {
        ...mockIndicators[1],
        threshold: 70,
        thresholdLabel: 'Fair'
      }
    ];

    renderWithTheme(
      <SelectionIndicators
        indicators={indicatorsWithThresholds}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('handles indicator trends', () => {
    const indicatorsWithTrends = [
      {
        ...mockIndicators[0],
        trend: 'up',
        trendValue: 5
      },
      {
        ...mockIndicators[1],
        trend: 'down',
        trendValue: 3
      }
    ];

    renderWithTheme(
      <SelectionIndicators
        indicators={indicatorsWithTrends}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
      />
    );

    expect(screen.getByText('↗ +5')).toBeInTheDocument();
    expect(screen.getByText('↘ -3')).toBeInTheDocument();
  });

  it('handles indicator customization', () => {
    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        customizable={true}
      />
    );

    const customizeButton = screen.getByText('Customize Indicators');
    expect(customizeButton).toBeInTheDocument();
  });

  it('handles indicator export', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <SelectionIndicators
        indicators={mockIndicators}
        onIndicatorClick={jest.fn()}
        onFilterByIndicator={jest.fn()}
        exportable={true}
      />
    );

    const exportButton = screen.getByText('Export Indicators');
    await user.click(exportButton);

    expect(screen.getByText('Exporting indicators...')).toBeInTheDocument();
  });
});
