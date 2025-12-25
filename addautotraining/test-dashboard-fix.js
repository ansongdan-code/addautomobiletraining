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
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
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
  try {
    console.log('🔐 Testing login...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'superadmin@test.com',
      password: 'superadmin123'
    });

    console.log(`Login Status: ${loginRes.status}`);
    if (loginRes.status !== 200) {
      console.log('Login failed:', loginRes.body);
      process.exit(1);
    }

    const token = loginRes.body.token;
    console.log(`✅ Token received: ${token.substring(0, 30)}...`);

    console.log('\n📊 Testing admin dashboard endpoint...');
    const dashRes = await makeRequest('/api/admin/dashboard', 'GET', null, token);

    console.log(`Dashboard Status: ${dashRes.status}`);
    
    if (dashRes.status === 200) {
      console.log('✅ SUCCESS! Dashboard returned 200 OK');
      console.log('Data:', JSON.stringify(dashRes.body.data, null, 2));
    } else if (dashRes.status === 429) {
      console.log('❌ FAILED! Still getting 429 rate limit error');
      console.log('Response:', dashRes.body);
    } else {
      console.log(`❌ Unexpected status: ${dashRes.status}`);
      console.log('Response:', dashRes.body);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
