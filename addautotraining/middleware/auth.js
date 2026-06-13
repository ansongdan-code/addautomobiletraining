const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Protect routes
exports.protect = async (req, res, next) => {
  if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      error: 'JWT_SECRET not configured'
    });
  }

  const secret = JWT_SECRET || 'dev_jwt_secret';
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Token verification error:', error);
    }
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Check if user is instructor or admin
exports.isInstructor = (req, res, next) => {
  if (!['instructor', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Instructor or admin access required'
    });
  }
  next();
};

// Generate JWT token
exports.generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';

  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set in environment');
  }

  return jwt.sign({ id }, secret, {
    expiresIn: JWT_EXPIRE
  });
};
