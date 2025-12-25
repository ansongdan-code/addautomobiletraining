#!/usr/bin/env node

/**
 * Comprehensive Application Test Suite
 * Tests all major features and endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

async function test(name, fn) {
  try {
    process.stdout.write(`${colors.blue}Testing: ${name}...${colors.reset} `);
    await fn();
    console.log(`${colors.green}✓ PASS${colors.reset}`);
    testResults.passed++;
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset}`);
    testResults.failed++;
    testResults.errors.push({ test: name, error: error.message });
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.yellow}🧪 COMPREHENSIVE APPLICATION TEST SUITE${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  let authToken = null;

  // === Authentication Tests ===
  console.log(`${colors.blue}📝 Authentication Tests${colors.reset}`);
  
  await test('Login with super admin credentials', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@test.com',
      password: 'superadmin123',
    });
    if (!response.data.token) throw new Error('No token returned');
    authToken = response.data.token;
  });

  await test('Login with admin credentials', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123',
    });
    if (!response.data.token) throw new Error('No token returned');
  });

  await test('Login fails with invalid credentials', async () => {
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'invalid@test.com',
        password: 'wrongpassword',
      });
      throw new Error('Should have failed');
    } catch (error) {
      if (error.response?.status !== 400 && error.response?.status !== 401) {
        throw error;
      }
    }
  });

  // === Settings Tests ===
  console.log(`\n${colors.blue}⚙️  Settings Tests${colors.reset}`);
  
  await test('Get site settings', async () => {
    const response = await axios.get(`${BASE_URL}/settings`);
    if (!response.data.data) throw new Error('No settings data');
  });

  await test('Settings contains required fields', async () => {
    const response = await axios.get(`${BASE_URL}/settings`);
    const requiredFields = ['siteName', 'siteDescription', 'primaryColor', 'secondaryColor'];
    for (const field of requiredFields) {
      if (!(field in response.data.data)) throw new Error(`Missing field: ${field}`);
    }
  });

  // === Admin Dashboard Tests ===
  console.log(`\n${colors.blue}📊 Admin Dashboard Tests${colors.reset}`);
  
  await test('Get admin dashboard data', async () => {
    const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.data.data) throw new Error('No dashboard data');
  });

  // === Website Editor Tests ===
  console.log(`\n${colors.blue}✏️  Website Editor Tests${colors.reset}`);
  
  await test('Get website editor pages (requires auth)', async () => {
    const response = await axios.get(`${BASE_URL}/website/editor/pages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    // Should return array or paginated response
    if (!Array.isArray(response.data.data) && !response.data.pages) {
      throw new Error('Invalid response format');
    }
  });

  await test('Create new website page', async () => {
    const pageData = {
      title: 'Test Page',
      slug: `test-page-${Date.now()}`,
      content: '<h1>Test Page Content</h1>',
      description: 'Test page description',
      isPublished: true,
      seo: {
        title: 'Test Page SEO Title',
        description: 'Test page SEO description',
      },
    };
    
    const response = await axios.post(
      `${BASE_URL}/website/editor/pages`,
      pageData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (!response.data.data || !response.data.data._id) {
      throw new Error('Page not created');
    }
  });

  // === API Health Tests ===
  console.log(`\n${colors.blue}🏥 API Health Tests${colors.reset}`);
  
  await test('Backend API is responsive', async () => {
    const response = await axios.get(`${BASE_URL}/settings`);
    if (response.status !== 200) throw new Error('Non-200 response');
  });

  await test('CORS headers are present', async () => {
    const response = await axios.get(`${BASE_URL}/settings`);
    if (!response.headers['access-control-allow-origin']) {
      throw new Error('No CORS headers');
    }
  });

  // === Summary ===
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.yellow}📋 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.green}✓ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${testResults.failed}${colors.reset}`);

  if (testResults.errors.length > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.errors.forEach((item) => {
      console.log(`  • ${item.test}: ${item.error}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  const totalTests = testResults.passed + testResults.failed;
  const percentage = Math.round((testResults.passed / totalTests) * 100);
  console.log(`${colors.blue}Overall: ${percentage}% (${testResults.passed}/${totalTests})${colors.reset}`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message);
  process.exit(1);
});
