// src/lib/redux/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setUser, logout as logoutAction } from '../features/auth/authSlice';
import type { SafeUser, Role } from '@/types/index';
import type { 
    LoginSchema, 
    RegisterSchema,
    ProfileUpdateSchema
} from '@/types/schemas';

// --- Response Types ---

export interface AuthResponse {
  message?: string; // Optional message for some responses
  user: SafeUser;
}

export interface TwoFactorResponse {
    message: string;
    tempToken: string; // A temporary token to be used for the 2FA verification step
}

export type LoginResponse = AuthResponse | TwoFactorResponse;

export interface LogoutResponse {
    message: string;
}

export interface SessionResponse {
  user: SafeUser | null; 
}


// --- Request Types ---

export interface SocialLoginRequest {
  idToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface Verify2FARequest {
    tempToken: string;
    code: string;
}


// --- API Definition ---

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/auth/' }),
  tagTypes: ['Session'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginSchema>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log("▶️ [authApi] onQueryStarted for login mutation.");
        try {
            const { data } = await queryFulfilled;
            console.log("✅ [authApi] Login queryFulfilled. Data:", data);
            if ('user' in data) { // Check if it's AuthResponse
                dispatch(setUser(data.user));
                 // Invalidate the session tag to force a re-fetch of the session state
                dispatch(authApi.util.invalidateTags(['Session']));
            }
        } catch (error) {
            console.error("❌ [authApi] Login queryFulfilled failed.", error);
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterSchema>({
      query: (userInfo) => ({
        url: 'register',
        method: 'POST',
        body: userInfo,
      }),
    }),
    socialLogin: builder.mutation<AuthResponse, SocialLoginRequest>({
        query: ({ idToken }) => ({
            url: 'social-login',
            method: 'POST',
            body: { idToken },
        }),
        async onQueryStarted(args, { dispatch, queryFulfilled }) {
            try {
                const { data } = await queryFulfilled;
                dispatch(setUser(data.user));
            } catch (error) {
                // Handle error
            }
        },
    }),
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
        query: (body) => ({
            url: 'forgot-password',
            method: 'POST',
            body,
        }),
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
        query: (body) => ({
            url: 'reset-password',
            method: 'POST',
            body,
        }),
    }),
    verify2FA: builder.mutation<AuthResponse, Verify2FARequest>({
        query: (body) => ({
            url: 'verify-2fa',
            method: 'POST',
            body,
        }),
        async onQueryStarted(args, { dispatch, queryFulfilled }) {
            try {
                const { data } = await queryFulfilled;
                dispatch(setUser(data.user));
                // Invalidate the session tag to force a re-fetch of the session state
                dispatch(authApi.util.invalidateTags(['Session']));
            } catch (error) {
                // Handle error
            }
        }
    }),
    getSession: builder.query<SessionResponse, void>({
      query: () => 'session',
      providesTags: (result) => (result ? [{ type: 'Session', id: 'CURRENT' }] : []),
       async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log("▶️ [authApi] onQueryStarted for getSession query.");
        try {
          const { data } = await queryFulfilled;
          console.log("✅ [authApi] getSession queryFulfilled. Data:", data);
          if (data?.user) {
            dispatch(setUser(data.user));
          } else {
             // We no longer automatically log out here to prevent race conditions.
             // The UI will simply show a logged-out state if user is null.
             console.log("ℹ️ [authApi] getSession found no active user.");
          }
        } catch (error) {
          console.error("❌ [authApi] getSession queryFulfilled failed.", error);
          // We also don't logout on error to avoid race conditions.
        }
      },
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: 'logout',
        method: 'POST',
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
            await queryFulfilled;
            dispatch(logoutAction());
            // Clear the cache to ensure a clean state on next login
            dispatch(authApi.util.resetApiState());
        } catch {
             // Even if logout fails on the server, force it on the client
             dispatch(logoutAction());
             dispatch(authApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSocialLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerify2FAMutation,
  useGetSessionQuery,
  useLogoutMutation,
} = authApi;
