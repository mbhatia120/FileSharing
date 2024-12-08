import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LoginCredentials, AuthResponse } from '@/types/auth';
import axios from '@/lib/axios';
import { auth } from '@/utils/auth';

// Get initial state from localStorage
const getInitialState = () => {
  return {
    user: auth.getUser(),
    token: auth.getToken(),
    isLoading: false,
    error: null as string | null,
  };
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/login/', credentials);
      const { user, access, refresh } = response.data;
      
      // Store tokens and user data
      auth.setTokens(access, refresh);
      auth.setUser(user);
      
      return { user, token: access };
    } catch (error: any) {
      console.error('Login Error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Login failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/register/', credentials);
      const { user, access, refresh } = response.data;
      
      // Store tokens and user data
      auth.setTokens(access, refresh);
      auth.setUser(user);
      
      return { user, token: access };
    } catch (error: any) {
      console.error('Registration Error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        'Registration failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      auth.clear();
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 