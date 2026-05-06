# 📚 Auto Training Academy - API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Environment:** Development/Production

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "superadmin@test.com",
  "password": "superadmin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "694c95f3925437c520291aef",
    "email": "superadmin@test.com",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email or password
- `401 Unauthorized` - Credentials don't match

---

### Register

**Endpoint:** `POST /auth/register`

**Description:** Create new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "new_user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

---

### Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout user (optional - JWT is stateless)

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## ⚙️ Settings

### Get Site Settings

**Endpoint:** `GET /settings`

**Description:** Retrieve site configuration, branding, and metadata

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "settings_id",
    "siteName": "Auto Training Academy",
    "siteDescription": "Professional automotive training platform",
    "logo": null,
    "favicon": null,
    "primaryColor": "#2196F3",
    "secondaryColor": "#FFC107",
    "socialMedia": {
      "facebook": "https://facebook.com",
      "twitter": "https://twitter.com",
      "instagram": "https://instagram.com",
      "linkedin": "https://linkedin.com",
      "youtube": "https://youtube.com",
      "tiktok": "https://tiktok.com"
    },
    "seo": {
      "metaTitle": "Auto Training Academy - Professional Automotive Training",
      "metaDescription": "Professional automotive training courses...",
      "keywords": [],
      "googleAnalytics": null,
      "facebookPixel": null
    }
  }
}
```

---

### Update Site Settings

**Endpoint:** `PUT /settings`

**Headers:** `Authorization: Bearer <JWT_TOKEN>` (Admin/Super Admin required)

**Description:** Update site configuration

**Request Body:**
```json
{
  "siteName": "My Auto Academy",
  "siteDescription": "Updated description",
  "primaryColor": "#FF5722",
  "secondaryColor": "#4CAF50"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": { ... }
}
```

---

## 📚 Courses

### Get All Courses

**Endpoint:** `GET /courses`

**Description:** List all published courses with pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `level` (optional): Filter by level (beginner, intermediate, advanced)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "course_id",
      "title": "Engine Fundamentals",
      "description": "Learn engine basics...",
      "price": 29.99,
      "duration": { "weeks": 10, "hours": 40 },
      "level": "beginner",
      "category": "engine",
      "instructor": { "_id": "user_id", "name": "John Smith" },
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### Get Single Course

**Endpoint:** `GET /courses/:id`

**Description:** Get detailed course information

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "course_id",
    "title": "Engine Fundamentals",
    "description": "...",
    "content": "...",
    "instructor": { ... },
    "syllabus": [
      {
        "title": "Module 1: Basics",
        "description": "...",
        "duration": 480,
        "videos": []
      }
    ]
  }
}
```

---

### Create Course (Admin only)

**Endpoint:** `POST /courses`

**Headers:** `Authorization: Bearer <JWT_TOKEN>` (Admin/Super Admin required)

**Request Body:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "price": 49.99,
  "duration": { "weeks": 12, "hours": 50 },
  "level": "intermediate",
  "category": "transmission"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 📝 Blog Posts

### Get All Blog Posts

**Endpoint:** `GET /blog`

**Description:** List all published blog posts

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `featured` (optional): Show only featured posts

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "blog_id",
      "title": "Top 10 Car Maintenance Tips",
      "slug": "top-10-car-maintenance-tips",
      "excerpt": "Essential maintenance tips...",
      "author": { "_id": "user_id", "name": "Admin" },
      "category": "maintenance",
      "views": 2340,
      "featured": true,
      "createdAt": "2025-12-25T08:00:00Z"
    }
  ]
}
```

---

### Get Single Blog Post

**Endpoint:** `GET /blog/:slug`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "blog_id",
    "title": "Title",
    "content": "<h2>Content...</h2>",
    "author": { ... },
    "tags": ["tag1", "tag2"]
  }
}
```

---

### Create Blog Post (Admin only)

**Endpoint:** `POST /blog`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "content": "<p>Content here</p>",
  "excerpt": "Short excerpt",
  "category": "maintenance",
  "tags": ["tag1", "tag2"],
  "featured": false
}
```

---

## 👨‍💼 Admin Dashboard

### Get Dashboard Statistics

**Endpoint:** `GET /admin/dashboard`

**Headers:** `Authorization: Bearer <JWT_TOKEN>` (Admin/Super Admin required)

**Description:** Get overview statistics for admin dashboard

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalCourses": 5,
    "totalRevenue": 125000.50,
    "activeLearners": 892,
    "recentEnrollments": [
      {
        "_id": "enrollment_id",
        "user": { ... },
        "course": { ... },
        "enrolledAt": "2025-12-25T08:00:00Z"
      }
    ]
  }
}
```

---

## ✏️ Website Editor (Admin and Super Admin)

### Get All Pages

**Endpoint:** `GET /website/editor/pages`

**Headers:** `Authorization: Bearer <JWT_TOKEN>` (Admin or Super Admin required)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "page_id",
      "title": "About Us",
      "slug": "about-us",
      "content": "<h1>About</h1>...",
      "isPublished": true,
      "createdAt": "2025-12-25T08:00:00Z"
    }
  ]
}
```

---

### Create Page

**Endpoint:** `POST /website/editor/pages`

**Headers:** `Authorization: Bearer <JWT_TOKEN>` (Super Admin required)

**Request Body:**
```json
{
  "title": "New Page",
  "slug": "new-page",
  "content": "<h1>Page Content</h1>",
  "description": "Page description",
  "isPublished": true,
  "seo": {
    "title": "SEO Title",
    "description": "SEO Description",
    "keywords": ["keyword1", "keyword2"]
  },
  "customCSS": "body { color: red; }",
  "customJavaScript": "console.log('Page loaded');"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update Page

**Endpoint:** `PUT /website/editor/pages/:id`

**Headers:** `Authorization: Bearer <JWT_TOKEN>` (Super Admin required)

**Request Body:** Same as create

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Page updated successfully",
  "data": { ... }
}
```

---

### Delete Page

**Endpoint:** `DELETE /website/editor/pages/:id`

**Headers:** `Authorization: Bearer <JWT_TOKEN>` (Super Admin required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Page deleted successfully"
}
```

---

## 🔑 Available Roles

- `user` - Regular user with course enrollment access
- `admin` - Admin dashboard access
- `super_admin` - Full access including website editor

---

## 📝 Course Categories

- `engine` - Engine systems
- `transmission` - Transmission & drivetrain
- `brakes` - Brake systems
- `suspension` - Suspension systems
- `electrical` - Electrical systems
- `diagnostic` - Diagnostic techniques
- `hybrid` - Hybrid vehicles
- `electric` - Electric vehicles
- `general` - General automotive knowledge

---

## 📊 Error Responses

All endpoints follow standard error response format:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

**Common Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"superadmin123"}'
```

### Get Courses
```bash
curl -X GET http://localhost:5000/api/courses
```

### Get Protected Dashboard
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get Website Pages
```bash
curl -X GET http://localhost:5000/api/website/editor/pages \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 📱 Frontend Integration

The React frontend at `http://localhost:3000` includes:
- User authentication flow
- Course listing and enrollment
- Admin dashboard with statistics
- Website editor for super admin users
- Blog post viewing
- Settings management

---

**Last Updated:** December 25, 2025  
**Documentation Version:** 1.0.0
