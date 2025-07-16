const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('Token:', response.data.token);
    
    // Test admin dashboard access
    const dashboardResponse = await axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${response.data.token}`
      }
    });
    
    console.log('Dashboard access successful!');
    console.log('Stats:', dashboardResponse.data.data.stats);
    
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testLogin();
