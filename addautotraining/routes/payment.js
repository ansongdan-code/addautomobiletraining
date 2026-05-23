const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Initialize Paystack payment
router.post('/paystack/initialize', protect, paymentController.initializePaystack);

// Verify Paystack payment
router.post('/paystack/verify', protect, paymentController.verifyPaystack);

// Paystack webhook endpoint
router.post('/paystack/webhook', paymentController.paystackWebhook);

// Get payment history for user
router.get('/history', protect, paymentController.getPaymentHistory);

module.exports = router;
