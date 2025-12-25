const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    try {
        console.log('🔍 Checking users in database...');
        
        // Connect to database
        await mongoose.connect('mongodb://localhost:27017/auto-training-academy');
        console.log('✅ Connected to database');
        
        // Get all users
        const users = await User.find({}).select('name email role');
        
        console.log(`📊 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        
        // Check specifically for admin user
        const adminUser = await User.findOne({ email: 'admin@autotraining.com' });
        if (adminUser) {
            console.log('\n✅ Admin user found:');
            console.log(`   Name: ${adminUser.name}`);
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Role: ${adminUser.role}`);
        } else {
            console.log('\n❌ Admin user not found!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

checkUsers(); 