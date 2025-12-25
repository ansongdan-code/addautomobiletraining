const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkEnvironment() {
    try {
        console.log('🔧 Checking environment configuration...');
        
        console.log('📋 Environment Variables:');
        console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
        console.log(`   PORT: ${process.env.PORT || 'not set'}`);
        console.log(`   MONGO_URI: ${process.env.MONGO_URI || 'not set'}`);
        console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
        console.log(`   JWT_EXPIRE: ${process.env.JWT_EXPIRE || 'not set'}`);
        
        // Test JWT token generation
        console.log('\n🔐 Testing JWT token generation...');
        
        // Connect to database
        await mongoose.connect('mongodb://localhost:27017/auto-training-academy');
        console.log('✅ Connected to database');
        
        // Get admin user
        const adminUser = await User.findOne({ email: 'admin@autotraining.com' });
        
        if (!adminUser) {
            console.log('❌ Admin user not found!');
            return;
        }
        
        try {
            const token = adminUser.getSignedJwtToken();
            console.log('✅ JWT token generated successfully');
            console.log(`   Token: ${token.substring(0, 50)}...`);
        } catch (jwtError) {
            console.log('❌ JWT token generation failed');
            console.log(`   Error: ${jwtError.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

checkEnvironment(); 