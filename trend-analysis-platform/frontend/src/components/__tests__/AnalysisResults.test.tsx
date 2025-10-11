/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AnalysisResults from '../AnalysisResults';
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

describe('AnalysisResults Component', () => {
  const mockAnalysisData = {
    report_id: 'test-report-id',
    file_id: 'test-file-id',
    summary: {
      total_keywords: 1000,
      high_opportunity_count: 250,
      medium_opportunity_count: 500,
      low_opportunity_count: 250,
      total_search_volume: 500000,
      average_difficulty: 45.2,
      average_cpc: 2.85
    },
    top_opportunities: {
      high_opportunity_keywords: [
        {
          keyword: 'best project management tools',
          search_volume: 12000,
          difficulty: 45,
          cpc: 2.50,
          opportunity_score: 85.5,
          category: 'high'
        },
        {
          keyword: 'project management software',
          search_volume: 8500,
          difficulty: 38,
          cpc: 3.20,
          opportunity_score: 82.1,
          category: 'high'
        }
      ],
      quick_wins: [
        {
          keyword: 'simple project management',
          search_volume: 800,
          difficulty: 20,
          cpc: 1.20,
          opportunity_score: 78.3,
          category: 'high'
        }
      ],
      high_volume_targets: [
        {
          keyword: 'best project management tools',
          search_volume: 12000,
          difficulty: 45,
          cpc: 2.50,
          opportunity_score: 85.5,
          category: 'high'
        }
      ]
    },
    content_recommendations: [
      {
        keyword: 'best project management tools',
        content_format: 'list-article',
        seo_score: 92
      }
    ],
    insights: [
      'Multiple low-competition keywords available for quick wins',
      'High commercial value keywords identified for monetization'
    ],
    next_steps: [
      'Prioritize high-opportunity keywords for immediate content creation',
      'Create pillar content around project management software comparisons'
    ],
    seo_content_ideas: [
      {
        id: 'idea-1',
        title: 'Best Project Management Tools for Remote Teams in 2024',
        content_type: 'list-article',
        primary_keywords: ['best project management tools', 'project management software'],
        secondary_keywords: ['remote work tools', 'team productivity'],
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
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analysis results correctly', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Top Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Content Recommendations')).toBeInTheDocument();
    expect(screen.getByText('SEO Content Ideas')).toBeInTheDocument();
  });

  it('displays summary statistics correctly', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    expect(screen.getByText('1,000')).toBeInTheDocument(); // total_keywords
    expect(screen.getByText('250')).toBeInTheDocument(); // high_opportunity_count
    expect(screen.getByText('500')).toBeInTheDocument(); // medium_opportunity_count
    expect(screen.getByText('500,000')).toBeInTheDocument(); // total_search_volume
    expect(screen.getByText('45.2')).toBeInTheDocument(); // average_difficulty
    expect(screen.getByText('$2.85')).toBeInTheDocument(); // average_cpc
  });

  it('displays top opportunities correctly', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    expect(screen.getByText('High Opportunity Keywords')).toBeInTheDocument();
    expect(screen.getByText('Quick Wins')).toBeInTheDocument();
    expect(screen.getByText('High Volume Targets')).toBeInTheDocument();

    expect(screen.getByText('best project management tools')).toBeInTheDocument();
    expect(screen.getByText('project management software')).toBeInTheDocument();
    expect(screen.getByText('simple project management')).toBeInTheDocument();
  });

  it('displays content recommendations correctly', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    expect(screen.getByText('best project management tools')).toBeInTheDocument();
    expect(screen.getByText('List Article')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument(); // seo_score
  });

  it('displays insights and next steps correctly', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    expect(screen.getByText('Insights & Next Steps')).toBeInTheDocument();
    expect(screen.getByText('Multiple low-competition keywords available for quick wins')).toBeInTheDocument();
    expect(screen.getByText('Prioritize high-opportunity keywords for immediate content creation')).toBeInTheDocument();
  });

  it('displays SEO content ideas correctly', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    expect(screen.getByText('Best Project Management Tools for Remote Teams in 2024')).toBeInTheDocument();
    expect(screen.getByText('List Article')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument(); // seo_optimization_score
    expect(screen.getByText('88')).toBeInTheDocument(); // traffic_potential_score
    expect(screen.getByText('45,000')).toBeInTheDocument(); // total_search_volume
  });

  it('handles keyword table interactions', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    // Test sorting
    const sortButton = screen.getByText('Search Volume');
    await user.click(sortButton);

    // Test filtering
    const filterInput = screen.getByPlaceholderText('Filter keywords...');
    await user.type(filterInput, 'project management');

    expect(filterInput).toHaveValue('project management');
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    
    // Create data with many keywords to test pagination
    const largeAnalysisData = {
      ...mockAnalysisData,
      top_opportunities: {
        ...mockAnalysisData.top_opportunities,
        high_opportunity_keywords: Array.from({ length: 50 }, (_, i) => ({
          keyword: `keyword ${i}`,
          search_volume: 1000 + i * 100,
          difficulty: 20 + i,
          cpc: 1.0 + i * 0.1,
          opportunity_score: 70 + i,
          category: 'high'
        }))
      }
    };

    renderWithTheme(
      <AnalysisResults
        analysisData={largeAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    // Test pagination controls
    const nextPageButton = screen.getByLabelText('Go to next page');
    await user.click(nextPageButton);

    const prevPageButton = screen.getByLabelText('Go to previous page');
    await user.click(prevPageButton);
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    
    mockApi.exportReport.mockResolvedValue({
      content: 'exported data',
      filename: 'analysis_report.json',
      content_type: 'application/json'
    });

    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    const exportButton = screen.getByText('Export Report');
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockApi.exportReport).toHaveBeenCalledWith('test-report-id', 'json');
    });
  });

  it('handles loading state', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={null}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading analysis results...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    renderWithTheme(
      <AnalysisResults
        analysisData={null}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
        error="Analysis failed"
      />
    );

    expect(screen.getByText('Error: Analysis failed')).toBeInTheDocument();
  });

  it('handles empty results', () => {
    const emptyAnalysisData = {
      ...mockAnalysisData,
      top_opportunities: {
        high_opportunity_keywords: [],
        quick_wins: [],
        high_volume_targets: []
      },
      seo_content_ideas: []
    };

    renderWithTheme(
      <AnalysisResults
        analysisData={emptyAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    expect(screen.getByText('No opportunities found')).toBeInTheDocument();
    expect(screen.getByText('No content ideas generated')).toBeInTheDocument();
  });

  it('handles keyword selection', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    const keywordCheckbox = screen.getByLabelText('Select best project management tools');
    await user.click(keywordCheckbox);

    expect(keywordCheckbox).toBeChecked();
  });

  it('handles content idea expansion', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    const expandButton = screen.getByText('View Details');
    await user.click(expandButton);

    expect(screen.getByText('Primary Keywords')).toBeInTheDocument();
    expect(screen.getByText('Secondary Keywords')).toBeInTheDocument();
    expect(screen.getByText('Optimization Tips')).toBeInTheDocument();
  });

  it('handles responsive design', () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithTheme(
      <AnalysisResults
        analysisData={mockAnalysisData}
        onStartAnalysis={jest.fn()}
        onViewReport={jest.fn()}
      />
    );

    // Component should still render correctly on mobile
    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
  });
});
