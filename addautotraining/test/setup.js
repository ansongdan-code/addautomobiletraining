// Server test setup
require('dotenv').config({ path: '.env' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRE = '1d';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/addautotraining_test';

// Increase timeout
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
};

// Setup and teardown hooks
beforeAll(async () => {
  // Global setup before all tests
});

afterAll(async () => {
  // Global cleanup after all tests
});
