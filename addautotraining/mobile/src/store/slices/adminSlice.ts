import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../index';
import { API_BASE_URL } from '../../config';

const ADMIN_API_URL = `${API_BASE_URL}/admin`;

export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async (_, { getState }) => {
  const state = getState() as RootState;
  const response = await axios.get(`${ADMIN_API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${state.auth.token}` },
  });
  return response.data;
});

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string }, { getState }) => {
    const state = getState() as RootState;
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    const response = await axios.get(`${ADMIN_API_URL}/users?${query.toString()}`, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return response.data;
  }
);


interface AdminState {
  stats: any;
  users: any[];
  pagination: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  users: [],
  pagination: null,
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data.stats;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load dashboard stats';
      })
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data.users;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load users';
      });
  },
});

export default adminSlice.reducer;
