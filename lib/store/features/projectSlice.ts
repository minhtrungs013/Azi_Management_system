// lib/store/features/authSlice.ts
import { CreateprojectService, deleteProjectIdByUserIdService, getAllMemberProjectService, getAllNonMemberToProjectService, getPermissionService, getProjectByUserIdService, getProjectIdService, inviteMemberToProjectService, updateProjectIdByUserIdService } from '@/lib/services/project/projectService';
import { AddUserPermissionforProject, projectPayload } from '@/types/project';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const getProjectById = createAsyncThunk('getProjectByUserIdService', async (_, { rejectWithValue }) => {
  try {
    const response = await getProjectByUserIdService();
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

export const getProjectId = createAsyncThunk('getProjectId', async (payload: string, { rejectWithValue }) => {
  try {
    const response = await getProjectIdService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

export const createProject = createAsyncThunk('createProject', async (payload: projectPayload, { rejectWithValue }) => {
  try {
    const response = await CreateprojectService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const updateProjectById = createAsyncThunk('updateProjectByUserId', async (params: { url: string; payload: projectPayload }, { rejectWithValue }) => {
  try {
    const response = await updateProjectIdByUserIdService(params);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

export const deleteProjectById = createAsyncThunk('deleteProjectByUserId', async (payload: string, { rejectWithValue }) => {
  try {
    const response = await deleteProjectIdByUserIdService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});
export const inviteMemberToProject = createAsyncThunk('deleteProjectByUserId', async (body: { url: string; payload: AddUserPermissionforProject }, { rejectWithValue }) => {
  try {
    const response = await inviteMemberToProjectService(body);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

export const getPermissions  = createAsyncThunk('getPermissions', async (_, { rejectWithValue }) => {
  try {
    const response = await getPermissionService();
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

export const getAllNonMemberToProject = createAsyncThunk('getAllNonMemberToProject', async (payload: string, { rejectWithValue }) => {
  try {
    const response = await getAllNonMemberToProjectService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});
export const getAllMemberProject = createAsyncThunk('getAllMemberProject', async (payload: string, { rejectWithValue }) => {
  try {
    const response = await getAllMemberProjectService(payload);
    return response;
  } catch (error) {
    return rejectWithValue(' failed');
  }
});

interface ProjectState {
  error: string | null;
  refresh: boolean,
}

const initialState: ProjectState = {
  error: null,
  refresh: false,
};


const projectSlice = createSlice({
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
export const { setRefresh } = projectSlice.actions;
export default projectSlice.reducer;
