const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:strongpassword@mongo:27017/addautotraining?authSource=admin';

    await mongoose.connect(mongoUri, {});

    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    const superAdminUser = new User({
      name: 'Super Admin',
      email: 'superadmin@test.com',
      password: 'superadmin123',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true
    });

    await superAdminUser.save();
    console.log('Super admin user created successfully!');
    console.log('Email: superadmin@test.com');
    console.log('Password: superadmin123');
    console.log('Role: super_admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
