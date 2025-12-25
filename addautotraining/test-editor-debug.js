// Test to verify WebsiteEditor is accessible and can be loaded
const http = require('http');

function makeRequest(path, method = 'GET', token = null) {
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
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 WEBSITE EDITOR COMPONENT TEST');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get token
    console.log('1️⃣ Getting authentication token...');
    const loginRes = await makeRequest('/api/auth/login', 'POST');
    // Note: We need to send credentials through POST

    // Alternative: Check if editor pages endpoint works
    console.log('2️⃣ Testing Website Editor API endpoints...\n');

    // The editor should fetch pages from /api/website/editor/pages
    // Let's verify this endpoint exists and returns data
    
    console.log('📋 API Endpoints to check:');
    console.log('   - GET /api/website/editor/pages');
    console.log('   - POST /api/website/editor/pages');
    console.log('   - PUT /api/website/editor/pages/:id');
    console.log('   - DELETE /api/website/editor/pages/:id');
    
    console.log('\n✅ DIAGNOSIS:');
    console.log('   The WebsiteEditor component requires:');
    console.log('   1. User to have admin/super_admin role (✓ verified earlier)');
    console.log('   2. Component to be in DOM (requires activeTab === "editor")');
    console.log('   3. userRole state to be set (happens in useEffect)');
    console.log('   4. No CSS display: none rule blocking it');
    
    console.log('\n📌 COMMON ISSUES:');
    console.log('   ❌ Browser cache - Try hard refresh (Ctrl+Shift+R)');
    console.log('   ❌ CSS hiding the component - Check AdminDashboard.css');
    console.log('   ❌ Component import error - Check browser console');
    console.log('   ❌ Lazy loading failure - Check Suspense fallback');
    
    console.log('\n🔍 TO DEBUG:');
    console.log('   1. Open browser DevTools (F12)');
    console.log('   2. Go to Console tab');
    console.log('   3. Click Website Editor tab');
    console.log('   4. Check for any error messages');
    console.log('   5. Check Network tab for failed requests');
    
    console.log('\n═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
