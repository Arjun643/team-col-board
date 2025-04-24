import { createSlice } from '@reduxjs/toolkit';
import { boardsService } from '../../services/boardsService';

const loadInitialState = () => {
  try {
    const persistedBoards = localStorage.getItem('team_boards');
    return {
      boards: persistedBoards ? JSON.parse(persistedBoards) : [],
      currentBoard: null,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('Failed to load persisted boards:', error);
    return {
      boards: [],
      currentBoard: null,
      isLoading: false,
      error: null,
    };
  }
};

const initialState = loadInitialState();

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    fetchBoardsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBoardsSuccess: (state, action) => {
      state.isLoading = false;
      state.boards = action.payload;
      // Persist to localStorage
      localStorage.setItem('team_boards', JSON.stringify(action.payload));
    },
    fetchBoardsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    addBoard: (state, action) => {
      state.boards.push(action.payload);
      // Persist to localStorage
      localStorage.setItem('team_boards', JSON.stringify(state.boards));
    },
    updateBoard: (state, action) => {
      const index = state.boards.findIndex(board => board.id === action.payload.id);
      if (index !== -1) {
        state.boards[index] = action.payload;
        if (state.currentBoard?.id === action.payload.id) {
          state.currentBoard = action.payload;
        }
        // Persist to localStorage
        localStorage.setItem('team_boards', JSON.stringify(state.boards));
      }
    },
    deleteBoard: (state, action) => {
      state.boards = state.boards.filter(board => board.id !== action.payload);
      if (state.currentBoard?.id === action.payload) {
        state.currentBoard = null;
      }
      // Persist to localStorage
      localStorage.setItem('team_boards', JSON.stringify(state.boards));
    },
    createBoardStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createBoardSuccess: (state, action) => {
      state.boards.push(action.payload);
      state.isLoading = false;
      state.error = null;
      // Persist to localStorage
      localStorage.setItem('team_boards', JSON.stringify(state.boards));
    },
    createBoardFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    }
  },
});

export const {
  fetchBoardsStart,
  fetchBoardsSuccess,
  fetchBoardsFailure,
  setCurrentBoard,
  addBoard,
  updateBoard,
  deleteBoard,
  createBoardStart,
  createBoardSuccess,
  createBoardFailure
} = boardsSlice.actions;

// Thunk action creator for fetching boards
export const fetchBoards = () => async (dispatch) => {
  try {
    dispatch(fetchBoardsStart());
    const boards = await boardsService.getBoards();
    dispatch(fetchBoardsSuccess(boards));
  } catch (error) {
    dispatch(fetchBoardsFailure(error.message));
  }
};

export default boardsSlice.reducer; 