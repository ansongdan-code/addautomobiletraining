const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

async function uploadCourses() {
  try {
    console.log('Using URI:', MONGO_URI);

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    let admin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });

    if (!admin) {
      console.log('No admin user found. Creating a temporary admin...');
      admin = new User({
        name: 'Default Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('Admin created: admin@example.com / password123');
    }

    const courses = [
      {
        title: 'Mastering Engine Diagnostics',
        description: 'A comprehensive guide to diagnosing modern engine problems using advanced tools and techniques.',
        shortDescription: 'Master engine diagnostics with ease.',
        price: 49.99,
        duration: { weeks: 12, hours: 60 },
        level: 'advanced',
        category: 'diagnostic',
        status: 'published',
        instructor: admin._id,
        learningObjectives: [
          'Identify common engine sensor failures',
          'Use an oscilloscope for signal analysis',
          'Interpret fuel trim data correctly',
          'Perform compression and leak-down tests'
        ],
        tags: ['engine', 'diagnostics', 'mechanic', 'advanced']
      },
      {
        title: 'Brake System Essentials',
        description: 'Learn everything about hydraulic brake systems, from pads and rotors to ABS and stability control.',
        shortDescription: 'Core knowledge for brake service.',
        price: 29.99,
        duration: { weeks: 6, hours: 24 },
        level: 'beginner',
        category: 'brakes',
        status: 'published',
        instructor: admin._id,
        learningObjectives: [
          'Understand hydraulic principles',
          'Service disc and drum brakes',
          'Diagnose ABS light issues',
          'Proper brake bleeding techniques'
        ],
        tags: ['brakes', 'safety', 'beginner', 'maintenance']
      },
      {
        title: 'Hybrid & Electric Vehicle Introduction',
        description: 'Safe handling and basic operation principles of high-voltage vehicle systems.',
        shortDescription: 'Step into the future of automotive.',
        price: 39.99,
        duration: { weeks: 8, hours: 32 },
        level: 'intermediate',
        category: 'hybrid',
        status: 'published',
        instructor: admin._id,
        learningObjectives: [
          'Identify high-voltage components safely',
          'Understand regenerative braking',
          'Battery management system basics',
          'Safety protocols for EV service'
        ],
        tags: ['EV', 'hybrid', 'electric', 'future']
      }
    ];

    console.log('Uploading courses...');
    for (const courseData of courses) {
      const existing = await Course.findOne({ title: courseData.title });
      if (existing) {
        console.log(`Course "${courseData.title}" already exists. Updating...`);
        await Course.findByIdAndUpdate(existing._id, courseData);
      } else {
        const course = new Course(courseData);
        await course.save();
        console.log(`Created course: ${course.title}`);
      }
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

uploadCourses();
