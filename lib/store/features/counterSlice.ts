// lib/store/features/authSlice.ts
import { loginService } from '@/lib/services/auth/loginService';
import { LoginPayload } from '@/types/auth';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export const login = createAsyncThunk('auth/login', async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    const response = await loginService(payload);
    localStorage.setItem('access_token', response.data.accessToken);
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error);
  }
});

// Logout action using createAsyncThunk (no API call, just clearing localStorage)
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // Perform logout logic (like clearing local storage)
    localStorage.removeItem('user_info');
    localStorage.removeItem('access_token');
    return true; // Return a success value
  } catch (error) {
    return rejectWithValue('Logout failed');
  }
});

interface AuthState {
  isLogged: boolean;
  userId: string | null;
  username: string | null;
  accessToken: string | null;
  error: string | null;
}

const initialState: AuthState = {
  isLogged: false,
  userId: null,
  username: null,
  accessToken: null,
  error: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLogged = true;
        state.username = action.payload.user.username;
        state.userId = action.payload.user._id;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.isLogged = false;
        state.error = action.payload?.message;
      });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLogged = false;
      state.username = null;
      state.userId = null;
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem('access_token');
    }).addCase(logout.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export default authSlice.reducer;
