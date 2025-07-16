const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Mock express app setup
const express = require('express');
const authRoutes = require('../routes/auth');
const adminRoutes = require('../routes/admin');
const { protect, isAdmin } = require('../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Test database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/addautotraining_test';

describe('Admin Login Test Suite', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear test data
    await User.deleteMany({});
  });

  beforeEach(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create admin user
    adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    await adminUser.save();

    // Create regular user
    regularUser = new User({
      name: 'Regular User',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'student',
      isActive: true,
      isEmailVerified: true
    });
    await regularUser.save();

    // Generate tokens
    adminToken = generateToken(adminUser._id);
    regularToken = generateToken(regularUser._id);
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Admin Authentication Tests', () => {
    test('Admin should be able to login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(adminUser._id.toString());
    });

    test('Admin login should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Invalid credentials');
    });

    test('Admin login should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Invalid credentials');
    });

    test('Admin login should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    test('Admin login should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    test('Inactive admin should not be able to login', async () => {
      // Deactivate admin
      await User.findByIdAndUpdate(adminUser._id, { isActive: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');

      // Try to access admin endpoint with token
      const adminResponse = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${response.body.token}`);

      expect(adminResponse.status).toBe(401);
      expect(adminResponse.body.error).toBe('Account is deactivated');
    });
  });

  describe('Admin Authorization Tests', () => {
    test('Admin should be able to access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
    });

    test('Regular user should not be able to access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });

    test('Unauthenticated user should not be able to access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authorized to access this route');
    });

    test('Admin should be able to access user management', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('Admin should be able to update user roles', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'instructor',
          isActive: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('instructor');
    });

    test('Admin should be able to access course management', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('courses');
    });

    test('Admin should be able to access blog management', async () => {
      const response = await request(app)
        .get('/api/admin/blog/posts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('posts');
    });

    test('Admin should be able to access website settings', async () => {
      const response = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('Admin should be able to access analytics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('topCourses');
      expect(response.body.data).toHaveProperty('revenueData');
    });
  });

  describe('Super Admin Tests', () => {
    let superAdminUser;
    let superAdminToken;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      superAdminUser = new User({
        name: 'Super Admin',
        email: 'superadmin@test.com',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        isEmailVerified: true
      });
      await superAdminUser.save();
      
      superAdminToken = generateToken(superAdminUser._id);
    });

    test('Super admin should be able to access all admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Super admin should be able to manage users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Token Validation Tests', () => {
    test('Invalid token should be rejected', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authorized to access this route');
    });

    test('Expired token should be rejected', async () => {
      const expiredToken = jwt.sign(
        { id: adminUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authorized to access this route');
    });

    test('Token with non-existent user should be rejected', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeToken = jwt.sign(
        { id: fakeUserId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Error Handling Tests', () => {
    test('Should handle database errors gracefully', async () => {
      // Close database connection to simulate error
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');

      // Reconnect for other tests
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });
  });
});
