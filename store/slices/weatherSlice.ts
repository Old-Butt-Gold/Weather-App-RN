// src/redux/slices/weatherSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { fetchWeather } from '../actions/weatherActions'; // Импортируем асинхронный thunk


const weatherSlice = createSlice({
    name: 'weather',
    initialState: {
        data: null,
        loading: false,
        status: "idle" as Status,
        error: null as null | string,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWeather.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWeather.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchWeather.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const weatherReducer = weatherSlice.reducer;

export type Status = "idle" | "loading" | "succeeded" | "failed";