import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import authReducer from './slices/authSlice';
import boardsReducer from './slices/boardsSlice';
import tasksReducer from './slices/tasksSlice';
import chatReducer from './slices/chatSlice';
import activitiesReducer from './slices/activitiesSlice';
import teamReducer from './slices/teamSlice';

// Configure persist for tasks with debug logging
const persistConfig = {
  key: 'root',
  storage,
  debug: true, // Enable debug logging
};

const persistedTasksReducer = persistReducer({
  ...persistConfig,
  key: 'tasks',
  whitelist: ['tasks'], // Only persist the tasks field
}, tasksReducer);

const persistedAuthReducer = persistReducer({
  ...persistConfig,
  key: 'auth',
  whitelist: ['user', 'isAuthenticated']
}, authReducer);

const persistedBoardsReducer = persistReducer({
  ...persistConfig,
  key: 'boards',
  whitelist: ['boards', 'currentBoard']
}, boardsReducer);

const persistedTeamReducer = persistReducer({
  ...persistConfig,
  key: 'team',
  whitelist: ['members']
}, teamReducer);

// Create store with enhanced middleware
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    boards: persistedBoardsReducer,
    tasks: persistedTasksReducer,
    chat: chatReducer,
    activities: activitiesReducer,
    team: persistedTeamReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Create persistor with callback
export const persistor = persistStore(store, null, () => {
  console.log('Rehydration complete'); // Debug log
});