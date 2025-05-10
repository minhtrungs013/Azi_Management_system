// lib/store/features/authSlice.ts
import { CreatetaskService, getTaskByCurrentSprintService, getTasksByIdService, getTasksByProjectIdService, getTasksOnBacklogService, moveTaskService, updateTaskService } from '@/lib/services/task/taskService';
import { taskPayload, tasksFilterParams } from '@/types/task';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';



export const createtask = createAsyncThunk('createProject', async (payload: taskPayload, { rejectWithValue }) => {
  try {
    const response = await CreatetaskService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});
export const moveTask = createAsyncThunk('moveTask', async (param: { listId: string, taskId: string }, { rejectWithValue }) => {
  try {
    const response = await moveTaskService(param);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});
export const updateTask = createAsyncThunk('updateTask', async (body: { taskId: string, data: object }, { rejectWithValue }) => {
  try {
    const response = await updateTaskService(body);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getTasksByProjectIdSlice = createAsyncThunk('getTasksByProjectIdSlice', async (body: {projectId: string, filterParams: tasksFilterParams}, { rejectWithValue }) => {
  try {
    const response = await getTasksByProjectIdService(body);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});
export const getTaskByCurrentSprintSlice = createAsyncThunk('getTaskByCurrentSprintSlice', async (projectId: string, { rejectWithValue }) => {
  try {
    const response = await getTaskByCurrentSprintService(projectId);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});
export const getTasksOnBacklogSlice = createAsyncThunk('getTasksOnBacklogSlice', async (projectId: string, { rejectWithValue }) => {
  try {
    const response = await getTasksOnBacklogService(projectId);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});
export const getTasksByIdSlice = createAsyncThunk('getTasksByIdSlice', async (taskId: string, { rejectWithValue }) => {
  try {
    const response = await getTasksByIdService(taskId);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});


interface TaskState {
  error: string | null;
  refresh: boolean,
}

const initialState: TaskState = {
  error: null,
  refresh: false,
};


const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setRefresh(state, action) {
      if (state.refresh === false) {
        state.refresh = true;
      } else {
        state.refresh = false;
      }
    },
  },
});
export const { setRefresh } = taskSlice.actions;
export default taskSlice.reducer;
