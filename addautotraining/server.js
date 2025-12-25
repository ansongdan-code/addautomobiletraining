const express = require('express');
const mongoose = require('mongoose');
// PayPal SDK is optional; only require if available at runtime to avoid crashes
let paypal = null;
try {
  // attempt to require but do not throw if missing
  paypal = require('@paypal/checkout-server-sdk');
} catch (e) {
  console.log('PayPal checkout-server-sdk not available, legacy PayPal routes will be disabled');
}
const path = require('path');
const compression = require('compression');
require('dotenv').config();

// Safe defaults for frontend URL used by CORS
const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:3000');

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

const app = express();

// Trust proxy for accurate IP addresses when behind a load balancer/reverse proxy
app.set('trust proxy', 1);

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
}));

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with optimizations and retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying MongoDB connection in 5 seconds...');
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
    console.error('Search error:', error);
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});