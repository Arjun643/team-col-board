import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: {},  // Organized by boardId
  onlineUsers: {},  // Organized by boardId
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchMessagesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action) => {
      state.isLoading = false;
      state.messages[action.payload.boardId] = action.payload.messages;
    },
    fetchMessagesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addMessage: (state, action) => {
      const { boardId, message } = action.payload;
      if (!state.messages[boardId]) {
        state.messages[boardId] = [];
      }
      state.messages[boardId].push(message);
    },
    updateOnlineUsers: (state, action) => {
      const { boardId, users } = action.payload;
      state.onlineUsers[boardId] = users;
    },
    clearMessages: (state, action) => {
      const { boardId } = action.payload;
      state.messages[boardId] = [];
    },
  },
});

export const {
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  addMessage,
  updateOnlineUsers,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer; 