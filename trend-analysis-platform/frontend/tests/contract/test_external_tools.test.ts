/**
 * Contract test for POST /api/external-tools/process
 * Tests the API contract for external tool integration
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POST /api/external-tools/process Contract', () => {
  it('should process external tool data with correct schema', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['keyword,volume,difficulty,cpc\n"electric cars",50000,65,2.50'], { type: 'text/csv' }));
    formData.append('toolName', 'semrush');
    formData.append('sessionId', 'session-123');

    server.use(
      rest.post('http://localhost:8000/api/external-tools/process', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            processedKeywords: 1,
            clusters: [
              {
                id: 'cluster-1',
                name: 'Electric Vehicles',
                keywords: ['electric cars'],
                avgVolume: 50000,
                avgDifficulty: 65,
                avgCPC: 2.50,
                selected: false,
                createdAt: '2025-01-27T10:00:00Z'
              }
            ]
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/external-tools/process', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('processedKeywords');
    expect(data).toHaveProperty('clusters');
    expect(typeof data.processedKeywords).toBe('number');
    expect(Array.isArray(data.clusters)).toBe(true);
  });

  it('should handle invalid file format', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['invalid data'], { type: 'text/plain' }));
    formData.append('toolName', 'semrush');
    formData.append('sessionId', 'session-123');

    server.use(
      rest.post('http://localhost:8000/api/external-tools/process', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Invalid File Format',
            message: 'File must be a valid CSV with required columns',
            details: {
              expectedColumns: ['keyword', 'volume', 'difficulty', 'cpc'],
              receivedColumns: []
            },
            timestamp: new Date().toISOString()
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/external-tools/process', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('details');
  });
});
