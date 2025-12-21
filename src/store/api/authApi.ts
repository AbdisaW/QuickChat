import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginResponse, User } from '../../types/auth';
import type { RootState } from '../store';

export interface LoginResponseItem {
  success: 200;
  message: string;
  user: User;
  token: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseItem, { email: string; password: string }>({
      query: (body) => ({
        url: 'http://localhost:4000/api/auth/login',
        method: 'POST',
        body,
      }),
    }),

    register: builder.mutation<
      { success: boolean; message: string },
      { firstName: string; lastName: string; email: string; password: string }
    >({
      query: (body) => ({
        url: 'http://localhost:4000/api/auth/register',
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation<
      { message: string },
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: 'http://localhost:4000/api/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),

    resendOtp: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: (body) => ({
        url: 'http://localhost:4000/api/auth/re-send',
        method: 'POST',
        body,
      }),
    }),

    getCurrentUser: builder.query<LoginResponse, void>({
      query: () => ({
        url: 'data/auth.json',
        method: 'GET',
      }),
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: 'http://localhost:4000/api/auth/logout',
        method: 'POST',
      }),
    }),

    uploadProfilePicture: builder.mutation<{ message: string; publicFileUrl: string }, FormData>({
      query: (formData) => ({
        url: 'http://localhost:4000/api/profile/profile-picture',
        method: 'POST',
        body: formData,
      }),
    }),

    updateProfile: builder.mutation<LoginResponse, Partial<User>>({
      query: (body) => ({
        url: 'http://localhost:4000/api/auth/user',
        method: 'PUT',
        body,
      }),
    }),

    getUsers: builder.query<any[], void>({
      query: () => ({
        url: "http://localhost:4000/api/auth/users",
        method: "GET",
      }),
      transformResponse: (res: any) => res.users,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useUploadProfilePictureMutation,
  useUpdateProfileMutation,
 useGetUsersQuery,
} = authApi;
