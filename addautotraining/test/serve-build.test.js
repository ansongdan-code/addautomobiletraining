const request = require('supertest');

describe('Production build serving', () => {
  let app;

  beforeAll(() => {
    // Instead of requiring the full server (which loads extra modules),
    // create a minimal express instance that serves the built files for testing.
    const express = require('express');
    const path = require('path');
    const appLocal = express();
    appLocal.use(express.static(path.join(__dirname, '..', 'build')));
    app = appLocal;
  });

  it('serves index.html at root', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text.toLowerCase()).toContain('<!doctype html>');
  });
});


