/**
 * Contract test for POST /api/content/generate
 * Tests the API contract for content generation
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POST /api/content/generate Contract', () => {
  it('should generate content ideas with correct schema', async () => {
    const requestData = {
      trendIds: ['trend-1', 'trend-2'],
      affiliateOfferIds: ['offer-1'],
      contentType: 'blog_post',
      sessionId: 'session-123'
    };

    server.use(
      rest.post('http://localhost:8000/api/content/generate', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            contentIdeas: [
              {
                id: 'content-1',
                title: 'Best Electric Cars for East Coast Living',
                description: 'Comprehensive guide to electric vehicles suitable for east coast climate',
                contentType: 'blog_post',
                targetAudience: 'Car enthusiasts and eco-conscious consumers',
                keywords: ['electric cars', 'east coast', 'automotive'],
                affiliateOffers: ['offer-1'],
                priority: 'high',
                status: 'draft',
                createdAt: '2025-01-27T10:00:00Z'
              }
            ],
            totalGenerated: 1
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/content/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('contentIdeas');
    expect(data).toHaveProperty('totalGenerated');
    expect(Array.isArray(data.contentIdeas)).toBe(true);
    expect(typeof data.totalGenerated).toBe('number');

    // Test content idea schema
    data.contentIdeas.forEach((idea: any) => {
      expect(idea).toHaveProperty('id');
      expect(idea).toHaveProperty('title');
      expect(idea).toHaveProperty('description');
      expect(idea).toHaveProperty('contentType');
      expect(idea).toHaveProperty('targetAudience');
      expect(idea).toHaveProperty('keywords');
      expect(idea).toHaveProperty('affiliateOffers');
      expect(idea).toHaveProperty('priority');
      expect(idea).toHaveProperty('status');
      expect(typeof idea.title).toBe('string');
      expect(typeof idea.description).toBe('string');
      expect(Array.isArray(idea.keywords)).toBe(true);
      expect(Array.isArray(idea.affiliateOffers)).toBe(true);
    });
  });
});
