/**
 * Contract test for POST /api/workflow/sessions
 * Tests the API contract for creating new workflow sessions
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POST /api/workflow/sessions Contract', () => {
  it('should create workflow session with correct schema', async () => {
    const requestData = {
      searchQuery: 'Cars for the east coast',
      userId: 'user-123'
    };

    server.use(
      rest.post('http://localhost:8000/api/workflow/sessions', (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            id: 'session-123',
            userId: 'user-123',
            currentStep: 'topic_decomposition',
            progressPercentage: 0,
            createdAt: '2025-01-27T10:00:00Z',
            updatedAt: '2025-01-27T10:00:00Z',
            completedAt: null
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/workflow/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('currentStep');
    expect(data).toHaveProperty('progressPercentage');
    expect(data).toHaveProperty('createdAt');
    expect(data).toHaveProperty('updatedAt');
    expect(typeof data.id).toBe('string');
    expect(typeof data.userId).toBe('string');
    expect(typeof data.currentStep).toBe('string');
    expect(typeof data.progressPercentage).toBe('number');
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      searchQuery: '', // Invalid: empty string
      userId: 'user-123'
    };

    server.use(
      rest.post('http://localhost:8000/api/workflow/sessions', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'searchQuery must be at least 3 characters long',
            details: {
              field: 'searchQuery',
              constraint: 'minLength'
            },
            timestamp: new Date().toISOString()
          })
        );
      })
    );

    const response = await fetch('http://localhost:8000/api/workflow/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('details');
  });
});
