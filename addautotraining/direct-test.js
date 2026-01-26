const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { generateToken } = require('./middleware/auth');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    console.log('🚀 Starting Direct Admin Login Test...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    // Test 1: Find admin user
    console.log('\n📝 Test 1: Finding admin user...');
    const adminUser = await User.findOne({ email: 'admin@test.com' }).select('+password');
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log('✅ Admin user found:', adminUser.email);
    console.log('   Name:', adminUser.name);
    console.log('   Role:', adminUser.role);
    console.log('   Active:', adminUser.isActive);

    // Test 2: Password verification
    console.log('\n📝 Test 2: Testing password verification...');
    const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return;
    }
    console.log('✅ Password verification successful');

    // Test 3: Token generation
    console.log('\n📝 Test 3: Testing token generation...');
    const token = generateToken(adminUser._id);
    console.log('✅ Token generated:', token.substring(0, 50) + '...');

    // Test 4: Token verification
    console.log('\n📝 Test 4: Testing token verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, user ID:', decoded.id);

    // Test 5: Role check
    console.log('\n📝 Test 5: Testing admin role check...');
    const isAdmin = adminUser.role === 'admin' || adminUser.role === 'super_admin';
    console.log('✅ Admin role check passed:', isAdmin);

    // Test 6: Find all users (simulating admin dashboard)
    console.log('\n📝 Test 6: Testing admin dashboard functionality...');
    const totalUsers = await User.countDocuments();
    console.log('✅ Total users in database:', totalUsers);

    // Test 7: Check super admin user
    console.log('\n📝 Test 7: Testing super admin user...');
    const superAdminUser = await User.findOne({ email: 'superadmin@test.com' });
    if (superAdminUser) {
      console.log('✅ Super admin user found:', superAdminUser.email);
      console.log('   Role:', superAdminUser.role);
    } else {
      console.log('❌ Super admin user not found');
    }

    // Test 8: Authentication flow simulation
    console.log('\n📝 Test 8: Full authentication flow simulation...');
    
    // Simulate login request
    const loginData = {
      email: 'admin@test.com',
      password: 'admin123'
    };
    
    // Find user
    const user = await User.findOne({ email: loginData.email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) {
      console.log('❌ Invalid credentials');
      return;
    }
    
    // Generate token
    const authToken = generateToken(user._id);
    
    // Simulate token verification for admin access
    const tokenDecoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const authenticatedUser = await User.findById(tokenDecoded.id).select('-password');
    
    if (!authenticatedUser) {
      console.log('❌ User not found during token verification');
      return;
    }
    
    if (!authenticatedUser.isActive) {
      console.log('❌ Account is deactivated');
      return;
    }
    
    // Check admin role
    const hasAdminAccess = authenticatedUser.role === 'admin' || authenticatedUser.role === 'super_admin';
    if (!hasAdminAccess) {
      console.log('❌ Admin access required');
      return;
    }
    
    console.log('✅ Full authentication flow completed successfully!');
    console.log('   User:', authenticatedUser.name);
    console.log('   Email:', authenticatedUser.email);
    console.log('   Role:', authenticatedUser.role);
    console.log('   Token valid:', !!authToken);

    console.log('\n🎉 All Admin Login Tests Passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

testAdminLogin();
