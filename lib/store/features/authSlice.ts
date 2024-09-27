// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { login as loginService } from '@/services/auth.services';
// import { LoginPayload } from '@/types/auth.type';
// import * as loadingIndicator from './loadingIndicator-slice';
// import { HTTP_STATUS_CODE_SUCCESS } from '@/constants';
// import { handleError } from './alert-slice';

// type InitialState = {
//   isLoading: boolean;
//   error: boolean;
//   errorMessage: string;
//   credentials: AuthState;
// };

// export type AuthState = {
//   isLogged: boolean;
//   employeeId: number;
//   email: string;
//   role: string;
//   employeeName: string;
//   accessToken: string;
//   refreshToken: string;
// };

// const initialState: InitialState = {
//   isLoading: false,
//   error: false,
//   errorMessage: '',
//   credentials: {
//     isLogged: false,
//     employeeId: 0,
//     email: '',
//     role: '',
//     employeeName: '',
//     accessToken: '',
//     refreshToken: '',
//     clinicId: 0
//   } as AuthState
// };

// export const login = createAsyncThunk('auth/login', async (payload: LoginPayload, { dispatch, rejectWithValue }) => {
//   try {
//     dispatch(loadingIndicator.showLoading());
//     const response = await loginService(payload);

//     if (!HTTP_STATUS_CODE_SUCCESS.includes(response.statusCode)) {
//       throw new Error(response.message);
//     }

//     localStorage.setItem('user_info', JSON.stringify({ isLogged: true, ...response.data }));
//     localStorage.setItem('access_token', response.data.accessToken);
//     dispatch(loadingIndicator.hide());

//     return response;
//   } catch (error) {
//     const err = error as Error;
//     dispatch(loadingIndicator.hide());
//     dispatch(handleError(err));
//     return rejectWithValue(err);
//   }
// });
// // 
// export const auth = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout: () => {
//       return initialState;
//     }
//   },
//   extraReducers: (builder) => {
//     // Start login request
//     builder.addCase(login.pending, (state) => {
//       state.isLoading = true;
//     });
//     // Request successful
//     builder.addCase(login.fulfilled, (state, action) => {
//       state.error = false;
//       state.errorMessage = action.payload.message;
//       state.isLoading = false;
//       state.credentials = {
//         isLogged: true,
//         employeeId: action.payload.data.employeeId,
//         email: action.payload.data.email,
//         role: action.payload.data.role,
//         employeeName: action.payload.data.employeeName,
//         accessToken: action.payload.data.accessToken,
//         refreshToken: action.payload.data.refreshToken
//       };
//     });
//     // Request error
//     builder.addCase(login.rejected, (state, action) => {
//       return {
//         ...initialState,
//         isLogged: false,
//         isLoading: false,
//         error: true,
//         errorMessage: action.error.message ?? 'Something went wrong'
//       };
//     });
//   }
// });

// export const { logout } = auth.actions;
// export const authReducer = auth.reducer;
