import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  category: string;
  duration: { weeks: number; hours: number };
  syllabus: any[];
  progress?: number;
}

interface CourseState {
  courses: Course[];
  enrolledCourses: Course[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  enrolledCourses: [],
  isLoading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async () => {
  const response = await axios.get(`${API_BASE_URL}/courses`);
  return response.data;
});

export const fetchEnrolledCourses = createAsyncThunk(
  'courses/fetchEnrolledCourses',
  async (_, { getState }) => {
    const state = getState() as { auth: { user: { _id: string } } };
    const response = await axios.get(`${API_BASE_URL}/courses/enrolled/${state.auth.user?._id}`);
    return response.data;
  }
);

export const createPaymentIntent = createAsyncThunk(
  'courses/createPaymentIntent',
  async (
    payload: { courseId: string; amount: number; gateway: 'paypal' | 'paystack' },
    { getState }
  ) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.post(
      `${API_BASE_URL}/payment/create-payment-intent`,
      { courseId: payload.courseId, amount: payload.amount, gateway: payload.gateway },
      { headers: { Authorization: `Bearer ${state.auth.token}` } }
    );
    return response.data;
  }
);

export const confirmPayment = createAsyncThunk(
  'courses/confirmPayment',
  async (
    payload: { paymentId: string; transactionId: string },
    { getState }
  ) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.post(
      `${API_BASE_URL}/payment/confirm`,
      { paymentId: payload.paymentId, transactionId: payload.transactionId },
      { headers: { Authorization: `Bearer ${state.auth.token}` } }
    );
    return response.data;
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enroll',
  async (courseId: string, { getState }) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.post(
      `${API_BASE_URL}/courses/${courseId}/enroll`,
      {},
      { headers: { Authorization: `Bearer ${state.auth.token}` } }
    );
    return response.data;
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.data;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      })
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrolledCourses = action.payload.data;
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch enrolled courses';
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        // Update enrolled courses if not already there
        const course = action.payload.data;
        if (!state.enrolledCourses.find(c => c._id === course._id)) {
          state.enrolledCourses.push(course);
        }
      })
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally update enrolled courses here if the backend returns the course
        if (action.payload.data && action.payload.data.course) {
          const course = action.payload.data.course;
          if (!state.enrolledCourses.find(c => c._id === course._id)) {
            state.enrolledCourses.push(course);
          }
        }
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Payment confirmation failed';
      });
  },
});


export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;