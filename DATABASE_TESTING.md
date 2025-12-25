# Database Testing Guide

This guide will help you test the database functionality for storing payment and login information in the Auto Training Academy application.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/auto-training-academy

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Stripe Configuration (for payment testing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install additional testing dependencies
npm install axios --save-dev
```

## 🗄️ Database Models

The application uses the following MongoDB models:

### User Model (`models/User.js`)
- **Fields**: name, email, password, role, resetPasswordToken, resetPasswordExpire
- **Features**: Password hashing, JWT token generation, password validation
- **Indexes**: Email uniqueness

### Course Model (`models/Course.js`)
- **Fields**: title, description, price, image, createdAt
- **Features**: Course catalog management

### Payment Model (`models/Payment.js`)
- **Fields**: user, course, amount, currency, paymentMethod, paymentStatus, transactionId
- **Features**: Multiple payment methods (Stripe, PayPal, PayStack), billing details, refund tracking
- **Indexes**: Transaction ID uniqueness

### Enrollment Model (`models/Enrollment.js`)
- **Fields**: user, course, payment, enrollmentStatus, progress, completedModules
- **Features**: Progress tracking, certificate management, module completion
- **Indexes**: Unique user-course combination

## 🧪 Testing Procedures

### 1. Database Setup Test

Run the database setup script to initialize the database with sample data:

```bash
node setup-database.js
```

**Expected Output:**
```
🚀 Setting up database...
✅ MongoDB Connected: localhost
🧹 Clearing existing data...
✅ Existing data cleared
📚 Creating sample courses...
✅ Created 6 courses
👥 Creating sample users...
✅ Created 3 users
💳 Creating sample payments and enrollments...
✅ Created 3 payments and 3 enrollments
📊 Database Statistics:
   👥 Users: 3
   📚 Courses: 6
   💳 Payments: 3
   🎓 Enrollments: 3
   💰 Total Revenue: $1129.97
🎉 Database setup completed successfully!
```

### 2. Database Functionality Test

Run the comprehensive database test:

```bash
node test-database.js
```

**Test Coverage:**
- ✅ User creation and authentication
- ✅ Course management
- ✅ Payment processing and storage
- ✅ Enrollment tracking
- ✅ Data relationships and queries
- ✅ Update operations
- ✅ Error handling
- ✅ Statistics and analytics

### 3. API Testing

Start the server first:

```bash
node server.js
```

Then run the API tests:

```bash
node test-api.js
```

**API Endpoints Tested:**
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `GET /api/v1/courses` - List all courses
- `POST /api/v1/payment/create-payment-intent` - Create payment intent
- `GET /api/v1/payment/history` - Payment history
- `GET /api/v1/payment/:id` - Payment details

## 💳 Payment Testing

### Stripe Integration

1. **Test Payment Flow:**
   ```javascript
   // Create payment intent
   POST /api/v1/payment/create-payment-intent
   {
     "courseId": "course_id_here",
     "amount": 299.99,
     "billingDetails": {
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com"
     }
   }
   ```

2. **Confirm Payment:**
   ```javascript
   POST /api/v1/payment/confirm
   {
     "paymentId": "payment_id_here",
     "paymentIntentId": "pi_stripe_payment_intent_id"
   }
   ```

### Payment Status Tracking

The system tracks payment statuses:
- `pending` - Payment initiated but not completed
- `completed` - Payment successfully processed
- `failed` - Payment failed
- `refunded` - Payment refunded
- `cancelled` - Payment cancelled

## 🔐 Authentication Testing

### User Registration
```javascript
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### User Login
```javascript
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Password Reset
```javascript
POST /api/auth/forgotpassword
{
  "email": "test@example.com"
}
```

## 📊 Database Queries

### Sample Queries for Testing

1. **Get User with Enrollments:**
   ```javascript
   const user = await User.findById(userId)
     .populate({
       path: 'enrollments',
       populate: { path: 'course' }
     });
   ```

2. **Get Payment History:**
   ```javascript
   const payments = await Payment.find({ user: userId })
     .populate('course', 'title price')
     .sort({ createdAt: -1 });
   ```

3. **Get Course Statistics:**
   ```javascript
   const stats = await Enrollment.aggregate([
     { $group: { _id: '$course', count: { $sum: 1 } } },
     { $sort: { count: -1 } }
   ]);
   ```

4. **Get Revenue Analytics:**
   ```javascript
   const revenue = await Payment.aggregate([
     { $match: { paymentStatus: 'completed' } },
     { $group: { _id: null, total: { $sum: '$amount' } } }
   ]);
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   ```
   Error: MongoDB connection error
   ```
   **Solution:** Ensure MongoDB is running and the connection string is correct.

2. **JWT Token Error:**
   ```
   Error: jwt must be provided
   ```
   **Solution:** Check JWT_SECRET in .env file and ensure it's properly set.

3. **Payment Intent Creation Failed:**
   ```
   Error: Payment processing failed
   ```
   **Solution:** Verify Stripe API keys and ensure the course exists.

4. **Duplicate Key Error:**
   ```
   Error: E11000 duplicate key error
   ```
   **Solution:** Check for unique constraints (email, transactionId) and ensure no duplicates.

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=mongoose:*
```

### Database Backup

Before running tests, consider backing up your database:
```bash
mongodump --db auto-training-academy --out ./backup
```

## 📈 Performance Testing

### Load Testing

Use tools like Apache Bench or Artillery to test API performance:

```bash
# Test course listing endpoint
ab -n 100 -c 10 http://localhost:5000/api/v1/courses

# Test authentication endpoint
ab -n 50 -c 5 -p login.json -T application/json http://localhost:5000/api/auth/login
```

### Database Performance

Monitor database performance with:
```javascript
// Enable query logging
mongoose.set('debug', true);

// Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 });
```

## 🔒 Security Testing

### Input Validation
- Test SQL injection attempts
- Test XSS payloads
- Test malformed JSON data

### Authentication Security
- Test expired tokens
- Test invalid tokens
- Test role-based access control

### Payment Security
- Test invalid payment amounts
- Test duplicate transaction IDs
- Test refund security

## 📝 Test Data Management

### Sample Data
The setup script creates realistic test data including:
- 6 automotive courses
- 3 test users (2 students, 1 admin)
- Sample payments and enrollments

### Data Cleanup
To reset the database:
```bash
node setup-database.js
```

## 🎯 Success Criteria

A successful database test should demonstrate:

1. ✅ **User Management**
   - User registration and login
   - Password hashing and validation
   - JWT token generation and verification

2. ✅ **Course Management**
   - Course creation and retrieval
   - Course catalog functionality

3. ✅ **Payment Processing**
   - Payment intent creation
   - Payment status tracking
   - Refund processing
   - Transaction history

4. ✅ **Enrollment Tracking**
   - Course enrollment creation
   - Progress tracking
   - Module completion

5. ✅ **Data Integrity**
   - Proper relationships between models
   - Unique constraints enforcement
   - Data validation

6. ✅ **Error Handling**
   - Graceful error responses
   - Input validation
   - Security measures

## 📞 Support

If you encounter issues during testing:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check network connectivity for external API calls
5. Review the application logs in `server_output.log`

For additional help, refer to the main README.md file or create an issue in the project repository. 