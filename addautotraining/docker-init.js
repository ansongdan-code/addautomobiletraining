#!/usr/bin/env node

/**
 * Docker initialization script
 * Creates admin and super-admin users if they don't exist
 * Called before starting the Express server
 */

const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/addautotraining';

const adminUsers = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    isEmailVerified: true
  },
  {
    name: 'Super Admin',
    email: 'superadmin@test.com',
    password: 'superadmin123',
    role: 'super_admin',
    isActive: true,
    isEmailVerified: true
  }
];

const initAdminUsers = async () => {
  try {
    console.log('[Docker Init] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Docker Init] Connected to MongoDB');

    for (const userData of adminUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`[Docker Init] ${userData.role} user already exists: ${userData.email}`);
      } else {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`[Docker Init] ✓ ${userData.role} user created: ${userData.email}`);
      }
    }

    console.log('[Docker Init] Admin users provisioning complete');
    process.exit(0);
  } catch (error) {
    console.error('[Docker Init] Error:', error.message);
    process.exit(1);
  }
};

initAdminUsers();
