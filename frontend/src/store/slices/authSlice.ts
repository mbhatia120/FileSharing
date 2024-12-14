import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, googleLogin as googleLoginApi } from '@/services/api';
import { auth } from '@/utils/auth';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize state with persisted user data
const initialState: AuthState = {
  user: auth.getUser(),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      // Store tokens and user data
      auth.setToken(response.access);
      auth.setRefreshToken(response.refresh);
      auth.setUser(response.user);
      return response.user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error ||
                          'Login failed. Please check your credentials.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await googleLoginApi(code);
      // Store tokens and user data
      auth.setToken(response.access);
      auth.setRefreshToken(response.refresh);
      auth.setUser(response.user);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to login with Google'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      auth.clear();
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
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 