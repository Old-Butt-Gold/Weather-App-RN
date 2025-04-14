// src/redux/slices/weatherSlice.ts

import { createSlice } from '@reduxjs/toolkit';

export type Status = "idle" | "loading" | "succeeded" | "failed";

interface WeatherState {
    data: any;
    loading: boolean;
    error: string | null;
    status: Status
}

const initialState: WeatherState = {
    data: null,
    loading: false,
    error: null,
    status: "idle"
};

const weatherSlice = createSlice({
    name: 'weather',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {

    },
});

export const { } = weatherSlice.actions;

export const weatherReducer = weatherSlice.reducer;