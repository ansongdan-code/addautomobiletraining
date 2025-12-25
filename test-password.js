const mongoose = require('mongoose');
const User = require('./models/User');

async function testPassword() {
    try {
        console.log('🔐 Testing admin password...');
        
        // Connect to database
        await mongoose.connect('mongodb://localhost:27017/auto-training-academy');
        console.log('✅ Connected to database');
        
        // Get admin user with password
        const adminUser = await User.findOne({ email: 'admin@autotraining.com' }).select('+password');
        
        if (!adminUser) {
            console.log('❌ Admin user not found!');
            return;
        }
        
        console.log('✅ Admin user found');
        console.log(`   Name: ${adminUser.name}`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   Hashed Password: ${adminUser.password}`);
        
        // Test password matching
        const testPassword = 'admin123';
        const isMatch = await adminUser.matchPassword(testPassword);
        
        console.log(`\n🔍 Testing password: "${testPassword}"`);
        console.log(`   Match Result: ${isMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
        // Try creating a new admin user with the same password
        console.log('\n🔄 Creating new admin user for testing...');
        const newAdmin = await User.create({
            name: 'Test Admin',
            email: 'testadmin@autotraining.com',
            password: 'admin123',
            role: 'admin'
        });
        
        console.log('✅ New admin user created');
        console.log(`   Email: ${newAdmin.email}`);
        console.log(`   Hashed Password: ${newAdmin.password}`);
        
        // Test password for new user
        const newIsMatch = await newAdmin.matchPassword('admin123');
        console.log(`   Password Match: ${newIsMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
        // Clean up - delete test user
        await User.findByIdAndDelete(newAdmin._id);
        console.log('🧹 Test user deleted');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

testPassword(); 