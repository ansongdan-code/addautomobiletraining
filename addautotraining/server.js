const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
// PayPal SDK is optional; prefer the maintained server SDK if available
let paypal = null;
try {
  // Try recommended package first
  paypal = require('@paypal/paypal-server-sdk');
} catch (e1) {
  try {
    // Fallback to legacy package if present
    paypal = require('@paypal/checkout-server-sdk');
  } catch (e2) {
    // optional dependency in some environments
  }
}
const path = require('path');
const compression = require('compression');
require('dotenv').config();
const swaggerSpec = require('./docs/swagger');
const logger = require('./utils/logger');

if (!paypal) {
  logger.warn('PayPal checkout-server-sdk not available, legacy PayPal routes will be disabled');
}

const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000');

const REQUIRED_PROD_ENV = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];

const validateProductionEnv = () => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing = REQUIRED_PROD_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    logger.error(`Missing required production environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long in production.');
    process.exit(1);
  }
};

validateProductionEnv();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const videoRoutes = require('./routes/video');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');
const paymentRoutes = require('./routes/payment');
const websiteEditorRoutes = require('./routes/website-editor');
const appEditorRoutes = require('./routes/app-editor');
const agentRoutes = require('./routes/agent');
const errorHandler = require('./middleware/error');

const app = express();

// Trust proxy for accurate IP addresses when behind a load balancer/reverse proxy
app.set('trust proxy', 1);

if (process.env.ENABLE_HTTPS_REDIRECT === 'true') {
  app.use((req, res, next) => {
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (req.secure || forwardedProto === 'https') {
      return next();
    }
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// Security and performance middleware
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Compression middleware for better performance
app.use(compression());

// Sanitize data
app.use(mongoSanitize());

// Enhanced security with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

// CORS configuration
const allowedOrigins = [FRONTEND_URL].filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: logger.stream
}));

// Raw body parser for Paystack webhook verification
app.use('/api/payment/paystack/webhook', express.raw({
  type: 'application/json',
  limit: '10mb'
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    logger.info('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const agentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'AI Agent quota exceeded for this hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/agent', agentLimiter);
app.use('/api', generalLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/website', websiteEditorRoutes);
app.use('/api/editor', appEditorRoutes);
app.use('/api/agent', agentRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true
}));
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Global Error Handler (MUST BE LAST)
app.use(errorHandler);

// Export app for use in Vercel and tests
app.app = app;
app.startServer = () => {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
      logger.info('HTTP server closed');
      mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  return server;
};

module.exports = app;

// Start server only when this file is run directly.
if (require.main === module) {
  app.startServer();
}
