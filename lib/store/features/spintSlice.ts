// lib/store/features/authSlice.ts
import { completeSprintByIdService, createSprintService, getAllSprintByProjectIdService, updateSprintByIdService } from '@/lib/services/sprint/sprintService';
import { sprint, sprintPayload } from '@/types/sprint';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';



export const createSprintSlice = createAsyncThunk('createSprintSlice', async (payload: sprintPayload, { rejectWithValue }) => {
  try {
    const response = await createSprintService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getAllSprintByProjectIdSlice = createAsyncThunk('getAllSprintByProjectIdSlice', async (projectId: string, { rejectWithValue }) => {
  try {
    const response = await getAllSprintByProjectIdService(projectId);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

export const updateSprintByIdSlice = createAsyncThunk('updateSprintByIdSlice', async (sprint: sprint, { rejectWithValue }) => {
  try {
    const response = await updateSprintByIdService(sprint);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

export const completeSprintByIdSlice = createAsyncThunk('completeSprintByIdSlice', async (sprintId: string, { rejectWithValue }) => {
  try {
    const response = await completeSprintByIdService(sprintId);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

interface sprintState {
  error: string | null;
  refresh: boolean,
}

const initialState: sprintState = {
  error: null,
  refresh: false,
};


const sprintState = createSlice({
  name: 'Sprints',
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
export const { setRefresh } = sprintState.actions;
export default sprintState.reducer;
