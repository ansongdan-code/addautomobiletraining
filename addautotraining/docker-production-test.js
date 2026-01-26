#!/usr/bin/env node

/**
 * Docker Production Readiness Test
 * Tests all critical endpoints in the containerized environment
 */

const http = require('http');

const tests = [
  {
    name: 'MongoDB Connection',
    method: 'GET',
    path: '/api/settings',
    port: 5000,
    expectedStatus: 200,
    expectedContent: 'success'
  },
  {
    name: 'Courses Endpoint',
    method: 'GET',
    path: '/api/courses',
    port: 5000,
    expectedStatus: 200,
    expectedContent: 'title'
  },
  {
    name: 'Admin Login (Valid)',
    method: 'POST',
    path: '/api/auth/login',
    port: 5000,
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123'
    }),
    expectedStatus: 200,
    expectedContent: 'token'
  },
  {
    name: 'Frontend HTML',
    method: 'GET',
    path: '/',
    port: 3000,
    expectedStatus: 200,
    expectedContent: 'Auto Training Academy'
  },
  {
    name: 'Frontend Assets',
    method: 'GET',
    path: '/manifest.json',
    port: 3000,
    expectedStatus: 200,
    expectedContent: 'name'
  }
];

function runTest(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: test.port,
      path: test.path,
      method: test.method,
      headers: {}
    };

    if (test.body) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(test.body);
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const passed =
          res.statusCode === test.expectedStatus &&
          data.includes(test.expectedContent);

        const result = {
          name: test.name,
          passed,
          status: res.statusCode,
          expected: test.expectedStatus,
          contentCheck: data.includes(test.expectedContent)
        };

        resolve(result);
      });
    });

    req.on('error', (error) => {
      resolve({
        name: test.name,
        passed: false,
        error: error.message
      });
    });

    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('\n🚀 Docker Production Readiness Tests\n');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await runTest(test);

    if (result.passed) {
      console.log(`✅ ${result.name}`);
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(
          `   Status: ${result.status} (expected ${result.expected})`
        );
        console.log(`   Content check: ${result.contentCheck}`);
      }
      failed++;
    }
  }

  console.log('=' .repeat(60));
  console.log(
    `\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`
  );

  if (failed === 0) {
    console.log('🎉 All tests passed! Application is production-ready.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

runAllTests();
