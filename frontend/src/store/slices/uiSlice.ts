import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    notification: {
        message: string;
        type: 'success' | 'error' | 'info';
        open: boolean;
    };
}

const initialState: UIState = {
    notification: {
        message: '',
        type: 'info',
        open: false,
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
            state.notification = {
                message: action.payload.message,
                type: action.payload.type,
                open: true,
            };
        },
        hideNotification: (state) => {
            state.notification.open = false;
        },
    },
});

export const { showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;
