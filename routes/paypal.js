const express = require('express');
const {
  createOrder,
  captureOrder,
} = require('../controllers/paypal');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/capture-order', protect, captureOrder);

module.exports = router;
