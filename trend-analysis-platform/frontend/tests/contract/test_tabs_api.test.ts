/**
 * Contract test for GET /api/tabs
 * Tests the API contract for retrieving all available tabs
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock server for API testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/tabs Contract', () => {
  it('should return list of tabs with correct schema', async () => {
    // Mock the API response
    server.use(
      rest.get('http://localhost:8000/api/tabs', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            tabs: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                component: 'Dashboard',
                icon: 'dashboard',
                disabled: false,
                loading: false,
                error: null
              },
              {
                id: 'affiliate-research',
                label: 'Affiliate Research',
                component: 'AffiliateResearch',
                icon: 'search',
                disabled: false,
                loading: false,
                error: null
              },
              {
                id: 'integrated-workflow',
                label: 'Integrated Workflow',
                component: 'EnhancedWorkflow',
                icon: 'workflow',
                disabled: false,
                loading: false,
                error: null
              }
            ],
            activeTab: 0
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/tabs');
    const data = await response.json();

    // Test response structure
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('tabs');
    expect(data).toHaveProperty('activeTab');
    expect(Array.isArray(data.tabs)).toBe(true);
    expect(typeof data.activeTab).toBe('number');

    // Test tab schema
    data.tabs.forEach((tab: any) => {
      expect(tab).toHaveProperty('id');
      expect(tab).toHaveProperty('label');
      expect(tab).toHaveProperty('component');
      expect(typeof tab.id).toBe('string');
      expect(typeof tab.label).toBe('string');
      expect(typeof tab.component).toBe('string');
      expect(typeof tab.disabled).toBe('boolean');
      expect(typeof tab.loading).toBe('boolean');
    });
  });

  it('should handle server errors correctly', async () => {
    server.use(
      rest.get('http://localhost:8000/api/tabs', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve tabs',
            details: null,
            timestamp: new Date().toISOString()
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/tabs');
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');
  });
});
