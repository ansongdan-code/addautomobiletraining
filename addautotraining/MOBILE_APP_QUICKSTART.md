# Mobile App Development - Quick Start Guide

**Last Updated**: March 25, 2026

## Project Location
```
c:\Users\HP\OneDrive\Documents\addautomobiletraining\addautotraining\mobile
```

## Current Status
- ✅ Phase 1: Foundation - COMPLETE
- 🔄 Phase 2: User Features - 60% complete
- 🟡 Phase 3: Admin Features - 40% complete
- ⏳ Phase 4: Polish & Deployment - Not started

## Getting Started

### Install Dependencies
```bash
cd mobile
npm install
```

### Run Development Server
```bash
# Start Expo with QR code for mobile testing
npm start

# Or run specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser testing
```

### Run Tests
```bash
npm test -- --watchAll=false
```

## Project Structure
```
mobile/
├── src/
│   ├── store/              # Redux store & slices
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── courseSlice.ts
│   │       ├── userSlice.ts
│   │       └── adminSlice.ts
│   ├── screens/            # All app screens
│   │   ├── auth/           # Login, Register
│   │   ├── student/        # Home, Courses, Blog, Profile
│   │   └── admin/          # Dashboard, Users, Courses, etc.
│   ├── navigation/         # Navigation configs
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   ├── StudentTabNavigator.tsx
│   │   └── AdminDrawerNavigator.tsx
│   ├── components/         # Reusable components
│   └── services/           # API calls
├── App.tsx                 # Root app with Redux Provider
├── app.json                # Expo config
└── package.json
```

## Key Features Implemented

### Authentication
- ✅ Login screen (email + password)
- ✅ Register screen (name + email + password)
- ✅ Token storage (AsyncStorage + SecureStore)
- ✅ Auto-hydrate on app restart
- ✅ Logout functionality

### Student Features
- ✅ Course listing (FlatList from API)
- ✅ Course detail view
- ✅ Enroll in course button
- ✅ Payment intent creation (PayPal + Paystack)
- ⏳ My enrolled courses view (next)
- ⏳ Course progress tracking (next)
- ⏳ Video playback (next)
- ⏳ Blog posts (next)

### Admin Features
- ✅ Dashboard with stats (users, courses, videos, blog posts, enrollments)
- ✅ Users list with pagination
- ⏳ User role/status editing (next)
- ⏳ Course management (next)
- ⏳ Blog management (next)

## Backend API Integration

All screens are wired to the existing Express backend at `http://localhost:5000/api`:

### Auth Endpoints
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Course Endpoints
- `GET /api/courses` - List all courses
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/payment/create-payment-intent` - Create payment
- `POST /api/payment/confirm` - Confirm payment

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Users list (paginated)
- `GET /api/admin/courses` - Courses list (paginated)

## Redux State Structure

```typescript
{
  auth: {
    user: { _id, name, email, role, enrolledCourses },
    token: "jwt_token",
    isLoading: false,
    error: null
  },
  courses: {
    courses: [...],
    enrolledCourses: [...],
    isLoading: false,
    error: null
  },
  user: {
    profile: {...}
  },
  admin: {
    stats: { totalUsers, totalCourses, totalVideos, ... },
    users: [...],
    pagination: { page, limit, total, pages },
    isLoading: false,
    error: null
  }
}
```

## Common Development Tasks

### Add a New Screen
1. Create file: `src/screens/{category}/{ScreenName}.tsx`
2. Add to appropriate navigator
3. Connect Redux if needed (import useSelector/useDispatch)

### Add a New Redux Slice
1. Create file: `src/store/slices/{featureName}Slice.ts`
2. Define initial state, reducers, thunks
3. Add to store config: `src/store/index.ts`
4. Use in components: `useDispatch`, `useSelector`

### Test a Specific Screen
Run Expo and use QR code:
```bash
npm start
# Scan QR with Expo Go app (iOS/Android)
```

Then navigate to desired screen using app navigation.

## Troubleshooting

### Port 8081 already in use
- Expo auto-switches to 8082
- Or kill process: `lsof -i :8081` (macOS/Linux) or Task Manager (Windows)

### Module not found errors
- Run `npm install` to ensure all dependencies installed
- Check import paths match actual file locations

### Redux state not updating
- Verify async thunk is properly dispatched with `.unwrap()`
- Check reducer cases match action types
- Use Redux DevTools for debugging

### API connection errors
- Ensure backend is running: `npm start` in root
- Verify `API_BASE_URL` in slices matches backend URL
- Check network connectivity if testing on real device

## Environment Variables

Create `.env` file in mobile directory if needed (currently using hardcoded localhost):
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_JWT_EXPIRY=7d
```

## Next Phase Actions

### Immediate (This Week)
- [ ] Add "My Enrolled Courses" screen
- [ ] Implement payment confirmation + deep link
- [ ] Replace Alert popups with toast notifications

### Short Term (Next Week)
- [ ] Blog posts CRUD
- [ ] Course management for admins
- [ ] Profile editing

### Medium Term (Weeks 3-4)
- [ ] Offline support
- [ ] Push notifications
- [ ] Unit tests coverage

### Long Term (Before Release)
- [ ] App Store/Play Store setup
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Security audit

## Resources

- **React Native Docs**: https://reactnative.dev
- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org
- **Redux Toolkit**: https://redux-toolkit.js.org
- **PayPal SDK**: https://developer.paypal.com
- **Paystack SDK**: https://paystack.com/developers

## Contact & Support

For questions or blockers, check:
1. Error logs in Expo terminal
2. Redux state in debugger
3. API responses in network tab
4. Backend logs on server

---

**Happy Coding! 🚀**
