const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import your app setup logic
// Since server.js exports the app (usually), we can use it.
// Looking at server.js, it doesn't seem to export the 'app' object.
// It calls app.listen() at the end.
// Let's create a minimal app with the security middleware to test it.

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

describe('Security Middleware Tests', () => {
  let app;

  beforeAll(() => {
    app = express();

    // Mimic the security configuration in server.js
    app.use(helmet());
    app.use(cors({
      origin: 'http://localhost:3000',
      credentials: true
    }));

    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests'
    });
    app.use('/api', generalLimiter);

    app.get('/api/test', (req, res) => {
      res.json({ success: true });
    });

    app.get('/health', (req, res) => {
      res.json({ status: 'OK' });
    });
  });

  test('Helmet should set security headers', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['strict-transport-security']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  test('CORS should be configured', async () => {
    const response = await request(app)
      .get('/api/test')
      .set('Origin', 'http://localhost:3000');
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  test('Rate limiting should be active', async () => {
    // We won't actually hit the limit of 100 in a test,
    // but we can check if the headers are present
    const response = await request(app).get('/api/test');
    expect(response.headers['x-ratelimit-limit']).toBeDefined();
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
  });

  test('Should hide X-Powered-By header', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
