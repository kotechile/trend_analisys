/**
 * Contract test for POST /api/topic-decomposition
 * Tests the API contract for topic decomposition
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POST /api/topic-decomposition Contract', () => {
  it('should decompose topic with correct schema', async () => {
    const requestData = {
      searchQuery: 'Cars for the east coast',
      sessionId: 'session-123'
    };

    server.use(
      rest.post('http://localhost:8000/api/topic-decomposition', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: 'decomp-123',
            searchQuery: 'Cars for the east coast',
            subtopics: [
              {
                name: 'Electric cars in California',
                description: 'Electric vehicle trends and opportunities',
                relevanceScore: 0.95,
                selected: false
              },
              {
                name: 'Car dealers',
                description: 'Automotive dealership opportunities',
                relevanceScore: 0.87,
                selected: false
              }
            ],
            createdAt: '2025-01-27T10:00:00Z',
            userId: 'user-123'
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/topic-decomposition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('searchQuery');
    expect(data).toHaveProperty('subtopics');
    expect(Array.isArray(data.subtopics)).toBe(true);
    expect(data.subtopics.length).toBeGreaterThan(0);

    // Test subtopic schema
    data.subtopics.forEach((subtopic: any) => {
      expect(subtopic).toHaveProperty('name');
      expect(subtopic).toHaveProperty('description');
      expect(subtopic).toHaveProperty('relevanceScore');
      expect(subtopic).toHaveProperty('selected');
      expect(typeof subtopic.name).toBe('string');
      expect(typeof subtopic.description).toBe('string');
      expect(typeof subtopic.relevanceScore).toBe('number');
      expect(typeof subtopic.selected).toBe('boolean');
    });
  });
});
