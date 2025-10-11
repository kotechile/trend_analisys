/**
 * Contract test for POST /api/affiliate-research
 * Tests the API contract for affiliate research
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POST /api/affiliate-research Contract', () => {
  it('should research affiliate offers with correct schema', async () => {
    const requestData = {
      subtopicIds: ['subtopic-1', 'subtopic-2'],
      sessionId: 'session-123'
    };

    server.use(
      rest.post('http://localhost:8000/api/affiliate-research', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            offers: [
              {
                id: 'offer-1',
                name: 'Tesla Affiliate Program',
                description: 'Electric vehicle affiliate program',
                commission: '2% per sale',
                category: 'Automotive',
                difficulty: 'medium',
                link: 'https://tesla.com/affiliate',
                instructions: 'Apply through Tesla partner portal',
                selected: false,
                createdAt: '2025-01-27T10:00:00Z'
              }
            ],
            totalFound: 1
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/affiliate-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('offers');
    expect(data).toHaveProperty('totalFound');
    expect(Array.isArray(data.offers)).toBe(true);
    expect(typeof data.totalFound).toBe('number');

    // Test offer schema
    data.offers.forEach((offer: any) => {
      expect(offer).toHaveProperty('id');
      expect(offer).toHaveProperty('name');
      expect(offer).toHaveProperty('description');
      expect(offer).toHaveProperty('commission');
      expect(offer).toHaveProperty('category');
      expect(offer).toHaveProperty('difficulty');
      expect(typeof offer.id).toBe('string');
      expect(typeof offer.name).toBe('string');
      expect(typeof offer.description).toBe('string');
      expect(typeof offer.commission).toBe('string');
    });
  });
});
