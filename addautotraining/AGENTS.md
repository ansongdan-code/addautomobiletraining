# AI Agent Guide - AddAuto Training Academy MERN Platform

> Comprehensive guidance for AI coding agents working on this automotive training platform.

## Architecture Overview

**Monorepo Structure**: Frontend and backend coexist in one repo without package.json separation.
- **Frontend**: React 18 in `/src` with lazy-loaded components (`React.lazy()` wrapped in `<Suspense>`)
- **Backend**: Express 5 server at `server.js` with routes in `/routes`, models in `/models`, middleware in `/middleware`
- **Database**: MongoDB with Mongoose ODM; connection pooling (`maxPoolSize: 10`) with retry logic in server.js:126-137
- **Deployment**: Docker Compose (mongo 6, backend, frontend/Nginx) with environment-driven config

## Critical Request/Response Patterns

All API endpoints follow this standard:
```javascript
// SUCCESS: { success: true, data: {...}, message?: "..." }
// ERROR: { success: false, error: "User-friendly message", details?: {...} }
```
**Never expose stack traces or sensitive data in error responses** (see middleware/auth.js:43-50).

## Authentication & Authorization Flow

1. **Login** (`/api/auth/login`) → Returns JWT token
2. **Client Storage**: Token in `localStorage['token']`, user object in `localStorage['user']` (must persist across refreshes)
3. **Protected Routes**: Always chain `protect` middleware first (verifies JWT, attaches `req.user`), then `authorize(roles)` to check roles
4. **Role Hierarchy**: `student` < `instructor` < `admin` < `super_admin` (see middleware/auth.js:54-65)
5. **Account Checks**: `protect` middleware blocks deactivated users (`user.isActive` flag, line 34-39)

## Route Middleware Chain Pattern

Always build protected routes like this:
```javascript
router.post('/admin/route',
  protect,                          // Verify JWT first
  authorize('admin', 'super_admin'), // Then check roles
  validateInput,                     // Then validate body
  async (req, res) => { /* handler */ }
);
```
**Critical**: `protect` must run before `authorize()`. Handlers receive `req.user` with populated user data.

## Component Lazy Loading (React)

Prevent bundle bloat by lazy-loading Dashboard, Admin, Payment, Blog:
```javascript
const Dashboard = React.lazy(() => import('./Dashboard'));
// In JSX:
<Suspense fallback={<div>Loading Dashboard...</div>}>
  <Dashboard />
</Suspense>
```
See App.js:5-10 for implemented examples.

## Frontend Auth Persistence & Navigation

In App.js:
- **On Mount** (lines 49-53): Read `localStorage['user']` and `localStorage['user']` to hydrate state
- **After Login** (lines 182-194): Store token and fetch `/api/auth/me` to get user details, then store user object
- **Role-Based Redirect** (lines 201-205): Redirect admin → `/admin`, others → `/dashboard`
- **Notification**: Use `showNotification(message, type)` utility (lines 13-39) for user feedback

## Payment Gateway Integration Patterns

### PayPal (Server-Side SDK)
- Client calls backend `/api/orders` → Backend uses `@paypal/checkout-server-sdk` to create order
- PayPal SDK initialized with sandbox credentials in server.js:189-193
- Returns order ID to client; client opens PayPal UI, then calls `/api/orders/:orderID/capture`

### Paystack (HTTPS Redirect)
- Initialize via `/api/payment/paystack/initialize` with courseId, email, amount (in kobo, not naira)
- Returns Paystack URL for client redirect; user completes payment on Paystack UI
- Verify reference via webhook or direct API call to update user enrollment

**Amount Conversion**: Both gateways use **smallest currency unit** (cents for USD, kobo for NGN).

## Testing & Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Concurrent frontend (3000) + backend (5000) with live reload |
| `npm run test:all` | Run React + Jest server tests (no watch) |
| `npm run test:server` | Jest only, test environment mongo URI |
| `npm run lint` | ESLint on `/src` directory |
| `docker-compose up` | Full stack: Mongo + backend + frontend/Nginx |
| `npm run build` | React production build → `/build` |

**MongoDB Test Connection**: Uses `mongodb-memory-server` if `MONGO_URI` points to test DB (see test/setup.js:8).

## Key File Map & Responsibilities

| File(s) | Purpose | Critical Details |
|---------|---------|-----------------|
| `server.js:15-36` | Express setup, env validation | Production env check enforces JWT_SECRET ≥32 chars |
| `middleware/auth.js` | JWT verify, role authorize | Line 12-13: Extract token from `Authorization: Bearer` header |
| `models/User.js` | User schema, password hashing | Pre-save hook (line 99-): bcrypt passwords before store |
| `models/Course.js` | Course schema with syllabus/status | Statuses: draft/published/archived; enrollments tracked |
| `routes/auth.js` | Login/register + validation | Uses express-validator; errors array on 400 |
| `routes/payment.js` | PayPal + Paystack init/verify | Amount validation, course existence checks, webhook handling |
| `routes/admin.js` | Admin CRUD, dashboard stats | Requires `protect` + `isAdmin` middleware |
| `routes/course.js` | Course CRUD, enrollment | Public GET; POST/PUT/DELETE require admin role |
| `src/App.js:56-134` | CSS/JS injection for page editor | Fetches custom CSS per route, injects into doc head |
| `middleware/upload.js` | Multer config + file routing | Routes by `fieldname` to subdirectories (branding/, blog/, courses/, avatars/) |

## Common Pitfalls & Conventions

1. **Auth Token Format**: Always `Bearer <token>` in header; middleware splits on space. If missing, return 401.
2. **Password Selection**: Use `.select('+password')` to include password field when querying user for auth.
3. **Environment Defaults**: Dev defaults prevent crashes if envs missing (e.g., `JWT_SECRET || 'dev_jwt_secret'`), but production enforces all.
4. **Pagination Pattern**: Use `skip = (page - 1) * limit`, return total count with results (see routes/admin.js:49-54).
5. **File Upload Cleanup**: Multer saves to `/uploads` with auto-generated names; delete physically when removing DB records.
6. **CORS**: Frontend proxy in package.json points to http://localhost:5000 for dev; production uses `FRONTEND_URL` env var.
7. **Mongoose Validation**: Schema has `.required()`, `.minlength()`, `.maxlength()` validators; errors surface on `await save()`.
8. **Role Checks**: Always verify role in middleware before reaching handler; never trust client role claims.

## Deployment & Docker

**Production Checklist**:
- Set `NODE_ENV=production` in docker-compose (line 34)
- `MONGO_URI` uses authenticated connection: `mongodb://admin:PASSWORD@mongo:27017/addautotraining?authSource=admin`
- `JWT_SECRET` ≥32 characters, stored as secret/env var, never hardcoded
- `FRONTEND_URL` must match browser origin for CORS (no localhost in production)
- Express serves React build from `/build` when `NODE_ENV=production` (server.js:318-324)

**Health Check**: GET `/health` returns uptime, memory usage, timestamp (useful for container orchestration).

## Page Editor & Website Customization

**WebsiteSettings Model** (`models/WebsiteSettings.js`):
- Stores per-page custom CSS (and optionally JavaScript) by page slug
- `super_admin` or `admin` can edit via Website Editor tab
- On route change, App.js fetches CSS for current page slug and injects into `<head>` dynamically

**Avoid**: CSS must not contain XSS vectors; validate regex patterns before storage. JavaScript injection currently unsafe—sanitize or disable in production.

## Quick Navigation
- **Auth Issues**: → `middleware/auth.js:9-52`, `routes/auth.js`
- **Payment Issues**: → `routes/payment.js`, `models/Course.js` (enrollments)
- **Admin Features**: → `routes/admin.js`, `src/Admin.js`
- **Frontend Auth State**: → `src/App.js:48-54` (hydration), `136-214` (login flow)
- **Docker/Deployment**: → `docker-compose.yml`, `server.js:19-36` (env validation)

## Specialized Team Agents

For repo-specific guidance, use these agents in `.github/agents/`:
- **addauto-training**: General repo architecture and full-stack patterns
- **addauto-auth**: JWT, role-based auth, token persistence
- **addauto-payments**: PayPal, Paystack, payment verification
- **addauto-deployment**: Docker, production config, server startup
- **addauto-frontend**: React routing, components, auth state, localStorage
- **addauto-admin**: Admin dashboard, site management, user/course admin

