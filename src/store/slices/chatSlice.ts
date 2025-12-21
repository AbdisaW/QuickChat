import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatThread, Message } from '../../types/chat';
import type { RootState } from '../store';
import type { User } from '../../types/auth';

// Fetch chat threads
export const fetchChatThreads = createAsyncThunk<ChatThread[], void, { state: any; rejectValue: string }>(
  'chat/fetchThreads',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const userId = state.auth.user?.id;
      const users: User[] = state.auth.users || [];
      if (!userId) throw new Error('User not authenticated');

      const res = await fetch(`http://localhost:4002/api/conversations?userId=${userId}`, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      if (!res.ok) throw new Error('Failed to load conversations');

      const data = await res.json();

      return data.conversations.map((c: any) => {
        const otherUserId = c.lastMessage.from === userId ? c.lastMessage.to : c.lastMessage.from;
        const otherUser = users.find(u => u.id === otherUserId);

        return {
          id: c._id,
          participantId: otherUserId,
          participantName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : otherUserId,
          participantAvatar: otherUser?.profilePicture || '',
          lastMessage: c.lastMessage.text,
          lastMessageTime: c.lastMessage.createdAt,
          unreadCount: c.lastMessage.read ? 0 : 1,
        };
      });
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Failed to load threads');
    }
  }
);

// Fetch messages for a conversation
export const fetchChatMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (otherUserId: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const myUserId = state.auth.user!.id;

    const res = await fetch(`http://localhost:4002/api/conversations/${myUserId}/${otherUserId}`, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    if (!res.ok) throw new Error('Failed to load messages');

    const data = await res.json();
    return { chatId: otherUserId, messages: data.conversation };
  }
);

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

      const t = state.threads.find(x => x.id === chatId);
      if (t) {
        t.lastMessage = message.text || '[media]';
        t.lastMessageTime = message.timestamp;
      }
    },
    updateMessageStatus(state, action: PayloadAction<{ chatId: string; messageId: string; status: Message['status'] }>) {
      const { chatId, messageId, status } = action.payload;
      const msgs = state.messages[chatId];
      if (!msgs) return;
      const m = msgs.find(x => x.id === messageId);
      if (m) m.status = status;
    },
    updateLastMessage(state, action: PayloadAction<{ chatId: string; message: Message }>) {
      const { chatId, message } = action.payload;
      const t = state.threads.find(x => x.id === chatId);
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
  extraReducers: builder => {
    builder
      .addCase(fetchChatThreads.pending, state => {
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
      .addCase(fetchChatMessages.pending, state => {
        state.loading = true;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.chatId] = action.payload.messages.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
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
