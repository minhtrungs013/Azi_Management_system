// lib/store/features/authSlice.ts
import { CreatetaskService } from '@/lib/services/task/taskService';
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

interface TaskState {
  error: string | null;
  refresh: boolean,
}

const initialState: TaskState = {
  error: null,
  refresh: false,
};


const taskSlice = createSlice({
  name: 'project',
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
