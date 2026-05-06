# Manual Testing Guide - AddAuto Training Academy

> Complete guide for manual testing of website and mobile app functionality

---

## Quick Start Testing

### Prerequisites
- Node.js v18.14.0+
- MongoDB (local or Atlas connection)
- Git

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (copy from .env.example)
cp .env.example .env

# 3. Update .env with your credentials
# Required variables:
# - MONGO_URI=mongodb://localhost:27017/addautotraining
# - JWT_SECRET=your-secret-key-here
# - PAYPAL_CLIENT_ID=sandbox_client_id (optional for payment testing)
# - PAYPAL_CLIENT_SECRET=sandbox_secret (optional)
```

---

## Website Testing

### A. Development Mode

```bash
# Start both frontend (3000) and backend (5000) concurrently
npm run dev

# Wait for both services to start:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
```

### B. Manual User Workflows

#### 1. **User Registration** ✅
1. Navigate to http://localhost:3000
2. Click "Register" button
3. Fill form:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: SecurePass123
   - Confirm Password: SecurePass123
4. Click "Create Account"
5. **Expected:** Should redirect to Dashboard

#### 2. **User Login** ✅
1. Navigate to http://localhost:3000
2. Click "Login" button
3. Enter credentials:
   - Email: john@example.com
   - Password: SecurePass123
4. Click "Sign In"
5. **Expected:** Should redirect to Dashboard, token stored in localStorage

#### 3. **Student Dashboard** ✅
1. Login as regular user
2. Navigate to Dashboard
3. **Verify:**
   - User profile displayed
   - Enrolled courses listed
   - Course progress shown
   - Browse courses section available

#### 4. **Browse & Enroll in Course** ✅
1. Click "All Courses" or browse available courses
2. Click on a course
3. Review course details:
   - Title, description, price
   - Duration, level, category
   - Instructor info
4. Click "Enroll Now" (Free course) or "Proceed to Payment" (Paid)
5. **Expected:** Course added to enrolledCourses

#### 5. **Admin Access** ⚠️
To test admin features, manually update user role in database:

```bash
# Via MongoDB CLI
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { role: "admin" } }
)
```

Then:
1. Logout and login again
2. Should redirect to `/admin` automatically
3. **Access these sections:**
   - Dashboard (stats, analytics)
   - Users (manage, role assignment)
   - Courses (create, edit, publish)
   - Blog Posts (manage, publish)
   - Website Settings (branding, theme)

---

## API Testing (cURL Examples)

### Authentication Endpoints

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePass123"
  }'

# Response:
# { "token": "eyJhbGciOiJIUzI1NiIs..." }
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePass123"
  }'

# Response:
# { "token": "eyJhbGciOiJIUzI1NiIs..." }

# Save token for next requests
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "_id": "...",
#     "name": "Jane Doe",
#     "email": "jane@example.com",
#     "role": "student",
#     ...
#   }
# }
```

### Course Endpoints

#### Get All Courses
```bash
curl -X GET http://localhost:5000/api/courses

# Response: { list of published courses }
```

#### Enroll in Course
```bash
curl -X POST http://localhost:5000/api/courses/{courseId}/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response: { "success": true, "message": "Enrolled successfully" }
```

### Admin Endpoints

#### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "stats": {
#       "totalUsers": 10,
#       "totalCourses": 5,
#       "totalEnrollments": 15,
#       ...
#     }
#   }
# }
```

#### Get All Users (Paginated)
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "users": [...],
#     "pagination": { "page": 1, "limit": 10, "total": 50 }
#   }
# }
```

#### Create Course
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Engine Diagnostics",
    "description": "Learn modern diagnostic techniques",
    "price": 299,
    "duration": { "weeks": 8, "hours": 40 },
    "level": "advanced",
    "category": "diagnostic",
    "instructor": "'$ADMIN_ID'"
  }'
```

### Payment Endpoints

#### Initialize PayPal Payment
```bash
curl -X POST http://localhost:5000/api/payment/paypal/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course123",
    "amount": 299
  }'

# Response: { "id": "paypal-order-id" }
```

#### Initialize Paystack Payment
```bash
curl -X POST http://localhost:5000/api/payment/paystack/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course123",
    "email": "user@example.com",
    "amount": 29900  # in kobo (NGN)
  }'

# Response: { "success": true, "data": { "authorization_url": "https://checkout.paystack.com/..." } }
```

---

## Mobile App Testing

### Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# For Expo development
npm start

# For development on specific platform:
npm run android   # Android emulator/device
npm run ios       # iOS simulator (macOS only)
npm run web       # Web browser (testing)
```

### Mobile Test Scenarios

#### 1. **Authentication Persistence** ✅
1. Login on mobile app
2. Close and restart app
3. **Verify:** Should be logged in (token persisted)

#### 2. **API Communication** ✅
1. From mobile app, try:
   - Login
   - Fetch courses
   - Fetch user profile
2. **Verify:** Connects to backend at http://localhost:5000

#### 3. **Navigation** ✅
1. **Bottom Tab Navigation:**
   - Home → Courses
   - Profile → User Account
   - Drawer Menu → Additional options
2. **Verify:** All screens render without crashes

#### 4. **Responsive Design** ✅
1. Test on various screen sizes:
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1920x1080)
2. **Verify:** UI adapts correctly (via Expo web)

---

## Automated Testing

### Run Full Test Suite

```bash
# Both React component tests and server tests
npm run test:all

# React component tests only
npm test -- --watchAll=false

# Server/API tests only
npm run test:server

# Watch mode during development
npm run test           # React tests (watch mode)
npm run test:watch    # Server tests (watch mode)

# Code coverage report
npm run test:coverage
```

### Run Specific Test

```bash
# Admin login tests only
npm run test:admin

# App editor tests only
npm run test:server -- test/app-editor.test.js
```

---

## Performance Testing

### Browser DevTools

1. **Open Chrome DevTools** (F12)
2. **Network Tab:**
   - Go to http://localhost:3000
   - Monitor API calls to backend
   - Check response times
   - Verify gzip compression

3. **Performance Tab:**
   - Click "Record"
   - Interact with app
   - Check for any jank or stuttering
   - Review Core Web Vitals

4. **Console Tab:**
   - Check for JavaScript errors
   - Verify no warnings
   - Monitor API response times

### Database Performance

```bash
# Test concurrent users with MongoDB
# Use MongoDB Compass to monitor connections

# Check collection sizes
db.users.countDocuments()
db.courses.countDocuments()
db.blogposts.countDocuments()

# Check indexes
db.users.getIndexes()
```

---

## Common Test Scenarios

### Scenario 1: Complete Enrollment Flow
```
1. Register new student
2. Browse courses
3. Enroll in free course
4. View course content
5. Complete course (mark as done)
```

### Scenario 2: Admin Course Management
```
1. Login as admin
2. Create new course
3. Add course details (title, description, price)
4. Add course modules/lessons
5. Set course as draft
6. Publish course
7. Verify course appears in public listing
```

### Scenario 3: Payment Transaction (Sandbox)
```
1. Login as student
2. Enroll in paid course
3. Click "Pay Now"
4. Use PayPal sandbox credentials:
   - Email: sb-xxxxx@personal.example.com
   - Password: (provided by PayPal sandbox)
5. Complete payment
6. Verify enrollment updated
```

### Scenario 4: Admin User Management
```
1. Login as admin
2. Go to Users section
3. Search for user
4. Change user role (student → instructor)
5. Deactivate user account
6. Verify deactivated user cannot login
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Verify connection URI in .env
echo %MONGO_URI%

# Test connection
mongosh "mongodb://localhost:27017/addautotraining"
```

### JWT Token Errors
```bash
# Verify JWT_SECRET is set and ≥32 chars (production)
echo %JWT_SECRET%

# Generate new JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Clear Browser Cache
```bash
# Ctrl+Shift+Delete to clear cache
# Or in DevTools: Settings → Application → Clear Site Data
# Clear localStorage:
localStorage.clear()
```

---

## Regression Testing Checklist

After code changes, verify:

- [ ] User can register
- [ ] User can login
- [ ] JWT token validates
- [ ] Admin can access dashboard
- [ ] Regular user cannot access admin routes
- [ ] Roles are enforced (student, instructor, admin, super_admin)
- [ ] Courses display correctly
- [ ] Can enroll in courses
- [ ] Can update user profile
- [ ] Logout clears token
- [ ] No console errors
- [ ] No ESLint warnings
- [ ] All tests pass

---

## Success Criteria

✅ **Website Testing Complete When:**
- User registration/login works
- Admin dashboard accessible to admins only
- Courses browse & enroll functional
- No JavaScript errors in console
- All API responses status 200/201/400/401/403 as expected

✅ **Mobile Testing Complete When:**
- App launches without crashes
- Can login and token persists
- Navigation works smoothly
- API calls succeed
- UI is responsive

✅ **Overall QA Complete When:**
- 52/52 automated tests pass
- Manual workflows completed successfully
- No critical bugs found
- Performance meets expectations
- Security validations passed

---

**Last Updated:** May 3, 2026  
**Test Guide Version:** 1.0

