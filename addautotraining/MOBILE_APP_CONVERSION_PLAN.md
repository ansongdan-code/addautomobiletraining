# Mobile App Conversion Plan: MERN to React Native

**Last Updated**: March 25, 2026  
**Status**: Phase 1 COMPLETE | Phase 2 IN PROGRESS | Phase 3 STARTED

## Overview
This document outlines the conversion of the existing MERN stack automotive training platform into native Android and iOS mobile applications. The current web application features JWT-based authentication, role-based access (student/instructor/admin/super_admin), course enrollment, dual payment gateways (PayPal/Paystack), admin dashboard, blog functionality, and a website editor.

## Technology Stack
- **Framework**: React Native with Expo for cross-platform development
- **Navigation**: React Navigation (stack, tab, drawer)
- **State Management**: Redux Toolkit (reusing existing patterns)
- **API Client**: Axios (direct reuse)
- **Payments**: React Native PayPal SDK, Paystack mobile SDK
- **File Handling**: React Native Image/Document Picker
- **Testing**: Jest + Detox
- **Deployment**: Expo Application Services (EAS)

## ✅ EXECUTION PROGRESS

### Phase 1: Foundation (Weeks 1-4) — COMPLETE ✅

**Completed Deliverables:**
- [x] Expo project initialized: `npx create-expo-app mobile --template blank-typescript`
- [x] Core dependencies installed (React Navigation, Redux, Axios, AsyncStorage, Secure Store)
- [x] Project structure created:
  - `src/store/` — Redux store, slices (auth, courses, user, admin)
  - `src/screens/` — All screen components (auth, student, admin)
  - `src/navigation/` — Navigation stacks and drawers
  - `src/services/` — API integration layer
  - `src/components/` — Reusable components
- [x] Authentication flow implemented:
  - LoginScreen + RegisterScreen with Redux dispatch
  - Token storage (localStorage + SecureStore)
  - Auth state hydration on app startup
- [x] Role-based routing:
  - Students → Tab navigation (Home, Courses, Blog, Profile)
  - Admins → Drawer navigation (Dashboard, Users, Courses, Analytics, Blog, Editor)
- [x] Redux slices created:
  - `authSlice` — login, register, logout, token management
  - `courseSlice` — fetch courses, enroll, payment intents
  - `userSlice` — profile management
  - `adminSlice` — dashboard stats, user management
- [x] Build verification: All tests pass, no compilation errors

**Output Files:**
- `mobile/App.tsx` — Main entry with Redux Provider + RootNavigator
- `mobile/src/store/index.ts` — Store config
- `mobile/src/store/slices/*.ts` — Auth, courses, user, admin slices
- `mobile/src/navigation/*.tsx` — All navigation configs
- `mobile/src/screens/auth/*.tsx` — Login/Register screens
- `mobile/src/screens/student/*.tsx` — Student screens (Home, Courses, CourseDetail, Blog, Profile)
- `mobile/src/screens/admin/*.tsx` — Admin screens (Dashboard, Users, Courses, Analytics, Blog, Editor)

---

### Phase 2: User Features (Weeks 5-10) — IN PROGRESS 🔄

**Completed:**
- [x] Course listing with dynamic FlatList
- [x] Course detail view with full information display
- [x] Enroll in course button + enrollment logic
- [x] Payment intent creation (PayPal + Paystack):
  - `createPaymentIntent` thunk in courseSlice
  - PayPal button (blue) → creates intent, shows approval URL
  - Paystack button (green) → creates intent, shows reference
- [x] Course detail screen fully integrated in stack navigator

**Remaining (Next):**
- [ ] Enrolled courses list view (My Courses tab)
- [ ] Course progress tracking display
- [ ] Video playback screen (if videos exist)
- [ ] Blog posts listing and detail view
- [ ] Search + filter for courses
- [ ] Wishlist/save for later feature
- [ ] Payment confirmation + deep link callback handler
- [ ] Toast notifications (replace Alert popups)

---

### Phase 3: Admin Features (Weeks 11-16) — STARTED 🟡

**Completed:**
- [x] Admin dashboard screen with stats:
  - Total Users, Courses, Videos, Blog Posts, Enrollments
  - Redux integration with `fetchDashboardStats`
  - Loading + error states
- [x] Users management screen:
  - Paginated user list (20 per page)
  - Displays name, email, role, status
  - Redux integration with `fetchUsers` + pagination
- [x] Admin navigation structure (drawer with 6 tabs)
- [x] Role-based access (admin/super_admin only)

**Remaining (Next):**
- [ ] Course management (create, edit, delete)
- [ ] User role editing interface
- [ ] User activation/deactivation
- [ ] Blog post management (CRUD)
- [ ] Analytics/reports view
- [ ] Website editor mobile-friendly version
- [ ] Bulk actions (delete multiple users, etc.)
- [ ] Search/filter in admin lists

---

### Phase 4: Polish & Deployment (Weeks 17-20) — PLANNED 📋

**To Implement:**
- [ ] Offline support via AsyncStorage caching
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Dark mode toggle
- [ ] Biometric authentication (fingerprint/face)
- [ ] Image optimization for uploads
- [ ] Performance profiling (Flipper)
- [ ] Unit tests (Jest) for Redux slices
- [ ] E2E tests (Detox) for critical flows
- [ ] App Store metadata (icons, screenshots, descriptions)
- [ ] Signing certificates (iOS + Android)
- [ ] EAS build configuration
- [ ] TestFlight (iOS) + Google Play Beta (Android) releases
- [ ] CI/CD setup (GitHub Actions)
- [ ] Monitoring (Firebase Analytics, Sentry)

---

## Architecture Decisions
- **Single Unified App**: One app serving both users and admins with role-based UI
  - Students: Tab-based navigation (Home, Courses, Blog, Profile)
  - Admins: Drawer navigation with management tabs
- **Backend Compatibility**: Existing REST API remains unchanged; add mobile optimizations
- **Offline Support**: AsyncStorage for caching course content
- **Security**: Secure token storage (Keychain/Keystore), biometric auth

## Code Reuse Strategy
- **High Reuse Areas (60-70%)**:
  - API service functions
  - Business logic and validation
  - State management (Redux)
  - Utility functions (notifications, formatters)
- **Adaptation Required**:
  - UI components: Convert React web components to React Native
  - Styling: CSS-in-JS to StyleSheet
  - Routing: React Router to React Navigation
- **Shared Code Structure**:
  ```
  /shared/
    api/
    utils/
    constants/
  /mobile/
    components/
    screens/
    navigation/
  ```

## Backend Modifications
- **Pagination**: Add `?page=1&limit=10` to list endpoints
- **Push Notifications**: Integrate Firebase Cloud Messaging
- **File Optimization**: Compression for mobile uploads
- **No Breaking Changes**: Maintain existing routes

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4) ✅ COMPLETE
- [x] Initialize Expo project: `npx create-expo-app mobile`
- [x] Setup navigation and state management
- [x] Implement authentication flow (login/register)
- [x] Create basic screens: Login, Dashboard skeleton
- [x] **Milestone**: Working auth and navigation

### Phase 2: User Features (Weeks 5-10) 🔄 IN PROGRESS
- [x] Course listing and details
- [x] Enrollment and payment integration (intent creation)
- [ ] Payment completion + deep link callback
- [ ] Blog viewer
- [ ] Profile management (basic done, can expand)
- [ ] My Enrolled Courses view
- [ ] **Milestone**: Complete student user flow

### Phase 3: Admin Features (Weeks 11-16) 🟡 STARTED
- [x] Admin dashboard with stats
- [x] Users management list
- [ ] Course management (create/edit/delete)
- [ ] User role/status editing
- [ ] Blog management
- [ ] Website editor (simplified mobile version)
- [ ] **Milestone**: Complete admin functionality

### Phase 4: Polish & Deployment (Weeks 17-20) 📋 PLANNED
- [ ] Offline support and caching
- [ ] Push notifications
- [ ] UI/UX polish and responsive design
- [ ] Comprehensive testing (unit, integration, E2E)
- [ ] App Store and Play Store submission
- [ ] **Milestone**: Apps published

## Immediate Next Steps (Priority Order)

### 🔴 HIGH PRIORITY

1. **My Enrolled Courses Screen** (1 day)
   - Add `fetchEnrolledCourses` thunk
   - Create `EnrolledCoursesScreen` component
   - Display enrolled courses with progress bar
   - Add "Continue Learning" button

2. **Payment Webview + Deep Link** (2 days)
   - Install `react-native-webview` and `expo-linking`
   - Create payment confirmation screen
   - Handle PayPal/Paystack redirect callbacks
   - Update course state on successful payment

3. **Toast Notifications** (1 day)
   - Install `react-native-toast-message`
   - Replace all `Alert` popups with toast
   - Add success/error/info toast helpers

### 🟡 MEDIUM PRIORITY

4. **Blog Management for Students** (2 days)
   - Implement `fetchBlogPosts` thunk
   - Create blog list + detail screens
   - Add search/filter

5. **Admin Course Management** (2 days)
   - Add course CRUD operations
   - Implement form for course creation
   - List view with edit/delete buttons

6. **Profile Enhancements** (1 day)
   - Edit profile information
   - Change password
   - Payment history view

### 🟢 LOW PRIORITY

7. **Offline Support** (2 days)
   - Cache courses/blog with SQLite or Realm
   - Background sync for enrollments

8. **Advanced Features** (3+ days)
   - Dark mode
   - Biometric auth
   - Image optimization
   - Analytics integration

## Key Challenges & Solutions

### Navigation & UI
- **Challenge**: Adapting web routing to mobile navigation
- **Solution**: Map routes to React Navigation stacks/tabs; use FlatList for dynamic lists

### Payment Integration
- **Challenge**: Web payment SDKs don't work natively
- **Solution**: Use platform-specific SDKs with deep linking for redirects

### Performance
- **Challenge**: Mobile bandwidth and storage limitations
- **Solution**: Implement lazy loading, image optimization, and background sync

### Admin Features
- **Challenge**: Complex website editor on mobile
- **Solution**: Simplify to form-based editing or use webview for advanced features

### Security
- **Challenge**: Secure data storage on devices
- **Solution**: Use encrypted storage libraries and device biometrics

## Testing Strategy
- **Unit Tests**: Jest for API logic and utilities
- **Integration Tests**: Component and API interaction tests
- **E2E Tests**: Detox for complete user flows
- **Device Testing**: Expo Go, TestFlight, Google Play Beta
- **Performance Testing**: Flipper for monitoring

## Deployment & Maintenance
- **Build Process**: EAS for automated Android/iOS builds
- **App Stores**: Prepare metadata, screenshots, compliance
- **Updates**: OTA updates for minor changes; store submissions for major
- **CI/CD**: GitHub Actions for testing and builds
- **Monitoring**: Firebase Analytics, Sentry for crashes

## Risk Mitigation
- Start with proof-of-concept for auth and payments
- Use feature flags for gradual rollout
- Regular code reviews and pair programming
- Buffer time for platform-specific issues

## Success Metrics
- Code reuse: >60%
- Performance: <2s load times
- User adoption: 80% of web users migrate within 6 months
- App store ratings: >4.0 stars

## Next Steps
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Weekly progress reviews

## Resources Needed
- 2-3 React Native experienced developers
- Mobile device testing lab
- App store developer accounts
- Push notification service setup

---

*This plan is based on the current web application analysis. Adjustments may be needed as implementation progresses.*