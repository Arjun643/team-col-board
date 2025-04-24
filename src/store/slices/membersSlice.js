import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  isLoading: false,
  error: null,
  onlineMembers: [], // Track online members
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    fetchMembersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMembersSuccess: (state, action) => {
      state.isLoading = false;
      state.members = action.payload;
    },
    fetchMembersFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    updateMember: (state, action) => {
      const index = state.members.findIndex(member => member.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = {
          ...state.members[index],
          ...action.payload,
          lastActive: new Date().toISOString(),
        };
      }
    },
    removeMember: (state, action) => {
      state.members = state.members.filter(member => member.id !== action.payload);
    },
    setMemberOnline: (state, action) => {
      if (!state.onlineMembers.includes(action.payload)) {
        state.onlineMembers.push(action.payload);
      }
    },
    setMemberOffline: (state, action) => {
      state.onlineMembers = state.onlineMembers.filter(id => id !== action.payload);
    },
  },
});

export const {
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
  addMember,
  updateMember,
  removeMember,
  setMemberOnline,
  setMemberOffline,
} = membersSlice.actions;

// Thunk action creator for fetching members
export const fetchMembers = () => async (dispatch) => {
  try {
    dispatch(fetchMembersStart());
    // Simulated API call with mock data
    const mockMembers = [
      { 
        id: 1, 
        name: 'Arjun Maurya', 
        email: 'arjun@example.com', 
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Arjun+Maurya',
        lastActive: new Date().toISOString(),
      },
      { 
        id: 2, 
        name: 'Priya Sharma', 
        email: 'priya@example.com', 
        role: 'member',
        avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma',
        lastActive: new Date().toISOString(),
      },
      { 
        id: 3, 
        name: 'Rahul Kumar', 
        email: 'rahul@example.com', 
        role: 'member',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar',
        lastActive: new Date().toISOString(),
      },
      { 
        id: 4, 
        name: 'Neha Gupta', 
        email: 'neha@example.com', 
        role: 'member',
        avatar: 'https://ui-avatars.com/api/?name=Neha+Gupta',
        lastActive: new Date().toISOString(),
      },
      { 
        id: 5, 
        name: 'Amit Patel', 
        email: 'amit@example.com', 
        role: 'member',
        avatar: 'https://ui-avatars.com/api/?name=Amit+Patel',
        lastActive: new Date().toISOString(),
      }
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    dispatch(fetchMembersSuccess(mockMembers));
    
    // Simulate random online/offline status updates
    setInterval(() => {
      mockMembers.forEach(member => {
        if (Math.random() > 0.5) {
          dispatch(setMemberOnline(member.id));
        } else {
          dispatch(setMemberOffline(member.id));
        }
      });
    }, 30000); // Update every 30 seconds
    
  } catch (error) {
    dispatch(fetchMembersFailure(error.message));
  }
};

export default membersSlice.reducer; 