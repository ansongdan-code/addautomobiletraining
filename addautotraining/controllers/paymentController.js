const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

const handleError = (res, error, context) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    logger.error(`${context}: ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`${context}: ${error.message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? 'Server error' : error.message
  });
};

exports.initializePaystack = async (req, res) => {
  try {
    const data = await paymentService.initializePaystackPayment({
      courseId: req.body.courseId,
      email: req.body.email,
      user: req.user,
      protocol: req.protocol,
      host: req.get('host')
    });

    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error initializing Paystack payment');
  }
};

exports.verifyPaystack = async (req, res) => {
  try {
    const data = await paymentService.verifyPaystackPayment({
      reference: req.body.reference,
      authenticatedUserId: req.user.id
    });

    res.json({
      success: true,
      message: 'Payment successful and user enrolled in course',
      data
    });
  } catch (error) {
    return handleError(res, error, 'Error verifying Paystack payment');
  }
};

exports.paystackWebhook = async (req, res) => {
  try {
    await paymentService.processPaystackWebhook({
      signature: req.headers['x-paystack-signature'],
      rawBody: req.body
    });

    res.json({ success: true });
  } catch (error) {
    return handleError(res, error, 'Error processing Paystack webhook');
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const data = await paymentService.getPaymentHistory(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching payment history');
  }
};
