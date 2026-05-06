# Auto Training Academy

A comprehensive automotive training platform built with React, Node.js, and MongoDB. The platform provides online courses, payment processing, admin management, and student dashboard functionality.

## 🚗 Features

### Frontend (React)

- **Responsive Design**: Mobile-first, responsive web application
- **User Authentication**: Secure login/registration with JWT tokens
- **Course Catalog**: Browse automotive training courses by category and skill level
- **Student Dashboard**: Track progress, access enrolled courses
- **Payment Integration**: PayPal and Paystack payment gateways
- **Blog System**: Educational content and industry news
- **Contact Forms**: Direct communication with instructors
- **Admin Panel**: Complete course and user management

### Backend (Node.js/Express)

- **RESTful API**: Well-structured API endpoints
- **Authentication & Authorization**: JWT-based auth with role-based access
- **Database Integration**: MongoDB with Mongoose ODM
- **File Upload**: Cloudinary integration for media files
- **Security**: Helmet, CORS, rate limiting, and data validation
- **Payment Processing**: PayPal and Paystack integrations

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router 6, Axios
- **Backend**: Node.js, Express 5, MongoDB, Mongoose
- **Security**: Helmet, JWT, CORS, Rate Limiting
- **Payments**: PayPal, Paystack
- **Testing**: Jest, React Testing Library, Supertest
- **Build Tools**: React Scripts, Babel, ESLint

## 📋 Prerequisites

- Node.js (v18.14.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (v5.0 or higher)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/username/addautotraining.git
cd addautotraining
npm install
```

### 2. Environment Setup

Create a `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/addautotraining
JWT_SECRET=your-jwt-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
NODE_ENV=development
PORT=5000
```

### 3. Start the Application
```bash
# Development mode (both frontend and backend)
npm run dev

# Backend only
npm start

# Production build
npm run build
npm run start:prod
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# React component tests
npm test

# Server/API tests
npm run test:server

# Test coverage
npm run test:coverage
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)

### Admin

- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user

## 🎨 Project Structure

```
addautotraining/
├── public/           # Static assets
├── src/             # React frontend
│   ├── components/  # React components
│   └── ...
├── models/          # MongoDB models
├── routes/          # Express routes
├── middleware/      # Custom middleware
├── test/           # Test files
└── ...
```

## 🚀 Deployment

### Production Build
```bash
npm run build:prod
```

### Environment Variables
Update `.env.production` with production values:
- Use strong JWT secrets
- Configure production database URI
- Set up production payment credentials

### Docker / Production (Optional)
If you prefer to run with Docker, there's a `docker-compose.yml` included to run MongoDB, the backend, and the frontend.

1. Build and start the stack:
```bash
docker-compose up --build -d
```

2. The backend will be reachable at `http://localhost:5000` and the frontend at `http://localhost:3000`.

3. **Admin users are auto-created on every backend container startup** via `docker-init.js`:
   - **Admin:** `admin@test.com` / `admin123`
   - **Super Admin:** `superadmin@test.com` / `superadmin123`

   The `docker-init.js` script runs before the Express server starts and automatically creates these users if they don't already exist in MongoDB. This ensures the application always has admin accounts available.

4. **Verify the provisioning** by checking backend logs:
```bash
docker-compose logs backend | grep "Docker Init"
```

   Expected output:
   ```
   [Docker Init] Connecting to MongoDB...
   [Docker Init] Connected to MongoDB
   [Docker Init] ✓ admin user created: admin@test.com
   [Docker Init] ✓ super_admin user created: superadmin@test.com
   [Docker Init] Admin users provisioning complete
   ```

5. **Test a login** to verify everything works:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"superadmin123"}'
```

   Expected response (HTTP 200):
   ```json
   {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
   ```

Note: Keeping `scripts/` out of production images is recommended. The above command mounts project files into a temporary container and runs the creation script against the `mongo` service.

## 🔐 Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Security headers with Helmet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

- Email: contact@autotrainingacademy.com
- Issues: [GitHub Issues](https://github.com/username/addautotraining/issues)

---

**Built with ❤️ for automotive education**
