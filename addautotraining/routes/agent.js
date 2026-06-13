const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const agentController = require('../controllers/agentController');

// Optional authentication for chat, but allowed for guests too if we handle it
router.post('/chat', (req, res, next) => {
  // If token provided, try to authenticate, else continue as guest
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    return protect(req, res, next);
  }
  next();
}, agentController.chat);

// Protected routes
router.get('/context', protect, agentController.getContext);

module.exports = router;
