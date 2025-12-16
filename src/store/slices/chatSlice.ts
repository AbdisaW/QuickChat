import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatThread, Message } from '../../types/chat';

export const fetchChatThreads = createAsyncThunk<ChatThread[], void, { rejectValue: string }>(
  'chat/fetchThreads',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('/data/chatThreads.json');
      if (!res.ok) throw new Error('Network error');
      const json = await res.json();
      return json.threads as ChatThread[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Failed to load threads');
    }
  }
);

export const fetchChatMessages = createAsyncThunk<
  { chatId: string; messages: Message[] },
  string,
  { rejectValue: string }
>('chat/fetchMessages', async (chatId, thunkAPI) => {
  try {
    const res = await fetch(`/data/conversations/${chatId}.json`);
    if (!res.ok) {
      const res2 = await fetch('/data/conversations.json');
      if (!res2.ok) throw new Error('Not found');
      const json2 = await res2.json();
      return { chatId, messages: json2[chatId] || [] };
    }
    const data = await res.json();
    return { chatId, messages: data.messages || [] };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || 'Failed to fetch messages');
  }
});

const initialState: ChatState = {
  threads: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  searchQuery: '',
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat(state, action: PayloadAction<string | null>) {
      state.activeChat = action.payload;
      state.error = null;
    },
    addMessage(state, action: PayloadAction<{ chatId: string; message: Message }>) {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) state.messages[chatId] = [];
      state.messages[chatId].push(message);
      const t = state.threads.find((x) => x.id === chatId);
      if (t) {
        t.lastMessage = message.text || '[media]';
        t.lastMessageTime = message.timestamp;
      }
    },
    updateMessageStatus(state, action: PayloadAction<{ chatId: string; messageId: string; status: Message['status'] }>) {
      const { chatId, messageId, status } = action.payload;
      const msgs = state.messages[chatId];
      if (!msgs) return;
      const m = msgs.find((x) => x.id === messageId);
      if (m) m.status = status;
    },
    updateLastMessage(state, action: PayloadAction<{ chatId: string; message: Message }>) {
      const { chatId, message } = action.payload;
      const t = state.threads.find((x) => x.id === chatId);
      if (t) {
        t.lastMessage = message.text || '[media]';
        t.lastMessageTime = message.timestamp;
      }
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearChatState(state) {
      state.threads = [];
      state.activeChat = null;
      state.messages = {};
      state.typingUsers = {};
      state.searchQuery = '';
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload.sort((a, b) => {
          const tA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const tB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return tB - tA;
        });
      })
      .addCase(fetchChatThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to load threads';
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;

        const sortedMessages = action.payload.messages.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        state.messages[action.payload.chatId] = sortedMessages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to load messages';
      });
},
});

export const { setActiveChat, addMessage, updateMessageStatus, updateLastMessage, setSearchQuery, clearChatState } =
  chatSlice.actions;
export default chatSlice.reducer;
