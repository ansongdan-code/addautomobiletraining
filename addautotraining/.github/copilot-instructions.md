# AI Coding Agent Instructions - Auto Training Academy

> See `.github/AGENTS.md` for repo-specific custom agents that support auth, payments, deployment, frontend, and admin workflows.

## Project Architecture

This is a **full-stack MERN application** (MongoDB, Express, React, Node.js) for an automotive training platform with payment processing and admin management. The architecture uses a **monorepo pattern** where frontend React app and backend Express server share the same repository root.

- **Frontend**: React 18 with React Router 6, lazy-loaded components, localStorage for auth tokens
- **Backend**: Express 5 with Node 18+, MongoDB with Mongoose ODM
- **Auth**: JWT tokens (7-day expiry by default), role-based access (student < instructor < admin < super_admin)
- **Key integrations**: PayPal, Paystack, Cloudinary for file uploads

## Critical Data Flows

### Authentication Flow
1. User submits credentials → `/api/auth/login` creates JWT token
2. Token stored in `localStorage` as `'token'` and user object as `'user'`
3. All protected routes use `middleware/auth.js` to verify token and attach `req.user`
4. Role-based authorization checked via `authorize()` or `isAdmin()` middleware
5. Account lockouts available via `isActive` flag on User model

**Key files**: [middleware/auth.js](middleware/auth.js), [models/User.js](models/User.js), [routes/auth.js](routes/auth.js)

### Course Enrollment & Payment
- Students enroll in courses → creates entry in `User.enrolledCourses[]` array
- Payment flow: Create intent → Confirm payment → Update User progress
- Two payment gateways supported: PayPal (server-side) and Paystack (via HTTPS)
- Payment records stored independently; sync with course enrollment

**Key files**: [routes/payment.js](routes/payment.js), [routes/course.js](routes/course.js), [models/Course.js](models/Course.js)

### Frontend Auth & Routing
- Login modal triggers auth flow, stores token, redirects: admin/super_admin → `/admin`, others → `/dashboard`
- Lazy-loaded components prevent bundle bloat: [Dashboard](src/Dashboard.js), [Admin](src/Admin.js), [Payment](src/Payment.js), [Blog](src/Blog.js)
- Custom `showNotification()` utility provides toast feedback (success/error/info)

## Development Workflows

### Starting Development
```bash
npm install                    # Install all dependencies
npm run dev                    # Concurrent frontend (port 3000) + backend (5000) with React Scripts
# OR
npm start                      # Backend only (5000)
```

### Testing
```bash
npm test                       # React component tests (watch mode)
npm run test:server           # Jest server tests
npm run test:all              # Both (no watch)
npm run test:coverage         # Coverage reports
npm run test:admin            # Specific admin login test
```

### Build & Deployment
```bash
npm run build                 # React production build → `/build`
npm run build:prod            # Cross-env NODE_ENV=production build
npm run start:prod            # Run production build with server
docker-compose up             # Multi-container: MongoDB, backend, frontend (Nginx)
```

### GitHub Workflows
- **CI**: Runs on push/pull_request to main. Executes `npm run lint` and `npm run test:all` with MongoDB service.
- **Provision Admin**: Runs on push to main if `MONGO_URI` secret is present.
- **Issue Templates**: Standardized bug reports and feature requests.

## Project-Specific Patterns

### Error Handling & Responses
**All API responses follow this pattern**:
```javascript
// Success
{ success: true, data: {...}, message: "..." }
// Error
{ success: false, error: "User-friendly message", details?: {...} }
```
Errors should NOT expose sensitive data; check [routes/auth.js](routes/auth.js) and [middleware/auth.js](middleware/auth.js) for examples.

### Middleware Chain for Protected Routes
```javascript
router.post('/admin/course', 
  protect,                    // Verify JWT, attach req.user
  authorize('admin', 'super_admin'),  // Check roles
  validateInput,              // Validate request body
  controllerFunction
);
```
**Critical**: The `protect` middleware must run before `authorize()`. See [middleware/auth.js](middleware/auth.js#L49).

### Component Lazy Loading (React)
```javascript
const Dashboard = React.lazy(() => import('./Dashboard'));
// Always wrap in <Suspense> with fallback
<Suspense fallback={<div>Loading Dashboard...</div>}>
  <Dashboard />
</Suspense>
```
This prevents large component bundles from blocking initial page load.

### File Upload Handling
Files are uploaded via `multer` middleware [middleware/upload.js](middleware/upload.js) and optionally stored in Cloudinary. Paths must include:
- Size validation (10MB limit in server.js)
- MIME type validation
- Directory organization by file type

### MongoDB Connection & Retries
Server.js uses connection pooling (`maxPoolSize: 10`) and retry logic. **Never hardcode credentials**; use `process.env.MONGO_URI`. Docker compose specifies MongoDB authentication.

## Key File Locations & Responsibilities

| Path | Purpose |
|------|---------|
| [server.js](server.js) | Express setup, middleware chain, route mounting, MongoDB connection |
| [middleware/auth.js](middleware/auth.js) | JWT verification, role authorization, account deactivation checks |
| [models/User.js](models/User.js) | User schema with enrollment tracking, password hashing, role enum |
| [models/Course.js](models/Course.js) | Course content, pricing, enrollment counts, syllabus structure |
| [routes/auth.js](routes/auth.js) | Login, register, profile endpoints; includes JWT token creation |
| [routes/admin.js](routes/admin.js) | Admin-only operations (user management, course publishing) |
| [routes/payment.js](routes/payment.js) | Payment intent creation, confirmation, refunds; dual gateway support |
| [src/App.js](src/App.js) | React routing, auth state, login/register modals, role-based redirects |
| [src/Admin.js](src/Admin.js) | Admin dashboard component with tabs (Users, Courses, Analytics, WebEditor) |
| [.env](/.env) | Required: MONGO_URI, JWT_SECRET, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, REACT_APP_PAYPAL_CLIENT_ID |

## Common Pitfalls & Conventions

1. **Auth token format**: Always use `Bearer <token>` in Authorization header; middleware splits on space [line 10 of auth.js](middleware/auth.js#L10).

2. **Environment variables**: Used with safe defaults for development (e.g., `process.env.JWT_EXPIRE || '7d'`). Never log sensitive values.

3. **Payment gateways**: PayPal uses server-side SDK; Paystack uses HTTPS. Both require environment keys. Routes handle both gracefully if one is unavailable.

4. **Admin routes**: Require `super_admin` or `admin` role. User creation auto-assigns `student` role; manually update in MongoDB for other roles.

5. **Cloudinary optional**: File upload works without it (uploads to `/uploads` locally). Optional in package.json; don't force it.

6. **React state vs localStorage**: Auth token + user object MUST persist in localStorage to survive refreshes. Use `useEffect` to hydrate on mount [App.js line 48-52](src/App.js#L48).

7. **CORS**: Frontend proxy in package.json points to `http://localhost:5000` for dev. Production requires FRONTEND_URL env var in server.js.

8. **Website Editor**: Requires `super_admin` role; stores custom CSS per page in WebsiteSettings model; CSS injected into document head on route change.

## Quick Command Reference

| Task | Command |
|------|---------|
| Setup | `npm install && cp .env.example .env` |
| Dev | `npm run dev` |
| Test all | `npm run test:all` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Docker | `docker-compose up --build` |
| DB health | Check MongoDB connection in [server.js line 73](server.js#L73) logs |

## Payment Gateway Testing

### PayPal Sandbox Setup
1. Create sandbox accounts at [developer.paypal.com](https://developer.paypal.com)
2. Use sandbox credentials in `.env`:
   ```env
   PAYPAL_CLIENT_ID=sandbox_client_id
   PAYPAL_CLIENT_SECRET=sandbox_secret
   ```
3. **Test payment flow**: Login as sandbox merchant → create order → approve → capture
4. PayPal uses **server-side SDK** (`@paypal/checkout-server-sdk`); calls originate from backend, not client
5. Test amounts: Use `INSTRUMENT_DECLINED` to simulate failures, regular amounts for success

### Paystack Sandbox Setup
1. Register at [paystack.com](https://paystack.com) and enable test mode
2. Use sandbox credentials in `.env`:
   ```env
   PAYSTACK_PUBLIC_KEY=pk_test_your_key
   PAYSTACK_SECRET_KEY=sk_test_your_secret
   ```
3. **Test payment flow**: Initialize transaction → Redirect to Paystack → Verify reference
4. Paystack uses **HTTPS endpoint** (`api.paystack.co`); client redirects to Paystack UI
5. Test cards available in Paystack dashboard; reference verification happens on backend

### Common Payment Testing Issues
- **Token not persisting**: Ensure `localStorage.setItem('token', data.token)` is called in [src/App.js](src/App.js#L177)
- **Amount rounding**: Both gateways expect amounts in **smallest currency unit** (e.g., cents for USD)
- **Webhook validation**: In production, verify webhook signatures before processing; check [routes/payment.js](routes/payment.js) for examples

## API Endpoint Examples

### Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secure123"}'

# Login (returns token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secure123"}'

# Get current user (requires Bearer token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Course Management
```bash
# List all courses
curl -X GET http://localhost:5000/api/courses

# Create course (admin only)
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Advanced Engine Diagnostics",
    "description":"Learn modern engine diagnostic techniques",
    "price":299,
    "duration":{"weeks":8,"hours":40},
    "level":"advanced",
    "category":"diagnostic"
  }'

# Enroll in course
curl -X POST http://localhost:5000/api/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### Payment Processing
```bash
# Create payment intent
curl -X POST http://localhost:5000/api/payment/create-payment-intent \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":"COURSE_ID","amount":299,"gateway":"paypal"}'

# Confirm payment
curl -X POST http://localhost:5000/api/payment/confirm \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"PAYMENT_ID","transactionId":"TXN_ID"}'

# Get payment history
curl -X GET http://localhost:5000/api/payment/history \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

## Docker Debugging & Container Management

### View Container Logs
```bash
# Backend logs (Express/Node.js)
docker logs -f addauto_backend

# MongoDB logs
docker logs -f addauto_mongo

# Frontend logs (Nginx)
docker logs -f addauto_frontend

# All containers with timestamps
docker-compose logs --timestamps
```

### Container Troubleshooting
```bash
# Check container status
docker-compose ps

# Inspect container health
docker inspect addauto_backend --format='{{.State.Health}}'

# Execute command inside container
docker exec -it addauto_backend npm test

# View environment variables in container
docker exec addauto_backend env | grep MONGO_URI

# Rebuild specific service after code changes
docker-compose up --build backend
```

### Database Container Issues
```bash
# Connect to MongoDB inside container
docker exec -it addauto_mongo mongosh -u admin -p strongpassword

# Verify MongoDB initialized correctly
docker exec addauto_mongo echo 'db.adminCommand("ping")' | mongosh -u admin -p strongpassword

# Check persistent volume
docker volume inspect addauto_mongo_data
```

### Network & Port Issues
```bash
# Check if ports are bound
netstat -an | findstr :5000  # Windows
lsof -i :5000               # macOS/Linux

# View network details
docker network inspect app-network

# Clear dangling volumes (cleanup)
docker volume prune
```

## Website Editor & Custom Page System

### How WebsiteSettings Works
- **Model location**: [models/WebsiteSettings.js](models/WebsiteSettings.js)
- **Editor component**: [src/components/Admin/WebsiteEditor.js](src/components/Admin/WebsiteEditor.js)
- **API route**: [routes/website-editor.js](routes/website-editor.js)
- **Requires role**: `admin` or `super_admin`

### Page Creation & CSS Injection Flow
1. **Create/edit page**: Admin or super admin visits Website Editor tab → Edits page slug, title, custom CSS
2. **Store in DB**: CSS stored in `WebsiteSettings` collection per page slug
3. **Frontend render**: When user navigates to page, [App.js](src/App.js#L60) injects CSS into `<head>` via `useEffect`
4. **CSS format**: Must be valid CSS; sanitization recommended before storage (currently not implemented—add validation if user submissions enabled)

### Creating Custom Pages Programmatically
```javascript
// Example: Create a custom "about-us" page with branded CSS
const customCSS = `
  .page-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  .hero-title { font-size: 3em; color: white; }
`;

const response = await fetch('/api/website/settings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer SUPER_ADMIN_TOKEN`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pageSlug: 'about-us',
    pageTitle: 'About Us',
    customCSS: customCSS
  })
});
```

### Frontend CSS Injection Pattern
When user navigates, [App.js useEffect](src/App.js#L60) executes:
```javascript
useEffect(() => {
  const path = location.pathname || '/';
  const slugForPath = (p) => p.replace(/\//g, '').toLowerCase();
  const slug = slugForPath(path);
  
  // Fetch CSS for current page
  fetch(`/api/website/settings/${slug}`)
    .then(res => res.json())
    .then(data => {
      // Inject into <head>
      const style = document.createElement('style');
      style.textContent = data.data.customCSS || '';
      document.head.appendChild(style);
    });
}, [location.pathname]);
```

### Important Constraints
- **Admin or super_admin**: Regular users cannot access Website Editor
- **XSS risk**: Custom CSS cannot include scripts, but CSS3 injection attacks possible—validate regex patterns
- **No page routing**: Website Editor doesn't create routes; only injects CSS for existing paths (use `/about` not `/custom/about`)
- **CSS persistence**: Changes survive server restarts (stored in MongoDB); cleared when WebsiteSettings document deleted

## Debugging Tips

- **Auth issues**: Check token format in browser DevTools → Application → localStorage
- **CORS errors**: Verify FRONTEND_URL matches browser origin
- **Database errors**: Enable Mongoose debug with `mongoose.set('debug', true)`
- **Payment failures**: Check PayPal/Paystack credentials in .env; test with sandbox IDs first
- **Admin access denied**: Confirm user role is admin/super_admin in MongoDB (User.role field)
- **WebsiteEditor not visible**: Confirm logged-in user has `super_admin` role (not just `admin`)
- **Lazy component not loading**: Check browser Network tab for failed chunk downloads; verify React build completed
