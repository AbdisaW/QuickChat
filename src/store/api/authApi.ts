import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginResponse, User } from '../../types/auth';
import type { RootState } from '../store';

export interface LoginResponseItem {
  success: 200;
 "message": "Login successful",
 "user": User
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
 
    login: builder.mutation<
      LoginResponseItem, 
      { email: string; password: string }
    >({
      query: (body) => ({
        url: 'http://localhost:3000/api/auth/login',
        method: 'POST',
        body
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
        url: 'data/logout.json',
        method: 'POST',
      }),
    }),

    updateProfile: builder.mutation<LoginResponse, Partial<User>>({
      query: () => ({
        url: 'data/auth.json',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
