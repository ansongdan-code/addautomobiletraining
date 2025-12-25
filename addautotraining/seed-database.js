#!/usr/bin/env node

/**
 * Seed Database with Sample Data
 * Creates sample courses, videos, blog posts, and pages
 */

const mongoose = require('mongoose');
const Course = require('./models/Course');
const Video = require('./models/Video');
const BlogPost = require('./models/BlogPost');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:strongpassword@localhost:27017/addautotraining?authSource=admin';

let adminUserId = null; // Will be fetched from database

const sampleCourses = [];  // Will be populated in seedDatabase function

const sampleVideos = [
  {
    title: 'Engine Block Anatomy',
    description: 'Detailed walkthrough of engine block components and their functions',
    courseId: null, // Will be set after course creation
    category: 'engine',
    duration: 15,
    views: 5420,
    rating: 4.8,
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://via.placeholder.com/400x225?text=Engine+Block',
    content: 'In this video, we explore the internal structure of an engine block.',
    isPublished: true,
  },
  {
    title: 'Reading OBD-II Codes',
    description: 'How to read and interpret OBD-II diagnostic codes',
    courseId: null,
    category: 'diagnostic',
    duration: 12,
    views: 8923,
    rating: 4.9,
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://via.placeholder.com/400x225?text=OBD-II+Codes',
    content: 'Learn how to interpret OBD-II scanner codes and diagnose engine problems.',
    isPublished: true,
  },
  {
    title: 'Automatic Transmission Fluid Changes',
    description: 'Step-by-step guide to changing automatic transmission fluid',
    courseId: null,
    category: 'transmission',
    duration: 18,
    views: 3450,
    rating: 4.7,
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://via.placeholder.com/400x225?text=ATF+Change',
    content: 'Complete walkthrough of the automatic transmission fluid change procedure.',
    isPublished: true,
  },
];

const sampleBlogPosts = [
  {
    title: 'Top 10 Car Maintenance Tips for 2025',
    slug: 'top-10-car-maintenance-tips-2025',
    author: null, // Will be set to adminUserId
    content: `
    <h2>Introduction</h2>
    <p>Proper vehicle maintenance is essential for safety, performance, and longevity. Here are the top 10 maintenance tips every car owner should know.</p>
    
    <h2>1. Check Your Tire Pressure Regularly</h2>
    <p>Proper tire pressure improves fuel economy and extends tire life. Check monthly or before long trips.</p>
    
    <h2>2. Change Oil and Filter</h2>
    <p>Regular oil changes are crucial for engine health. Follow your vehicle's maintenance schedule.</p>
    
    <h2>3. Inspect Brakes</h2>
    <p>Have your brakes inspected regularly to ensure safety on the road.</p>
    
    <h2>4. Replace Air Filters</h2>
    <p>Clean air filters improve fuel efficiency and engine performance.</p>
    
    <h2>5-10. [Additional maintenance tips...]</h2>
    `,
    excerpt: 'Essential car maintenance tips to keep your vehicle running smoothly in 2025.',
    tags: ['maintenance', 'tips', 'cars'],
    category: 'maintenance',
    featured: true,
    views: 2340,
    isPublished: true,
  },
  {
    title: 'Understanding Your Engine Warning Light',
    slug: 'understanding-engine-warning-light',
    author: null,
    content: `
    <h2>What Does the Check Engine Light Mean?</h2>
    <p>The check engine light (CEL) indicates a problem with your vehicle's emission control system.</p>
    
    <h2>Common Causes</h2>
    <ul>
      <li>Faulty oxygen sensor</li>
      <li>Loose gas cap</li>
      <li>Catalytic converter problems</li>
      <li>Mass airflow sensor issues</li>
    </ul>
    
    <h2>What You Should Do</h2>
    <p>Have the vehicle scanned with an OBD-II scanner to identify the specific problem code.</p>
    `,
    excerpt: 'Learn what your engine warning light means and how to respond.',
    tags: ['diagnostics', 'warning-lights', 'engine'],
    category: 'tutorial',
    featured: false,
    views: 4560,
    isPublished: true,
  },
  {
    title: 'EV Technology: The Future of Automotive',
    slug: 'ev-technology-future-automotive',
    author: null,
    content: `
    <h2>The Electric Vehicle Revolution</h2>
    <p>Electric vehicles are transforming the automotive industry with cleaner, more efficient technology.</p>
    
    <h2>Key Advantages</h2>
    <ul>
      <li>Zero emissions</li>
      <li>Lower operating costs</li>
      <li>Instant torque</li>
      <li>Reduced maintenance</li>
    </ul>
    
    <h2>Future Outlook</h2>
    <p>As technology improves and charging infrastructure expands, EVs will become mainstream transportation.</p>
    `,
    excerpt: 'Explore the emerging technologies in electric vehicles and their impact on the automotive industry.',
    tags: ['electric', 'technology', 'future'],
    category: 'technology',
    featured: true,
    views: 6780,
    isPublished: true,
  },
];

async function seedDatabase() {
  try {
    console.log('\n🌱 Seeding Database with Sample Data...\n');
    
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Get admin user for instructor field
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'super_admin' });
    }
    
    if (!adminUser) {
      throw new Error('No admin user found in database');
    }
    
    adminUserId = adminUser._id;
    console.log('✓ Found admin user:', adminUser.email);

    // Create course data with valid schema
    const coursesData = [
      {
        title: 'Engine Fundamentals',
        description: 'Learn the basics of automotive engine systems, components, and operation',
        price: 29.99,
        duration: { weeks: 10, hours: 40 },
        level: 'beginner',
        category: 'engine',
        instructor: adminUserId,
        status: 'published',
      },
      {
        title: 'Transmission & Drivetrain',
        description: 'Master transmission systems, differentials, and power delivery mechanisms',
        price: 39.99,
        duration: { weeks: 8, hours: 35 },
        level: 'intermediate',
        category: 'transmission',
        instructor: adminUserId,
        status: 'published',
      },
      {
        title: 'Electrical Systems & Diagnostics',
        description: 'Understand modern vehicle electrical systems and diagnostic procedures',
        price: 44.99,
        duration: { weeks: 11, hours: 45 },
        level: 'intermediate',
        category: 'electrical',
        instructor: adminUserId,
        status: 'published',
      },
      {
        title: 'Advanced Engine Diagnostics',
        description: 'Learn advanced diagnostic techniques for engine problems using modern tools',
        price: 59.99,
        duration: { weeks: 12, hours: 50 },
        level: 'advanced',
        category: 'diagnostic',
        instructor: adminUserId,
        status: 'published',
      },
      {
        title: 'Brake Systems & Safety',
        description: 'Complete understanding of hydraulic and electronic brake systems',
        price: 34.99,
        duration: { weeks: 7, hours: 30 },
        level: 'intermediate',
        category: 'brakes',
        instructor: adminUserId,
        status: 'published',
      },
    ];

    // Create Courses
    console.log('\n📚 Adding Sample Courses...');
    const createdCourses = await Course.insertMany(coursesData);
    console.log(`✓ Created ${createdCourses.length} courses`);

    // Create Blog Posts
    console.log('\n📝 Adding Sample Blog Posts...');
    const blogData = sampleBlogPosts.map((post) => ({
      ...post,
      author: adminUserId,
    }));
    const createdPosts = await BlogPost.insertMany(blogData);
    console.log(`✓ Created ${createdPosts.length} blog posts`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE SEEDING COMPLETE');
    console.log('='.repeat(50));
    console.log(`
📊 Summary:
  • Courses:    ${createdCourses.length}
  • Blog Posts: ${createdPosts.length}
  
✨ Your application now has sample data to work with!
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
