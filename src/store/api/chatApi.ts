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
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Chats', 'Messages', 'Contacts'],
  endpoints: (builder) => ({
    // -------------------------------
    // GET CHAT THREADS
    // -------------------------------
    getChatThreads: builder.query<ChatThread[], void>({
      query: (_, { getState }) => {
        const userId = (getState() as RootState).auth.user?.id;
        return `/conversations?userId=${userId}`;
      },
      transformResponse: (res: any, _, __, { getState }) => {
        const userId = (getState() as RootState).auth.user?.id;

        return (res.conversations || []).map((c: any) => {
          const lastMessage = c.lastMessage;

          const participantId =
            lastMessage.from === userId
              ? lastMessage.to
              : lastMessage.from;

          return {
            id: c._id,
            participantId,
            participantName: c.participantName ?? 'Unknown',
            participantAvatar: c.participantAvatar ?? '/default-avatar.png',
            lastMessage: lastMessage?.text ?? '',
            lastMessageTime: lastMessage?.createdAt ?? null,
            unreadCount: lastMessage?.read ? 0 : 1,
          };
        });
      },
      providesTags: ['Chats'],
    }),

    // -------------------------------
    // GET CHAT MESSAGES
    // -------------------------------
    getChatMessages: builder.query<Message[], string>({
      query: (otherUserId, { getState }) => {
        const userId = (getState() as RootState).auth.user?.id;
        return `/conversations/${userId}/${otherUserId}`;
      },
      transformResponse: (res: any) => res.conversation ?? [],
      providesTags: ['Messages'],
    }),

    // -------------------------------
    // SEND MESSAGE
    // -------------------------------
    sendMessage: builder.mutation<Message, { to: string; text: string }>({
      query: ({ to, text }) => ({
        url: '/messages',
        method: 'POST',
        body: { to, text },
      }),
      invalidatesTags: ['Chats', 'Messages'],
    }),

    // -------------------------------
    // MARK AS READ
    // -------------------------------
    markAsRead: builder.mutation<
      { success: boolean },
      { otherUserId: string }
    >({
      query: ({ otherUserId }, { getState }) => {
        const userId = (getState() as RootState).auth.user?.id;
        return {
          url: `/conversations/${userId}/${otherUserId}/read`,
          method: 'PUT',
        };
      },
      invalidatesTags: ['Chats'],
    }),

    // -------------------------------
    // GET CONTACTS
    // -------------------------------
    getUserContacts: builder.query<any[], void>({
      query: () => '/users',
      transformResponse: (res: any, _, __, { getState }) => {
        const userId = (getState() as RootState).auth.user?.id;

        // remove self + deduplicate
        const map = new Map();
        (res.users || []).forEach((u: any) => {
          if (u._id !== userId) {
            map.set(u._id, u);
          }
        });

        return Array.from(map.values());
      },
      providesTags: ['Contacts'],
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
