#!/usr/bin/env node
/**
 * Test Web Editor Feature - End-to-End Test
 * Tests: Create page, Edit page, Publish page, Delete page
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const SUPER_ADMIN_EMAIL = 'superadmin@test.com';
const SUPER_ADMIN_PASSWORD = 'superadmin123';

let jwtToken = '';
let pageId = '';

const makeRequest = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: 5000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const logTest = (name, passed, details = '') => {
  const icon = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  console.log(`${color}${icon}${reset} ${name}${details ? ' - ' + details : ''}`);
  return passed;
};

const runTests = async () => {
  console.log('\n=== Web Editor Feature Tests ===\n');
  
  let passed = 0;
  let failed = 0;

  try {
    // Step 1: Login as super admin
    console.log('1. Authenticating as super admin...');
    const res = await makeRequest('POST', '/api/auth/login', {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    });

    if (logTest('Super admin login', res.status === 200, `Status: ${res.status}`)) {
      console.log('Login response body:', JSON.stringify(res.body, null, 2));
      jwtToken = res.body?.data?.token || res.body?.token;
      if (logTest('JWT token generated', !!jwtToken, `Token: ${jwtToken ? 'present' : 'missing'}`)) {
        passed++;
      } else {
        failed++;
        console.error('Token missing. Response:', res.body);
      }
      passed++;
    } else {
      failed++;
      console.error('Login failed:', res.body);
      process.exit(1);
    }

    // Step 2: Create a new page
    console.log('\n2. Creating a new website page...');
    const createRes = await makeRequest('POST', '/api/website/editor/pages', {
      title: 'Test Page',
      slug: 'test-page-' + Date.now(),
      content: '<h1>Welcome to Test Page</h1><p>This is a test page created by the web editor.</p>',
      description: 'A test page for web editor testing',
      customCSS: 'body { background: #f5f5f5; }',
      customJavaScript: 'console.log("Test page loaded");',
      seoTitle: 'Test Page - SEO Title',
      seoDescription: 'This is a test page for SEO',
      seoKeywords: 'test, page, editor'
    }, {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    });

    if (logTest('Create page', createRes.status === 201, `Status: ${createRes.status}`)) {
      pageId = createRes.body?.data?._id;
      if (logTest('Page ID returned', !!pageId)) {
        passed++;
      } else {
        failed++;
      }
      passed++;
    } else {
      failed++;
      console.error('Create failed:', createRes.body);
    }

    // Step 3: Get all pages (editor view)
    console.log('\n3. Fetching all pages (editor view)...');
    const listRes = await makeRequest('GET', '/api/website/editor/pages', null, {
      'Authorization': `Bearer ${jwtToken}`
    });

    if (logTest('List pages', listRes.status === 200, `Status: ${listRes.status}`)) {
      const hasNewPage = listRes.body?.data?.some(p => p._id === pageId);
      if (logTest('New page in list', hasNewPage)) {
        passed++;
      } else {
        failed++;
      }
      passed++;
    } else {
      failed++;
      console.error('List failed:', listRes.body);
    }

    // Step 4: Update the page
    console.log('\n4. Updating the page...');
    const updateRes = await makeRequest('PUT', `/api/website/editor/pages/${pageId}`, {
      title: 'Updated Test Page',
      slug: 'test-page-updated-' + Date.now(),
      content: '<h1>Updated Title</h1><p>This content has been updated.</p>',
      description: 'Updated description',
      customCSS: 'body { background: #fff; }',
      customJavaScript: 'console.log("Updated page");',
      seoTitle: 'Updated SEO Title',
      seoDescription: 'Updated SEO description',
      seoKeywords: 'updated, test'
    }, {
      'Authorization': `Bearer ${jwtToken}`
    });

    if (logTest('Update page', updateRes.status === 200, `Status: ${updateRes.status}`)) {
      passed++;
    } else {
      failed++;
      console.error('Update failed:', updateRes.body);
    }

    // Step 5: Publish the page
    console.log('\n5. Publishing the page...');
    const publishRes = await makeRequest('PUT', `/api/website/editor/pages/${pageId}/publish`, {
      isPublished: true
    }, {
      'Authorization': `Bearer ${jwtToken}`
    });

    if (logTest('Publish page', publishRes.status === 200, `Status: ${publishRes.status}`)) {
      passed++;
    } else {
      failed++;
      console.error('Publish failed:', publishRes.body);
    }

    // Step 6: Get published pages (public view)
    console.log('\n6. Fetching published pages (public view)...');
    const publicRes = await makeRequest('GET', '/api/website/pages');

    if (logTest('Get published pages', publicRes.status === 200, `Status: ${publicRes.status}`)) {
      const published = publicRes.body?.data?.some(p => p._id === pageId);
      if (logTest('Published page visible', published)) {
        passed++;
      } else {
        failed++;
      }
      passed++;
    } else {
      failed++;
      console.error('Public fetch failed:', publicRes.body);
    }

    // Step 7: Get page by slug
    console.log('\n7. Fetching page by slug...');
    const updatedPage = await makeRequest('GET', `/api/website/editor/pages`, null, {
      'Authorization': `Bearer ${jwtToken}`
    });
    const slugToTest = updatedPage.body?.data?.find(p => p._id === pageId)?.slug;
    
    if (slugToTest) {
      const slugRes = await makeRequest('GET', `/api/website/pages/${slugToTest}`);
      if (logTest('Get page by slug', slugRes.status === 200, `Status: ${slugRes.status}`)) {
        const content = slugRes.body?.data?.content;
        if (logTest('Page content retrieved', !!content)) {
          passed++;
        } else {
          failed++;
        }
        passed++;
      } else {
        failed++;
        console.error('Slug fetch failed:', slugRes.body);
      }
    }

    // Step 8: Test authorization (attempt to create without token)
    console.log('\n8. Testing authorization (attempt without token)...');
    const noAuthRes = await makeRequest('POST', '/api/website/editor/pages', {
      title: 'Unauthorized Page'
    });

    if (logTest('Authorization required', noAuthRes.status !== 200 && noAuthRes.status !== 201, `Status: ${noAuthRes.status}`)) {
      passed++;
    } else {
      failed++;
    }

    // Step 9: Delete the page
    console.log('\n9. Deleting the page...');
    const deleteRes = await makeRequest('DELETE', `/api/website/editor/pages/${pageId}`, null, {
      'Authorization': `Bearer ${jwtToken}`
    });

    if (logTest('Delete page', deleteRes.status === 200, `Status: ${deleteRes.status}`)) {
      passed++;
    } else {
      failed++;
      console.error('Delete failed:', deleteRes.body);
    }

    // Step 10: Verify page is deleted
    console.log('\n10. Verifying page is deleted...');
    const deleteVerifyRes = await makeRequest('GET', '/api/website/editor/pages', null, {
      'Authorization': `Bearer ${jwtToken}`
    });

    if (deleteVerifyRes.status === 200) {
      const stillExists = deleteVerifyRes.body?.data?.some(p => p._id === pageId);
      if (logTest('Page removed from list', !stillExists)) {
        passed++;
      } else {
        failed++;
      }
    } else {
      failed++;
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    failed++;
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
};

runTests();
