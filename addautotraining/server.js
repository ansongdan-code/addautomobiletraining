const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
// PayPal SDK is optional; only require if available at runtime to avoid crashes
let paypal = null;
try {
  // attempt to require but do not throw if missing
  paypal = require('@paypal/checkout-server-sdk');
} catch (e) {
  // optional dependency in some environments
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

const User = require('./models/User');
const Course = require('./models/Course');
const Video = require('./models/Video');
const BlogPost = require('./models/BlogPost');
const WebsiteSettings = require('./models/WebsiteSettings');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const videoRoutes = require('./routes/video');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');
const paymentRoutes = require('./routes/payment');
const websiteEditorRoutes = require('./routes/website-editor');
const appEditorRoutes = require('./routes/app-editor');

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

// Compression middleware for better performance
app.use(compression());

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

// MongoDB connection with optimizations and retry logic
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

// Rate limiting with different limits for different endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased from 1000 to prevent admin dashboard from being blocked
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // More restrictive for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit file uploads
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/admin', uploadLimiter);
app.use('/api', generalLimiter);

// Static file serving with caching
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true
}));
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// PayPal integration (legacy)
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
if (paypal && clientId && clientSecret) {
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  const client = new paypal.core.PayPalHttpClient(environment);
  
  // Create PayPal order
  app.post('/api/orders', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: req.body.amount || '10.00'
        }
      }]
    });
  
    try {
      const order = await client.execute(request);
      res.json({ id: order.result.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  
  // Capture PayPal order
  app.post('/api/orders/:orderID/capture', async (req, res) => {
    const { orderID } = req.params;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
  
    try {
      const capture = await client.execute(request);
      res.json(capture.result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

// Website settings endpoint
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await WebsiteSettings.getSettings();
    res.json({
      success: true,
      data: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        logo: settings.logo,
        favicon: settings.favicon,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        socialMedia: settings.socialMedia,
        seo: settings.seo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch website settings'
    });
  }
});

// Global search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    let results = { courses: [], videos: [], blogs: [] };

    if (!type || type === 'courses') {
      results.courses = await Course.find({
        $text: { $search: q },
        status: 'published'
      }).limit(10).select('title description price level category');
    }

    if (!type || type === 'videos') {
      results.videos = await Video.find({
        $text: { $search: q },
        isPublic: true,
        isActive: true
      }).limit(10).select('title description thumbnailUrl duration');
    }

    if (!type || type === 'blogs') {
      results.blogs = await BlogPost.find({
        $text: { $search: q },
        status: 'published'
      }).limit(10).select('title excerpt slug publishedAt');
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error(`Search error: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});


// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});