// lib/store/features/authSlice.ts
import { createNotificationService, getNotificationsByUserIdService, updateNotificationByUserIdService } from '@/lib/services/notification/notificationService';
import { CreatetaskService, moveTaskService, updateTaskService } from '@/lib/services/task/taskService';
import { notification, notificationCreate } from '@/types/notification';
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

export const createNotification = createAsyncThunk('createNotification', async (payload: notificationCreate, { rejectWithValue }) => {
  try {
    const response = await createNotificationService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});
export const getNotificationsByUserIdSlice = createAsyncThunk('getNotificationsByUserIdSlice', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await getNotificationsByUserIdService(userId);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});
export const updateNotificationByUserIdSlice = createAsyncThunk('updateNotificationByUserIdSlice', async (params: { notificationRecipientId: string, userId: string }, { rejectWithValue }) => {
  try {
    const response = await updateNotificationByUserIdService(params);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

interface NotificationState {
  notification: notification[];
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
      state.notification = [...state.notification, action.payload];
    },
    clearNotification(state, action) {
      state.notification = [];
    },
    refreshNotification(state, action) {
        state.refresh = action.payload;
    },
  },
});
export const { updateNotification, clearNotification, refreshNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
