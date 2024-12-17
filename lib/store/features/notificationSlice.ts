// lib/store/features/authSlice.ts
import { CreatetaskService, moveTaskService, updateTaskService } from '@/lib/services/task/taskService';
import { taskPayload } from '@/types/task';
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

interface NotificationState {
  notification: string[];
  refresh: boolean,
}

const initialState: NotificationState = {
  notification: [],
  refresh: false,
};


const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    updateNotification(state, action) {
        state.notification =  [...state.notification, action.payload];
    },
    clearNotification(state, action) {
        state.notification =  [];
    },
  },
});
export const { updateNotification , clearNotification} = notificationSlice.actions;
export default notificationSlice.reducer;
