# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

# Auto Training Academy - Development Guide

A comprehensive automotive training platform built with React, Node.js, Express, and MongoDB. This platform provides online courses, payment processing, admin management, and student dashboard functionality.

## Development Workflows

### Prerequisites
- Node.js v18.14.0 or higher
- npm v8.0.0 or higher  
- MongoDB v5.0 or higher

### Environment Setup
Create a `.env` file with required variables:
```env
MONGO_URI=mongodb://localhost:27017/addautotraining
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=24h
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
NODE_ENV=development
PORT=5000
```

### Development Server
```bash
# Development mode (concurrent frontend + backend)
npm run dev

# Backend only
npm start

# Frontend only 
cd src && npx react-scripts start
```

## Common Commands

### Building and Testing
```bash
# Build for production
npm run build
npm run build:prod  # with NODE_ENV=production

# Run all tests
npm run test:all

# React component tests
npm test

# Server/API tests
npm run test:server

# Run specific admin tests
npm run test:admin

# Test coverage
npm run test:coverage

# Watch mode for server tests
npm run test:watch
```

### Code Quality
```bash
# Lint JavaScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Production Deployment
```bash
# Production server
npm run start:prod

# PM2 cluster mode
pm2 start ecosystem.config.js --env production

# Monitor with PM2
pm2 monit
pm2 logs addautotraining
```

## Architecture Overview

### Frontend Architecture (React)
- **Single Page Application** with React Router 6
- **Lazy Loading**: All major components use React.lazy() for code splitting
- **Authentication Flow**: JWT-based with localStorage persistence
- **State Management**: React hooks and context (no external state library)
- **Component Structure**:
  - App.js - Main application with routing and auth
  - Dashboard.js - Student dashboard and course management
  - Admin.js - Administrative interface
  - Blog.js - Blog system with content management
  - Contact.js - Contact forms and communication
  - Payment.js - Payment processing integration

### Backend Architecture (Express/Node.js)
- **RESTful API** design with Express 5
- **Authentication**: JWT tokens with role-based access control
- **Security Middleware**: Helmet, CORS, rate limiting, input validation
- **File Upload**: Multer with Cloudinary integration
- **Database**: MongoDB with Mongoose ODM
- **Payment Integration**: PayPal and Paystack support

### Key API Routes
```
/api/auth/*     - Authentication (register, login, profile)
/api/courses/*  - Course management and enrollment
/api/admin/*    - Administrative operations
/api/blog/*     - Blog content management
/api/videos/*   - Video content management
/api/payment/*  - Payment processing
/health         - Health check endpoint
```

### Database Models
- **User**: Authentication, roles (student/instructor/admin/super_admin), course enrollment
- **Course**: Course content, pricing, enrollment management, reviews
- **Video**: Video content with access control
- **BlogPost**: Blog content management system
- **WebsiteSettings**: Configurable site settings

### Authentication & Authorization
- **JWT Tokens** with configurable expiration
- **Role-Based Access**: student < instructor < admin < super_admin
- **Protected Routes**: Middleware checks for valid tokens and appropriate roles
- **Account Security**: Login attempt tracking, account locking

## Code Structure

### Project Organization
```
addautotraining/
├── src/                    # React frontend source
│   ├── components/         # Reusable React components
│   │   └── Admin/         # Admin-specific components
│   ├── App.js             # Main app with routing (lazy loading)
│   ├── Dashboard.js       # Student dashboard
│   ├── Admin.js           # Admin interface
│   └── *.css             # Component-specific styles
├── models/                # MongoDB schemas
│   ├── User.js           # User model with auth methods
│   ├── Course.js         # Course model with enrollment
│   ├── Video.js          # Video content model
│   ├── BlogPost.js       # Blog content model
│   └── WebsiteSettings.js # Site configuration
├── routes/               # Express API routes
│   ├── auth.js          # Authentication endpoints
│   ├── admin.js         # Admin management APIs
│   ├── course.js        # Course management
│   ├── blog.js          # Blog management
│   ├── video.js         # Video management
│   └── payment.js       # Payment processing
├── middleware/           # Custom middleware
│   ├── auth.js          # JWT authentication & authorization
│   └── upload.js        # File upload handling
├── test/                # Test files
│   ├── setup.js         # Jest configuration
│   └── *.test.js        # Test suites
├── public/              # Static assets
├── build/               # Production build output
├── server.js            # Express server entry point
├── ecosystem.config.js  # PM2 process management
└── vercel.json         # Vercel deployment config
```

### Key Configuration Files
- **package.json**: Dependencies, scripts, and project metadata
- **jest.config.js**: Test configuration for server-side tests
- **ecosystem.config.js**: PM2 cluster configuration
- **vercel.json**: Vercel deployment configuration
- **.env**: Environment variables (development)
- **.env.production**: Production environment variables

## Testing Strategy

### Test Configuration
- **Jest**: Primary testing framework
- **Supertest**: API endpoint testing
- **React Testing Library**: Component testing
- **Test Environment**: Separate test database and configurations

### Test Categories
```bash
# React component tests (using React Testing Library)
npm test

# Server API tests (using Jest + Supertest)
npm run test:server

# Admin-specific functionality tests
npm run test:admin

# Full test suite
npm run test:all
```

### Test Structure
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints with database interactions
- **Authentication Tests**: Login flows, JWT validation, role permissions
- **Admin Tests**: Administrative functionality validation

### Running Single Tests
```bash
# Run specific test file
npx jest test/admin-login.test.js --testEnvironment=node

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Watch mode for development
npm run test:watch
```

## Deployment Considerations

### Production Build
```bash
# Create production build
npm run build:prod

# Verify build integrity
ls -la build/
```

### PM2 Process Management
The ecosystem.config.js provides cluster mode configuration:
```bash
# Start in cluster mode
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit
pm2 list
pm2 logs addautotraining

# Reload without downtime
pm2 reload addautotraining
```

### Environment Variables (Production)
Critical production environment variables:
- `NODE_ENV=production`
- `MONGO_URI` - Production MongoDB connection string
- `JWT_SECRET` - Secure random string (256-bit recommended)
- `PAYPAL_CLIENT_ID/SECRET` - Live PayPal credentials
- `FRONTEND_URL` - Production domain for CORS

### Security Considerations
- **Rate Limiting**: Different limits for auth, admin, and general endpoints
- **CORS Configuration**: Environment-specific origin whitelist
- **Security Headers**: Helmet middleware with CSP
- **Input Validation**: Express-validator on all inputs
- **File Upload Security**: Type checking and size limits

## Development Best Practices

### Code Organization
- **Component Lazy Loading**: All routes use React.lazy() for code splitting
- **API Route Organization**: Grouped by functionality (auth, admin, courses)
- **Middleware Separation**: Authentication, file handling, and validation separated
- **Error Handling**: Consistent error responses across all endpoints

### Database Patterns
- **Model Relationships**: Proper use of MongoDB references
- **Indexing**: Performance indexes on frequently queried fields
- **Validation**: Schema-level validation with custom validators
- **Security**: Password hashing, account locking mechanisms

### Authentication Flow
1. User provides credentials
2. Server validates and creates JWT
3. Client stores token and includes in requests
4. Middleware validates token and user status
5. Role-based access control applied

### File Upload Workflow
1. Multer middleware processes uploads
2. Files organized by type (avatars, course images, blog images)
3. Cloudinary integration for cloud storage (optional)
4. File size and type validation

## Troubleshooting

### Common Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Database connection issues
# Check MongoDB status and connection string
mongosh "your-connection-string"

# Build failures
# Check Node.js version compatibility
node --version  # Should be v18.14.0+

# PM2 process issues
pm2 restart addautotraining
pm2 flush  # Clear logs
```

### Performance Monitoring
- Health check endpoint: `GET /health`
- PM2 monitoring: `pm2 web` (web dashboard)
- Application logs: `pm2 logs addautotraining`

### Development Debugging
- Server logs: Console output includes request logging (Morgan)
- Client debugging: React DevTools, browser console
- API testing: Use tools like Postman or curl for endpoint testing

---

For additional information, refer to:
- `README.md` - Setup and installation guide
- `DEPLOYMENT.md` - Detailed deployment instructions
- `PROJECT_STATUS.md` - Current project status and features
- `TROUBLESHOOTING.md` - Extended troubleshooting guide

**Version**: 1.0.0 | **Last Updated**: December 2024
