import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action) => {
      state.items.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
      // Keep only the last 50 activities
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },
    clearActivities: (state) => {
      state.items = [];
    },
  },
});

export const { addActivity, clearActivities } = activitiesSlice.actions;
export default activitiesSlice.reducer; 