const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentDetails,
  processRefund
} = require('../controllers/payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Payment processing routes
router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

// Payment history and details
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentDetails);

// Refund processing
router.post('/:id/refund', processRefund);

module.exports = router;
