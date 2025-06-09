import { UserUpdate } from '@/types/auth';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface socialState {
    isAnwer: boolean;
    isShowCall: boolean;
}

const initialState: socialState = {
    isAnwer: false,
    isShowCall: false,
};


const socialSlice = createSlice({
    name: 'social',
    initialState,
    reducers: {
        showCall(state, action: PayloadAction<UserUpdate>) {
            state.isShowCall = true;
        },
        hideCall(state) {
            state.isShowCall = false;
        },
        answerCall(state, action: PayloadAction<UserUpdate>) {
            state.isAnwer = true;
        },
        endCall(state) {
            state.isAnwer = false;
            state.isShowCall = false;
        },
        hideAnswer(state) {
            state.isShowCall = false;
        },

    },

});
export const { showCall, hideAnswer, hideCall, endCall, answerCall } = socialSlice.actions;
export default socialSlice.reducer;
