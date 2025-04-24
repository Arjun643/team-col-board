import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activities: {}, // Organized by boardId
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    addActivity: (state, action) => {
      const { boardId } = action.payload;
      console.log('Adding activity:', action.payload);
      
      if (!state.activities) {
        state.activities = {};
      }
      if (!state.activities[boardId]) {
        state.activities[boardId] = [];
      }
      
      // Add the activity to the beginning of the array
      state.activities[boardId].unshift(action.payload);
      console.log('Updated activities:', state.activities[boardId]);
      
      // Keep only the last 50 activities
      if (state.activities[boardId].length > 50) {
        state.activities[boardId] = state.activities[boardId].slice(0, 50);
      }
    },
    clearActivities: (state, action) => {
      const { boardId } = action.payload;
      if (!state.activities) {
        state.activities = {};
      }
      state.activities[boardId] = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { addActivity, clearActivities, setLoading, setError } = activitySlice.actions;

export default activitySlice.reducer; 