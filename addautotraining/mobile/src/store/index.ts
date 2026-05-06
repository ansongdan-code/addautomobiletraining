import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import courseSlice from './slices/courseSlice';
import userSlice from './slices/userSlice';
import adminSlice from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: courseSlice,
    user: userSlice,
    admin: adminSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;