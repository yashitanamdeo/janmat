import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Complaint {
    id: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    location?: string;
    attachments?: { url: string; type: string }[];
    createdAt: string;
}

interface ComplaintState {
    complaints: Complaint[];
    loading: boolean;
    error: string | null;
}

const initialState: ComplaintState = {
    complaints: [],
    loading: false,
    error: null,
};

const complaintSlice = createSlice({
    name: 'complaints',
    initialState,
    reducers: {
        fetchComplaintsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchComplaintsSuccess: (state, action: PayloadAction<Complaint[]>) => {
            state.loading = false;
            state.complaints = action.payload;
        },
        fetchComplaintsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        addComplaint: (state, action: PayloadAction<Complaint>) => {
            state.complaints.unshift(action.payload);
        },
        updateComplaint: (state, action: PayloadAction<Complaint>) => {
            const index = state.complaints.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.complaints[index] = action.payload;
            }
        },
        removeComplaint: (state, action: PayloadAction<string>) => {
            state.complaints = state.complaints.filter(c => c.id !== action.payload);
        },
    },
});

export const {
    fetchComplaintsStart,
    fetchComplaintsSuccess,
    fetchComplaintsFailure,
    addComplaint,
    updateComplaint,
    removeComplaint
} = complaintSlice.actions;
export default complaintSlice.reducer;
