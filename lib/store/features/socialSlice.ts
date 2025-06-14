import { UserUpdate } from '@/types/auth';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface incomingCallState {
    from: string | null;
    signal: RTCSessionDescriptionInit | null;
    socketId: string | null;
    groupId: string | null;
}

interface socialState {
    isAnwer: boolean;
    isShowCall: boolean;
    incomingCall: incomingCallState | null
}

const initialState: socialState = {
    isAnwer: false,
    isShowCall: false,
    incomingCall: {
        from: null,
        signal: null,
        socketId: null,
        groupId: null
    }
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
        answerCall(state) {
            state.isAnwer = true;
        },
        endCall(state) {
            state.isAnwer = false;
            state.isShowCall = false;
        },
        hideAnswer(state) {
            state.isAnwer = false;
        },
        setIncomingCall(state, action: PayloadAction<incomingCallState>) {
            state.incomingCall = action.payload
        }

    },

});
export const { showCall, hideAnswer, hideCall, endCall, answerCall, setIncomingCall } = socialSlice.actions;
export default socialSlice.reducer;
