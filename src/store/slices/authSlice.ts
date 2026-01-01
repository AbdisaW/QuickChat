import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Sets user credentials after login
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Clears all auth state (logout)
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Update user status (ACTIVE, PENDING, etc.)
    updateUserStatus: (state, action: PayloadAction<{ status?: string; isOnline?: boolean }>) => {
      if (state.user) {
        if (action.payload.status !== undefined) state.user.status = action.payload.status;
        if (action.payload.isOnline !== undefined) state.user.isOnline = action.payload.isOnline;
      }
    },

    // Update user profile info (firstName, lastName, email, etc.)
    updateUserProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    }

  },
});

// Export all actions used in your frontend
export const {
  setCredentials,
  logout,
  setLoading,
  setError,
  updateUserStatus,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;
