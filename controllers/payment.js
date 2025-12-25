const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Create payment intent
// @route   POST /api/v1/payment/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  const { courseId, amount, billingDetails } = req.body;

  try {
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        courseId: courseId,
        userId: req.user.id,
        courseTitle: course.title
      }
    });

    // Create payment record in database
    const payment = await Payment.create({
      user: req.user.id,
      course: courseId,
      amount: amount,
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      billingDetails: billingDetails || {}
    });

    res.status(200).json({ 
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (err) {
    console.error('Payment intent creation error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Payment processing failed' 
    });
  }
};

// @desc    Confirm payment and create enrollment
// @route   POST /api/v1/payment/confirm
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  const { paymentId, paymentIntentId } = req.body;

  try {
    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Update payment status in database
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: 'completed',
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment record not found'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: payment.course,
      payment: payment._id,
      enrollmentStatus: 'active'
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed and enrollment created',
      enrollment: enrollment
    });

  } catch (err) {
    console.error('Payment confirmation error:', err);
    res.status(500).json({
      success: false,
      error: 'Payment confirmation failed'
    });
  }
};

// @desc    Get user payment history
// @route   GET /api/v1/payment/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title description image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    console.error('Get payment history error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment history'
    });
  }
};

// @desc    Get payment details
// @route   GET /api/v1/payment/:id
// @access  Private
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('course', 'title description image')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Ensure user can only access their own payments
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    console.error('Get payment details error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment details'
    });
  }
};

// @desc    Process refund
// @route   POST /api/v1/payment/:id/refund
// @access  Private
exports.processRefund = async (req, res, next) => {
  const { refundAmount, reason } = req.body;

  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Payment must be completed to process refund'
      });
    }

    // Process refund through Stripe
    let refund;
    if (payment.stripePaymentIntentId) {
      refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount * 100, // Convert to cents
        reason: 'requested_by_customer'
      });
    }

    // Update payment record
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: 'refunded',
        refundedAt: Date.now(),
        refundAmount: refundAmount,
        refundReason: reason,
        updatedAt: Date.now()
      },
      { new: true }
    );

    // Update enrollment status
    await Enrollment.findOneAndUpdate(
      { payment: payment._id },
      { enrollmentStatus: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: updatedPayment
    });

  } catch (err) {
    console.error('Refund processing error:', err);
    res.status(500).json({
      success: false,
      error: 'Refund processing failed'
    });
  }
};
