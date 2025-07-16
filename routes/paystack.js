const express = require('express');
const {
  initializePayment,
  verifyPayment,
} = require('../controllers/paystack');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/initialize-payment', protect, initializePayment);
router.get('/verify-payment/:reference', protect, verifyPayment);

module.exports = router;
