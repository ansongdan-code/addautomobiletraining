const express = require('express');
const {
  createPaymentIntent,
} = require('../controllers/payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router;
