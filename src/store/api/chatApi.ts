import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ChatThread, Message } from '../../types/chat';
import type { RootState } from '../store';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getChatThreads: builder.query<{ success: boolean; data: ChatThread[] }, void>({
      query: () => ({ url: 'data/chatThreads.json', method: 'GET' }),
      transformResponse(base: any) {
        return { success: true, data: base.threads || [] };
      },
    }),
    getChatMessages: builder.query<{ success: boolean; data: Message[] }, string>({
      query: (chatId) => ({ url: `data/conversations/${chatId}.json`, method: 'GET' }),
      transformResponse(base: any) {
        return { success: true, data: base.messages || [] };
      },
    }),
    sendMessage: builder.mutation<Message, { chatId: string; payload: Partial<Message> }>({
      query: ({ chatId, payload }) => ({ url: `data/conversations/${chatId}.json`, method: 'POST', body: payload }),
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (chatId) => ({ url: `data/chats/${chatId}/read`, method: 'PUT' }),
    }),
    searchChats: builder.query<{ success: boolean; data: ChatThread[] }, string>({
      query: (q) => ({ url: `data/chatThreads.json?q=${encodeURIComponent(q)}`, method: 'GET' }),
    }),
    getUserContacts: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => ({ url: 'data/contacts.json', method: 'GET' }),
    }),
  }),
});

export const { useGetChatThreadsQuery, useGetChatMessagesQuery, useSendMessageMutation, useMarkAsReadMutation, useSearchChatsQuery, useGetUserContactsQuery } =
  chatApi;
