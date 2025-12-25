const http = require('http');

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            rawBody: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 DASHBOARD STATS API DEBUGGING');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get token
    console.log('Step 1: Getting authentication token...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'superadmin@test.com',
      password: 'superadmin123'
    });

    if (loginRes.status !== 200) {
      console.log('❌ Login failed');
      process.exit(1);
    }

    const token = loginRes.body.token;
    console.log('✅ Token obtained\n');

    // Test dashboard endpoint
    console.log('Step 2: Calling /api/admin/dashboard endpoint...');
    const dashRes = await makeRequest('/api/admin/dashboard', 'GET', null, token);

    console.log(`Status: ${dashRes.status}`);
    console.log(`Headers: ${JSON.stringify(dashRes.headers, null, 2)}`);
    console.log(`Raw Response:\n${dashRes.rawBody}\n`);
    
    console.log('Parsed Response:');
    console.log(JSON.stringify(dashRes.body, null, 2));

    console.log('\n═══════════════════════════════════════════════════');
    console.log('📋 RESPONSE STRUCTURE ANALYSIS');
    console.log('═══════════════════════════════════════════════════\n');

    if (dashRes.body) {
      console.log('✅ Top-level keys:', Object.keys(dashRes.body).join(', '));
      
      if (dashRes.body.data) {
        console.log('✅ data.* keys:', Object.keys(dashRes.body.data).join(', '));
        
        if (dashRes.body.data.stats) {
          console.log('✅ data.stats keys:', Object.keys(dashRes.body.data.stats).join(', '));
          console.log('\n📊 Stats data is accessible via: response.data.stats');
          console.log('Values:');
          Object.entries(dashRes.body.data.stats).forEach(([key, val]) => {
            console.log(`  • ${key}: ${val}`);
          });
        }
      }
    }

    // Check for errors
    if (dashRes.status !== 200) {
      console.log('\n❌ ERROR: Non-200 status code');
      console.log('Error details:', dashRes.body);
    } else if (!dashRes.body.data || !dashRes.body.data.stats) {
      console.log('\n❌ ERROR: Missing expected data structure');
      console.log('Expected: { success: true, data: { stats: {...} } }');
      console.log('Got:', dashRes.body);
    } else {
      console.log('\n✅ All checks passed - Stats data is accessible');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
