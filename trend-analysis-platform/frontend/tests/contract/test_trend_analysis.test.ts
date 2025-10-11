/**
 * Contract test for POST /api/trend-analysis
 * Tests the API contract for trend analysis
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POST /api/trend-analysis Contract', () => {
  it('should analyze trends with correct schema', async () => {
    const requestData = {
      subtopicIds: ['subtopic-1', 'subtopic-2'],
      sessionId: 'session-123'
    };

    server.use(
      rest.post('http://localhost:8000/api/trend-analysis', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: 'trend-123',
            subtopicIds: ['subtopic-1', 'subtopic-2'],
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
            insights: [
              'Electric cars showing strong growth trend',
              'High competition but good opportunity score'
            ],
            createdAt: '2025-01-27T10:00:00Z',
            userId: 'user-123'
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/trend-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('subtopicIds');
    expect(data).toHaveProperty('trendData');
    expect(data).toHaveProperty('insights');
    expect(Array.isArray(data.trendData)).toBe(true);
    expect(Array.isArray(data.insights)).toBe(true);

    // Test trend data schema
    data.trendData.forEach((trend: any) => {
      expect(trend).toHaveProperty('keyword');
      expect(trend).toHaveProperty('searchVolume');
      expect(trend).toHaveProperty('trendDirection');
      expect(trend).toHaveProperty('competition');
      expect(trend).toHaveProperty('opportunityScore');
      expect(typeof trend.keyword).toBe('string');
      expect(typeof trend.searchVolume).toBe('number');
      expect(typeof trend.opportunityScore).toBe('number');
    });
  });
});
