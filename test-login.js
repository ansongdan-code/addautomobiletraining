const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('🧪 Testing admin login...');
        
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@autotraining.com',
                password: 'admin123'
            })
        });

        const data = await response.json();
        
        console.log('📊 Response Status:', response.status);
        console.log('📄 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('✅ Login successful!');
            
            // Test getting user details
            const userResponse = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                }
            });
            
            const userData = await userResponse.json();
            console.log('👤 User Data:', JSON.stringify(userData, null, 2));
        } else {
            console.log('❌ Login failed!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLogin(); 