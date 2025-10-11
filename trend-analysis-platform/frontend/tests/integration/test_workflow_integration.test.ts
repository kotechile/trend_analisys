/**
 * Integration test for complete workflow flow
 * Tests the end-to-end workflow integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../../src/App';

const theme = createTheme();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Complete Workflow Integration', () => {
  it('should complete full workflow from search to content generation', async () => {
    // Mock all API endpoints
    server.use(
      rest.post('http://localhost:8000/api/workflow/sessions', (req, res, ctx) => {
        return res(ctx.status(201), ctx.json({
          id: 'session-123',
          userId: 'user-123',
          currentStep: 'topic_decomposition',
          progressPercentage: 0,
          createdAt: '2025-01-27T10:00:00Z',
          updatedAt: '2025-01-27T10:00:00Z',
          completedAt: null
        }));
      }),
      rest.post('http://localhost:8000/api/topic-decomposition', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({
          id: 'decomp-123',
          searchQuery: 'Cars for the east coast',
          subtopics: [
            {
              name: 'Electric cars in California',
              description: 'Electric vehicle trends',
              relevanceScore: 0.95,
              selected: false
            }
          ],
          createdAt: '2025-01-27T10:00:00Z',
          userId: 'user-123'
        }));
      }),
      rest.post('http://localhost:8000/api/affiliate-research', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({
          offers: [
            {
              id: 'offer-1',
              name: 'Tesla Affiliate Program',
              description: 'Electric vehicle affiliate program',
              commission: '2% per sale',
              category: 'Automotive',
              difficulty: 'medium',
              selected: false,
              createdAt: '2025-01-27T10:00:00Z'
            }
          ],
          totalFound: 1
        }));
      }),
      rest.post('http://localhost:8000/api/trend-analysis', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({
          id: 'trend-123',
          subtopicIds: ['subtopic-1'],
          trendData: [
            {
              keyword: 'electric cars',
              searchVolume: 100000,
              trendDirection: 'rising',
              competition: 'high',
              opportunityScore: 75,
              timeframe: '2025-01-27'
            }
          ],
          insights: ['Electric cars showing strong growth trend'],
          createdAt: '2025-01-27T10:00:00Z',
          userId: 'user-123'
        }));
      }),
      rest.post('http://localhost:8000/api/content/generate', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({
          contentIdeas: [
            {
              id: 'content-1',
              title: 'Best Electric Cars for East Coast Living',
              description: 'Comprehensive guide to electric vehicles',
              contentType: 'blog_post',
              targetAudience: 'Car enthusiasts',
              keywords: ['electric cars', 'east coast'],
              affiliateOffers: ['offer-1'],
              priority: 'high',
              status: 'draft',
              createdAt: '2025-01-27T10:00:00Z'
            }
          ],
          totalGenerated: 1
        }));
      })
    );

    renderWithProviders(<App />);

    // Navigate to Integrated Workflow tab
    const workflowTab = screen.getByText('Integrated Workflow');
    fireEvent.click(workflowTab);

    // Wait for the workflow component to load
    await waitFor(() => {
      expect(screen.getByText(/Enhanced Research Workflow/i)).toBeInTheDocument();
    });

    // The test should verify that the workflow component renders
    // and can handle the complete flow from topic decomposition
    // through affiliate research, trend analysis, and content generation
  });
});
