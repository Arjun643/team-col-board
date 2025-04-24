import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  invitePending: [],
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    removeMember: (state, action) => {
      state.members = state.members.filter(member => member.id !== action.payload);
    },
    addInvite: (state, action) => {
      state.invitePending.push({
        email: action.payload.email,
        inviteId: Date.now(),
        timestamp: new Date().toISOString(),
      });
    },
    removeInvite: (state, action) => {
      state.invitePending = state.invitePending.filter(
        invite => invite.inviteId !== action.payload
      );
    },
    updateMember: (state, action) => {
      const index = state.members.findIndex(member => member.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = { ...state.members[index], ...action.payload };
      }
    },
  },
});

export const { addMember, removeMember, addInvite, removeInvite, updateMember } = membersSlice.actions;
export default membersSlice.reducer; 