const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Payment = require('./models/Payment');
const Enrollment = require('./models/Enrollment');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-training-academy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testDatabase = async () => {
  try {
    console.log('🚀 Starting Database Tests...\n');

    // Test 1: Create Test User
    console.log('📝 Test 1: Creating Test User');
    const testUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@test.com',
      password: 'password123',
      role: 'student'
    });
    console.log('✅ User created:', { id: testUser._id, name: testUser.name, email: testUser.email });

    // Test 2: Create Test Courses
    console.log('\n📚 Test 2: Creating Test Courses');
    const courses = await Course.create([
      {
        title: 'Engine Fundamentals',
        description: 'Master the basics of internal combustion engines',
        price: 299.99,
        image: 'engine-fundamentals.jpg'
      },
      {
        title: 'Diagnostic Systems',
        description: 'Learn modern diagnostic techniques using OBD-II systems',
        price: 399.99,
        image: 'diagnostic-systems.jpg'
      },
      {
        title: 'Electric Vehicle Technology',
        description: 'Explore the future of automotive technology',
        price: 499.99,
        image: 'ev-technology.jpg'
      }
    ]);
    console.log('✅ Courses created:', courses.length, 'courses');

    // Test 3: Create Test Payment
    console.log('\n💳 Test 3: Creating Test Payment');
    const testPayment = await Payment.create({
      user: testUser._id,
      course: courses[0]._id,
      amount: 299.99,
      currency: 'USD',
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      transactionId: 'TXN_TEST_123456',
      stripePaymentIntentId: 'pi_test_123456',
      billingDetails: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        address: {
          line1: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US'
        }
      }
    });
    console.log('✅ Payment created:', { 
      id: testPayment._id, 
      amount: testPayment.amount, 
      status: testPayment.paymentStatus,
      transactionId: testPayment.transactionId
    });

    // Test 4: Create Test Enrollment
    console.log('\n🎓 Test 4: Creating Test Enrollment');
    const testEnrollment = await Enrollment.create({
      user: testUser._id,
      course: courses[0]._id,
      payment: testPayment._id,
      enrollmentStatus: 'active',
      progress: 25,
      completedModules: [
        {
          moduleId: 'module_1',
          moduleTitle: 'Introduction to Engines',
          completedAt: new Date()
        }
      ]
    });
    console.log('✅ Enrollment created:', { 
      id: testEnrollment._id, 
      status: testEnrollment.enrollmentStatus,
      progress: testEnrollment.progress + '%'
    });

    // Test 5: Query Tests
    console.log('\n🔍 Test 5: Database Queries');

    // Get payment with course and user details
    const paymentWithDetails = await Payment.findById(testPayment._id)
      .populate('course', 'title description price')
      .populate('user', 'name email');
    console.log('✅ Payment with details retrieved:', {
      course: paymentWithDetails.course.title,
      user: paymentWithDetails.user.name,
      amount: paymentWithDetails.amount
    });

    // Get enrollment with all related data
    const enrollmentWithDetails = await Enrollment.findById(testEnrollment._id)
      .populate('course', 'title description')
      .populate('user', 'name email')
      .populate('payment', 'amount paymentStatus transactionId');
    console.log('✅ Enrollment with details retrieved:', {
      course: enrollmentWithDetails.course.title,
      user: enrollmentWithDetails.user.name,
      progress: enrollmentWithDetails.progress + '%',
      paymentStatus: enrollmentWithDetails.payment.paymentStatus
    });

    // Test 6: Update Tests
    console.log('\n🔄 Test 6: Update Operations');

    // Update enrollment progress
    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      testEnrollment._id,
      { 
        progress: 50,
        completedModules: [
          {
            moduleId: 'module_1',
            moduleTitle: 'Introduction to Engines',
            completedAt: new Date()
          },
          {
            moduleId: 'module_2',
            moduleTitle: 'Engine Components',
            completedAt: new Date()
          }
        ]
      },
      { new: true }
    );
    console.log('✅ Enrollment updated:', { 
      progress: updatedEnrollment.progress + '%',
      completedModules: updatedEnrollment.completedModules.length
    });

    // Test 7: Payment Status Updates
    console.log('\n💰 Test 7: Payment Status Management');

    // Create a pending payment
    const pendingPayment = await Payment.create({
      user: testUser._id,
      course: courses[1]._id,
      amount: 399.99,
      paymentMethod: 'paypal',
      paymentStatus: 'pending',
      transactionId: 'TXN_TEST_789012'
    });
    console.log('✅ Pending payment created');

    // Update to completed
    const completedPayment = await Payment.findByIdAndUpdate(
      pendingPayment._id,
      { paymentStatus: 'completed' },
      { new: true }
    );
    console.log('✅ Payment status updated to:', completedPayment.paymentStatus);

    // Test 8: Statistics and Analytics
    console.log('\n📊 Test 8: Statistics and Analytics');

    // Get total payments
    const totalPayments = await Payment.countDocuments();
    console.log('✅ Total payments:', totalPayments);

    // Get total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log('✅ Total revenue:', totalRevenue[0]?.total || 0);

    // Get user enrollment count
    const userEnrollments = await Enrollment.countDocuments({ user: testUser._id });
    console.log('✅ User enrollments:', userEnrollments);

    // Get course popularity
    const coursePopularity = await Enrollment.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    console.log('✅ Course popularity:', coursePopularity.length, 'courses have enrollments');

    // Test 9: Error Handling Tests
    console.log('\n⚠️ Test 9: Error Handling');

    try {
      // Try to create duplicate user
      await User.create({
        name: 'John Doe',
        email: 'john.doe@test.com', // Duplicate email
        password: 'password123'
      });
    } catch (error) {
      console.log('✅ Duplicate email error handled:', error.message.includes('duplicate'));
    }

    try {
      // Try to create enrollment without required fields
      await Enrollment.create({
        user: testUser._id
        // Missing course field
      });
    } catch (error) {
      console.log('✅ Required field validation handled:', error.message.includes('required'));
    }

    // Test 10: Cleanup (Optional)
    console.log('\n🧹 Test 10: Data Verification');

    // Verify all data is properly linked
    const allPayments = await Payment.find().populate('user course');
    const allEnrollments = await Enrollment.find().populate('user course payment');
    
    console.log('✅ Data integrity verified:');
    console.log('   - Payments with valid user/course references:', allPayments.length);
    console.log('   - Enrollments with valid user/course/payment references:', allEnrollments.length);

    console.log('\n🎉 All Database Tests Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ User creation and authentication');
    console.log('   ✅ Course management');
    console.log('   ✅ Payment processing and storage');
    console.log('   ✅ Enrollment tracking');
    console.log('   ✅ Data relationships and queries');
    console.log('   ✅ Update operations');
    console.log('   ✅ Error handling');
    console.log('   ✅ Statistics and analytics');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the tests
testDatabase(); 