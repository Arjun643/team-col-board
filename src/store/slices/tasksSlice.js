import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksService } from '../../services/tasksService';

const initialState = {
  tasks: {},  // Organized by boardId
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      const { boardId, tasks } = action.payload;
      state.tasks[boardId] = tasks;
      state.loading = false;
      state.error = null;
    },
    addTask: (state, action) => {
      const { boardId, task } = action.payload;
      if (!state.tasks[boardId]) {
        state.tasks[boardId] = [];
      }
      state.tasks[boardId].push(task);
    },
    updateTask: (state, action) => {
      const { boardId, taskId, taskData } = action.payload;
      if (state.tasks[boardId]) {
        state.tasks[boardId] = state.tasks[boardId].map(task => 
          task.id === taskId ? { ...task, ...taskData } : task
        );
      }
    },
    deleteTask: (state, action) => {
      const { boardId, taskId } = action.payload;
      if (state.tasks[boardId]) {
        state.tasks[boardId] = state.tasks[boardId].filter(task => task.id !== taskId);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    moveTask: (state, action) => {
      const { boardId, taskId, newStatus } = action.payload;
      if (state.tasks[boardId]) {
        const taskIndex = state.tasks[boardId].findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[boardId][taskIndex].status = newStatus;
        }
      }
    },
    assignTask: (state, action) => {
      const { boardId, taskId, assignee } = action.payload;
      if (!boardId || !taskId) return;

      const taskList = state.tasks[boardId];
      if (taskList) {
        const taskIndex = taskList.findIndex(task => String(task.id) === String(taskId));
        if (taskIndex !== -1) {
          taskList[taskIndex] = {
            ...taskList[taskIndex],
            assignee,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    },
    unassignTask: (state, action) => {
      const { boardId, taskId } = action.payload;
      if (!boardId || !taskId) return;

      const taskList = state.tasks[boardId];
      if (taskList) {
        const taskIndex = taskList.findIndex(task => String(task.id) === String(taskId));
        if (taskIndex !== -1) {
          taskList[taskIndex] = {
            ...taskList[taskIndex],
            assignee: null,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    },
    clearTasks: (state) => {
      state.tasks = {};
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTaskAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setTasks, addTask, updateTask, deleteTask, setLoading, setError, moveTask, assignTask, unassignTask, clearTasks } = tasksSlice.actions;

export const fetchTasks = (boardId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const tasks = await tasksService.getTasks(boardId);
    dispatch(setTasks({ boardId, tasks }));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { dispatch, rejectWithValue }) => {
    try {
      if (!taskData.boardId) {
        throw new Error('Board ID is required');
      }
      console.log('Creating task with data:', taskData);
      const response = await tasksService.createTask(taskData.boardId, taskData);
      console.log('Task created response:', response);
      
      // Dispatch the addTask action to update the state
      dispatch(addTask({ 
        boardId: taskData.boardId, 
        task: response 
      }));
      
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      return rejectWithValue(error.message || 'Failed to create task');
    }
  }
);

export const updateTaskAsync = (taskData) => async (dispatch) => {
  try {
    const { boardId, id: taskId } = taskData;
    const updatedTask = await tasksService.updateTask(boardId, taskId, taskData);
    dispatch(updateTask({ boardId, taskId, taskData: updatedTask }));
    return updatedTask;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

export const moveTaskAsync = (boardId, taskId, newStatus) => async (dispatch) => {
  try {
    await tasksService.updateTask(boardId, taskId, { status: newStatus });
    dispatch(moveTask({ boardId, taskId, newStatus }));
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

export const deleteTaskAsync = ({ boardId, taskId }) => async (dispatch) => {
  try {
    await tasksService.deleteTask(boardId, taskId);
    dispatch(deleteTask({ boardId, taskId }));
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

export default tasksSlice.reducer;