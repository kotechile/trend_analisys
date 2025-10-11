/**
 * Integration test for tab navigation
 * Tests the tab navigation functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/App';

const theme = createTheme();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Tab Navigation Integration', () => {
  it('should navigate between all tabs correctly', () => {
    renderWithProviders(<App />);

    // Check that all tabs are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Affiliate Research')).toBeInTheDocument();
    expect(screen.getByText('Integrated Workflow')).toBeInTheDocument();
    expect(screen.getByText('Trend Validation')).toBeInTheDocument();
    expect(screen.getByText('Idea Burst')).toBeInTheDocument();
    expect(screen.getByText('Keyword Armoury')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Test navigation to Affiliate Research tab
    const affiliateTab = screen.getByText('Affiliate Research');
    fireEvent.click(affiliateTab);
    expect(screen.getByText(/Affiliate Research/i)).toBeInTheDocument();

    // Test navigation to Integrated Workflow tab
    const workflowTab = screen.getByText('Integrated Workflow');
    fireEvent.click(workflowTab);
    // Note: This will show placeholder until EnhancedWorkflow component is created
    expect(screen.getByText(/Integrated Workflow/i)).toBeInTheDocument();

    // Test navigation to other tabs
    const trendTab = screen.getByText('Trend Validation');
    fireEvent.click(trendTab);
    expect(screen.getByText('Trend Validation')).toBeInTheDocument();
    expect(screen.getByText('This feature is coming soon!')).toBeInTheDocument();
  });

  it('should maintain active tab state correctly', () => {
    renderWithProviders(<App />);

    // Initially Dashboard should be active
    const dashboardTab = screen.getByText('Dashboard');
    expect(dashboardTab.closest('[role="tab"]')).toHaveAttribute('aria-selected', 'true');

    // Click on Affiliate Research tab
    const affiliateTab = screen.getByText('Affiliate Research');
    fireEvent.click(affiliateTab);
    expect(affiliateTab.closest('[role="tab"]')).toHaveAttribute('aria-selected', 'true');
    expect(dashboardTab.closest('[role="tab"]')).toHaveAttribute('aria-selected', 'false');
  });
});
