const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Payment = require('./models/Payment');
const Enrollment = require('./models/Enrollment');

// Database connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-training-academy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data for courses
const sampleCourses = [
  {
    title: 'Engine Fundamentals',
    description: 'Master the basics of internal combustion engines, including engine types, components, and operating principles. Learn about four-stroke and two-stroke cycles, engine displacement, and power output calculations.',
    price: 299.99,
    image: 'engine-fundamentals.jpg',
    category: 'engine',
    difficulty: 'beginner'
  },
  {
    title: 'Diagnostic Systems',
    description: 'Learn modern diagnostic techniques using OBD-II systems. Understand trouble codes, sensor operation, and how to interpret diagnostic data for effective troubleshooting.',
    price: 399.99,
    image: 'diagnostic-systems.jpg',
    category: 'diagnostic',
    difficulty: 'intermediate'
  },
  {
    title: 'Electric Vehicle Technology',
    description: 'Explore the future of automotive technology with comprehensive coverage of electric vehicle systems, battery technology, and charging infrastructure.',
    price: 499.99,
    image: 'ev-technology.jpg',
    category: 'electrical',
    difficulty: 'advanced'
  },
  {
    title: 'Transmission Systems',
    description: 'Master automatic and manual transmission systems, including gear ratios, torque converters, and transmission diagnostics.',
    price: 349.99,
    image: 'transmission-systems.jpg',
    category: 'transmission',
    difficulty: 'intermediate'
  },
  {
    title: 'Brake Systems',
    description: 'Comprehensive coverage of hydraulic and electronic brake systems, ABS, traction control, and brake system maintenance.',
    price: 279.99,
    image: 'brake-systems.jpg',
    category: 'brakes',
    difficulty: 'beginner'
  },
  {
    title: 'Suspension and Steering',
    description: 'Learn about suspension geometry, steering systems, wheel alignment, and advanced suspension technologies.',
    price: 329.99,
    image: 'suspension-steering.jpg',
    category: 'suspension',
    difficulty: 'intermediate'
  }
];

// Sample users for testing
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'Admin User',
    email: 'admin@autotraining.com',
    password: 'admin123',
    role: 'admin'
  }
];

// Setup database with sample data
const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database...\n');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Payment.deleteMany({});
    await Enrollment.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create sample users first
    console.log('👥 Creating sample users...');
    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users\n`);

    // Create sample courses with instructor references
    console.log('📚 Creating sample courses...');
    const adminUser = users.find(user => user.role === 'admin');
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: adminUser._id
    }));
    const courses = await Course.create(coursesWithInstructor);
    console.log(`✅ Created ${courses.length} courses\n`);

    // Create sample payments and enrollments
    console.log('💳 Creating sample payments and enrollments...');
    const samplePayments = [];
    const sampleEnrollments = [];

    // Create payments for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const course = courses[i % courses.length]; // Distribute courses among users

      const payment = await Payment.create({
        user: user._id,
        course: course._id,
        amount: course.price,
        currency: 'USD',
        paymentMethod: ['stripe', 'paypal', 'paystack'][i % 3],
        paymentStatus: 'completed',
        transactionId: `TXN_${Date.now()}_${i}`,
        billingDetails: {
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ')[1] || '',
          email: user.email,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          address: {
            line1: `${Math.floor(Math.random() * 9999) + 1} Test Street`,
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'US'
          }
        }
      });

      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        payment: payment._id,
        enrollmentStatus: 'active',
        progress: Math.floor(Math.random() * 100),
        completedModules: [
          {
            moduleId: 'module_1',
            moduleTitle: 'Introduction',
            completedAt: new Date()
          }
        ]
      });

      samplePayments.push(payment);
      sampleEnrollments.push(enrollment);
    }

    console.log(`✅ Created ${samplePayments.length} payments and ${sampleEnrollments.length} enrollments\n`);

    // Display database statistics
    console.log('📊 Database Statistics:');
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    console.log(`   👥 Users: ${totalUsers}`);
    console.log(`   📚 Courses: ${totalCourses}`);
    console.log(`   💳 Payments: ${totalPayments}`);
    console.log(`   🎓 Enrollments: ${totalEnrollments}`);
    console.log(`   💰 Total Revenue: $${(totalRevenue[0]?.total || 0).toFixed(2)}`);

    // Test data relationships
    console.log('\n🔍 Testing data relationships...');
    
    // Test user with enrollments
    const testUser = await User.findById(users[0]._id);
    const userEnrollments = await Enrollment.find({ user: testUser._id })
      .populate('course', 'title price')
      .populate('payment', 'amount paymentStatus');
    
    console.log(`   ✅ User "${testUser.name}" has ${userEnrollments.length} enrollments`);

    // Test course with enrollments
    const testCourse = await Course.findById(courses[0]._id);
    const courseEnrollments = await Enrollment.find({ course: testCourse._id })
      .populate('user', 'name email');
    
    console.log(`   ✅ Course "${testCourse.title}" has ${courseEnrollments.length} enrollments`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Student Login: john.doe@example.com / password123');
    console.log('   Admin Login: admin@autotraining.com / admin123');
    console.log('\n🔗 API Endpoints:');
    console.log('   GET /api/v1/courses - List all courses');
    console.log('   POST /api/auth/login - User login');
    console.log('   POST /api/v1/payment/create-payment-intent - Create payment');
    console.log('   GET /api/v1/payment/history - Payment history');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the setup
setupDatabase(); 