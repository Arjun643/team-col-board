import { createSlice } from '@reduxjs/toolkit';
import { teamService } from '../../services/teamService';

const initialState = {
  members: [],
  loading: false,
  error: null
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
      state.loading = false;
      state.error = null;
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    removeMember: (state, action) => {
      const { memberId, boardId } = action.payload;
      const memberIndex = state.members.findIndex(m => m.id === memberId);
      
      if (memberIndex !== -1) {
        const member = state.members[memberIndex];
        member.boardIds = member.boardIds.filter(id => id !== boardId);
        
        if (member.boardIds.length === 0) {
          state.members.splice(memberIndex, 1);
        }
      }
    },
    updateMemberStatus: (state, action) => {
      const { memberId, status } = action.payload;
      const member = state.members.find(m => m.id === memberId);
      if (member) {
        member.status = status;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { 
  setMembers, 
  addMember, 
  removeMember, 
  updateMemberStatus,
  setError,
  setLoading 
} = teamSlice.actions;

// Thunks
export const fetchMembers = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const members = await teamService.getMembers();
    dispatch(setMembers(members));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const inviteMember = (email, boardId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const newMember = await teamService.inviteMember(email, boardId);
    dispatch(addMember(newMember));
    return newMember;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const removeMemberFromBoard = (memberId, boardId) => async (dispatch) => {
  try {
    await teamService.removeMember(memberId, boardId);
    dispatch(removeMember({ memberId, boardId }));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export default teamSlice.reducer; 