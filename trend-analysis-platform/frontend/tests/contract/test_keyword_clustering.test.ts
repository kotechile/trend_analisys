/**
 * Contract test for POST /api/keywords/cluster
 * Tests the API contract for keyword clustering
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POST /api/keywords/cluster Contract', () => {
  it('should cluster keywords with correct schema', async () => {
    const requestData = {
      keywords: ['electric cars', 'tesla', 'ev charging', 'hybrid vehicles'],
      algorithm: 'kmeans',
      sessionId: 'session-123'
    };

    server.use(
      rest.post('http://localhost:8000/api/keywords/cluster', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            clusters: [
              {
                id: 'cluster-1',
                name: 'Electric Vehicles',
                keywords: ['electric cars', 'tesla', 'ev charging'],
                avgVolume: 50000,
                avgDifficulty: 65,
                avgCPC: 2.50,
                selected: false,
                createdAt: '2025-01-27T10:00:00Z'
              },
              {
                id: 'cluster-2',
                name: 'Hybrid Vehicles',
                keywords: ['hybrid vehicles'],
                avgVolume: 25000,
                avgDifficulty: 45,
                avgCPC: 1.80,
                selected: false,
                createdAt: '2025-01-27T10:00:00Z'
              }
            ],
            totalClusters: 2
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/keywords/cluster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('clusters');
    expect(data).toHaveProperty('totalClusters');
    expect(Array.isArray(data.clusters)).toBe(true);
    expect(typeof data.totalClusters).toBe('number');

    // Test cluster schema
    data.clusters.forEach((cluster: any) => {
      expect(cluster).toHaveProperty('id');
      expect(cluster).toHaveProperty('name');
      expect(cluster).toHaveProperty('keywords');
      expect(cluster).toHaveProperty('avgVolume');
      expect(cluster).toHaveProperty('avgDifficulty');
      expect(cluster).toHaveProperty('avgCPC');
      expect(cluster).toHaveProperty('selected');
      expect(typeof cluster.name).toBe('string');
      expect(Array.isArray(cluster.keywords)).toBe(true);
      expect(typeof cluster.avgVolume).toBe('number');
      expect(typeof cluster.avgDifficulty).toBe('number');
      expect(typeof cluster.avgCPC).toBe('number');
    });
  });
});
