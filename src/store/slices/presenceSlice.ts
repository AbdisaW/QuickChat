import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

interface PresenceState {
  onlineUsers: string[];
  typingUsers: string[];
}

const initialState: PresenceState = { onlineUsers: [], typingUsers: [] };

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    userOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) state.onlineUsers.push(action.payload);
    },
    userOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    setTyping: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) state.typingUsers.push(action.payload);
    },
    clearTyping: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(id => id !== action.payload);
    },
  },
});

export const { userOnline, userOffline, setTyping, clearTyping } = presenceSlice.actions;
export default presenceSlice.reducer;
