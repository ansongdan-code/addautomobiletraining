const axios = require('axios');

const API_BASE_URL = 'https://add-auto-traing-q6bgjb1ob-ansongdan-codes-projects.vercel.app';

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health endpoint working:', healthResponse.data);
    
    // Test settings endpoint
    console.log('\n2. Testing settings endpoint...');
    const settingsResponse = await axios.get(`${API_BASE_URL}/api/settings`);
    console.log('✅ Settings endpoint working:', settingsResponse.data);
    
    // Test registration endpoint
    console.log('\n3. Testing registration endpoint...');
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Registration endpoint working:', registerResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('Registration response:', error.response.data);
        if (error.response.data.msg === 'User already exists') {
          console.log('✅ Registration endpoint working (user already exists)');
        } else {
          console.log('❌ Registration error:', error.response.data);
        }
      } else {
        console.log('❌ Registration network error:', error.message);
      }
    }
    
    // Test login endpoint
    console.log('\n4. Testing login endpoint...');
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
      console.log('✅ Login endpoint working:', loginResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('Login response:', error.response.data);
        if (error.response.data.msg === 'Invalid credentials') {
          console.log('✅ Login endpoint working (invalid credentials expected)');
        } else {
          console.log('❌ Login error:', error.response.data);
        }
      } else {
        console.log('❌ Login network error:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

testAPI();
