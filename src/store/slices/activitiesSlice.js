import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activities: [],
  loading: false,
  error: null
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action) => {
      state.activities.unshift(action.payload);
    },
    setActivities: (state, action) => {
      state.activities = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearActivities: (state) => {
      state.activities = [];
    }
  }
});

export const {
  addActivity,
  setActivities,
  setLoading,
  setError,
  clearActivities
} = activitiesSlice.actions;

export default activitiesSlice.reducer; 