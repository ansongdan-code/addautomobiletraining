const express = require('express');
const router = express.Router();
const https = require('https');
const { protect } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const WebsiteSettings = require('../models/WebsiteSettings');

// Initialize Paystack payment
router.post('/paystack/initialize', protect, async (req, res) => {
  try {
    const { courseId, email, amount } = req.body;
    
    // Validate input
    if (!courseId || !email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Course ID, email, and amount are required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get Paystack settings
    const settings = await WebsiteSettings.getSettings();
    const paystackSecretKey = settings.paymentMethods.paystack.secretKey;
    
    if (!paystackSecretKey) {
      return res.status(500).json({
        success: false,
        error: 'Paystack is not configured'
      });
    }

    // Prepare payment data
    const paymentData = {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      currency: 'NGN',
      reference: `course_${courseId}_${Date.now()}`,
      callback_url: `${req.protocol}://${req.get('host')}/payment/paystack/callback`,
      metadata: {
        courseId,
        userId: req.user.id,
        courseName: course.title
      }
    };

    // Initialize payment with Paystack
    const paystackResponse = await initializePaystackPayment(paymentData, paystackSecretKey);
    
    if (paystackResponse.status) {
      res.json({
        success: true,
        data: {
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          reference: paystackResponse.data.reference
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: paystackResponse.message
      });
    }
  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Verify Paystack payment
router.post('/paystack/verify', protect, async (req, res) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required'
      });
    }

    // Get Paystack settings
    const settings = await WebsiteSettings.getSettings();
    const paystackSecretKey = settings.paymentMethods.paystack.secretKey;
    
    // Verify payment with Paystack
    const verificationResponse = await verifyPaystackPayment(reference, paystackSecretKey);
    
    if (verificationResponse.status && verificationResponse.data.status === 'success') {
      const { courseId, userId } = verificationResponse.data.metadata;
      
      // Enroll user in course
      await enrollUserInCourse(userId, courseId);
      
      res.json({
        success: true,
        message: 'Payment successful and user enrolled in course',
        data: verificationResponse.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying Paystack payment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Paystack webhook endpoint
router.post('/paystack/webhook', async (req, res) => {
  try {
    const hash = req.headers['x-paystack-signature'];
    const body = JSON.stringify(req.body);
    
    // Get webhook secret from settings
    const settings = await WebsiteSettings.getSettings();
    const paystackSecretKey = settings.paymentMethods.paystack.secretKey;
    
    // Verify webhook signature
    const expectedHash = require('crypto')
      .createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex');
    
    if (hash !== expectedHash) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    const event = req.body;
    
    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get payment history for user
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.course', 'title price')
      .select('enrolledCourses');

    const paymentHistory = user.enrolledCourses.filter(
      enrollment => enrollment.paymentStatus === 'paid'
    );

    res.json({
      success: true,
      data: paymentHistory
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Helper functions
async function initializePaystackPayment(paymentData, secretKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(paymentData));
    req.end();
  });
}

async function verifyPaystackPayment(reference, secretKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function enrollUserInCourse(userId, courseId) {
  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!user || !course) {
      throw new Error('User or course not found');
    }

    // Check if user is already enrolled
    const existingEnrollment = user.enrolledCourses.find(
      enrollment => enrollment.course.toString() === courseId
    );

    if (existingEnrollment) {
      existingEnrollment.paymentStatus = 'paid';
    } else {
      user.enrolledCourses.push({
        course: courseId,
        paymentStatus: 'paid'
      });
    }

    await user.save();

    // Add user to course's enrolled students
    const existingStudentEnrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === userId
    );

    if (existingStudentEnrollment) {
      existingStudentEnrollment.paymentStatus = 'paid';
    } else {
      course.enrolledStudents.push({
        student: userId,
        paymentStatus: 'paid'
      });
    }

    await course.save();
  } catch (error) {
    console.error('Error enrolling user in course:', error);
    throw error;
  }
}

async function handleSuccessfulPayment(paymentData) {
  try {
    if (paymentData.metadata && paymentData.metadata.courseId && paymentData.metadata.userId) {
      await enrollUserInCourse(paymentData.metadata.userId, paymentData.metadata.courseId);
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentData) {
  try {
    console.log('Payment failed:', paymentData);
    // Handle failed payment logic here
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

module.exports = router;
