const request = require('supertest');

describe('Production build serving', () => {
  let app;

  beforeAll(() => {
    // Ensure production mode and reload modules
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    ({ app } = require('../server'));
  });

  it('serves index.html at root', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text.toLowerCase()).toContain('<!doctype html>');
  });
});

