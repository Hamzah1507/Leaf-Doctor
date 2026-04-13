import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    history: [],
};

const plantSlice = createSlice({
    name: 'plant',
    initialState,
    reducers: {
        addToHistory: (state, action) => {
            // Add new scan to the beginning of the array
            state.history.unshift(action.payload);
        },
        clearHistory: (state) => {
            state.history = [];
        },
    },
});

export const { addToHistory, clearHistory } = plantSlice.actions;
export default plantSlice.reducer;
