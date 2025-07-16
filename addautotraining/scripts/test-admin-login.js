const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(colors[color] + message + colors.reset);
};

const testAdminLogin = async () => {
  log('🚀 Starting Admin Login Tests...', 'blue');
  
  try {
    // Test 1: Admin Login
    log('\n📝 Test 1: Admin Login with Valid Credentials', 'yellow');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      log('✅ Admin login successful!', 'green');
      const token = loginResponse.data.token;
      
      // Test 2: Access Admin Dashboard
      log('\n📝 Test 2: Access Admin Dashboard', 'yellow');
      const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (dashboardResponse.status === 200) {
        log('✅ Admin dashboard access successful!', 'green');
        log(`📊 Dashboard stats: ${JSON.stringify(dashboardResponse.data.data.stats, null, 2)}`, 'blue');
      } else {
        log('❌ Admin dashboard access failed', 'red');
      }
      
      // Test 3: Access User Management
      log('\n📝 Test 3: Access User Management', 'yellow');
      const usersResponse = await axios.get(`${BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (usersResponse.status === 200) {
        log('✅ User management access successful!', 'green');
        log(`👥 Total users: ${usersResponse.data.data.users.length}`, 'blue');
      } else {
        log('❌ User management access failed', 'red');
      }
      
      // Test 4: Access Course Management
      log('\n📝 Test 4: Access Course Management', 'yellow');
      const coursesResponse = await axios.get(`${BASE_URL}/admin/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (coursesResponse.status === 200) {
        log('✅ Course management access successful!', 'green');
        log(`📚 Total courses: ${coursesResponse.data.data.courses.length}`, 'blue');
      } else {
        log('❌ Course management access failed', 'red');
      }
      
      // Test 5: Access Blog Management
      log('\n📝 Test 5: Access Blog Management', 'yellow');
      const blogResponse = await axios.get(`${BASE_URL}/admin/blog/posts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (blogResponse.status === 200) {
        log('✅ Blog management access successful!', 'green');
        log(`📝 Total blog posts: ${blogResponse.data.data.posts.length}`, 'blue');
      } else {
        log('❌ Blog management access failed', 'red');
      }
      
      // Test 6: Access Website Settings
      log('\n📝 Test 6: Access Website Settings', 'yellow');
      const settingsResponse = await axios.get(`${BASE_URL}/admin/settings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (settingsResponse.status === 200) {
        log('✅ Website settings access successful!', 'green');
      } else {
        log('❌ Website settings access failed', 'red');
      }
      
      // Test 7: Access Analytics
      log('\n📝 Test 7: Access Analytics', 'yellow');
      const analyticsResponse = await axios.get(`${BASE_URL}/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (analyticsResponse.status === 200) {
        log('✅ Analytics access successful!', 'green');
      } else {
        log('❌ Analytics access failed', 'red');
      }
      
    } else {
      log('❌ Admin login failed', 'red');
    }
    
  } catch (error) {
    if (error.response) {
      log(`❌ Test failed: ${error.response.status} - ${error.response.data.msg || error.response.data.error || error.message}`, 'red');
    } else {
      log(`❌ Test failed: ${error.message}`, 'red');
    }
  }
  
  // Test 8: Invalid Login Attempt
  log('\n📝 Test 8: Invalid Login Attempt', 'yellow');
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'wrongpassword'
    });
    log('❌ Invalid login should have failed', 'red');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ Invalid login correctly rejected!', 'green');
    } else {
      log(`❌ Unexpected error: ${error.message}`, 'red');
    }
  }
  
  // Test 9: Unauthorized Access
  log('\n📝 Test 9: Unauthorized Access to Admin Dashboard', 'yellow');
  try {
    await axios.get(`${BASE_URL}/admin/dashboard`);
    log('❌ Unauthorized access should have failed', 'red');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✅ Unauthorized access correctly rejected!', 'green');
    } else {
      log(`❌ Unexpected error: ${error.message}`, 'red');
    }
  }
  
  log('\n🎉 Admin Login Tests Complete!', 'blue');
};

// Run the tests
testAdminLogin();
