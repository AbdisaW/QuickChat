// src/store/api/chatApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ChatThread, Message } from '../../types/chat';
import type { RootState } from '../store';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4002/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getChatThreads: builder.query<ChatThread[], void>({
      query: () => `/conversations?userId=${localStorage.getItem('userId')}`,
      transformResponse: (res: any) =>
        res.conversations.map((c: any) => {
          const lastMessage = c.lastMessage;
          return {
            id: c._id,
            participantId: lastMessage.from === localStorage.getItem('userId') ? lastMessage.to : lastMessage.from,
            participantName: c.participantName || 'Unknown',
            participantAvatar: c.participantAvatar || '/default-avatar.png',
            lastMessage: lastMessage.text,
            lastMessageTime: lastMessage.createdAt,
            unreadCount: lastMessage.read ? 0 : 1,
          };
        }),
    }),
    getChatMessages: builder.query<Message[], string>({
      query: (otherUserId) => `/conversations/${localStorage.getItem('userId')}/${otherUserId}`,
      transformResponse: (res: any) => res.conversation || [],
    }),
    sendMessage: builder.mutation<Message, { to: string; text: string }>({
      query: ({ to, text }) => ({ url: '/messages', method: 'POST', body: { to, text } }),
    }),
    markAsRead: builder.mutation<{ success: boolean }, { user1: string; user2: string }>({
      query: ({ user1, user2 }) => ({ url: `/conversations/${user1}/${user2}/read`, method: 'PUT' }),
    }),
    getUserContacts: builder.query<ChatThread[], void>({
      query: () => '/users',
      transformResponse: (res: any) => res.users || [],
    }),
  }),
});

export const {
  useGetChatThreadsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useGetUserContactsQuery,
} = chatApi;
