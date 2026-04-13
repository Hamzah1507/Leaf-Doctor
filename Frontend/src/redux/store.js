import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import plantReducer from './slices/plantSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        plant: plantReducer,
    },
});
