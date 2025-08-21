// src/lib/redux/features/auth/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SafeUser } from '@/types';
import type { RootState } from '../../store'; // Import RootState type

export interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true until the first session check is done
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SafeUser>) => {
      console.log('🎬 [AuthSlice] Action setUser:', action.payload);
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      console.log('🎬 [AuthSlice] Action logout: Réinitialisation de l\'état d\'authentification.');
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
        state.error = action.payload;
        state.isLoading = false;
    }
  },
  selectors: {
    selectCurrentUser: (state) => state.user,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectIsAuthLoading: (state) => state.isLoading,
  }
});

export const { setUser, logout, setAuthLoading, setAuthError } = authSlice.actions;

export const { selectCurrentUser, selectIsAuthenticated, selectIsAuthLoading } = authSlice.selectors;

export default authSlice.reducer;
