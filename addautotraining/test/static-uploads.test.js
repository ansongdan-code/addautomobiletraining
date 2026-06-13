const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

describe('Static uploads serving', () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filename = 'test-static.txt';
  const filePath = path.join(uploadsDir, filename);

  beforeAll(() => {
    // Ensure uploads directory exists
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(filePath, 'hello from uploads');
  });

  afterAll(() => {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
  });

  it('serves files under /uploads', async () => {
    const app = express();
    app.use('/uploads', express.static(uploadsDir, {
      maxAge: '7d',
      etag: true,
      lastModified: true
    }));

    const res = await request(app).get(`/uploads/${filename}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('hello from uploads');
  });
});

