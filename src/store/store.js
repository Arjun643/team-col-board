import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import boardsReducer from './slices/boardsSlice';
import tasksReducer from './slices/tasksSlice';
import teamReducer from './slices/teamSlice';
import chatReducer from './slices/chatSlice';
import activityReducer from './slices/activitySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    tasks: tasksReducer,
    team: teamReducer,
    chat: chatReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// For debugging
if (process.env.NODE_ENV === 'development') {
  window.store = store;
}

export default store; 