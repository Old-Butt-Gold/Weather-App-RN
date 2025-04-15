// src/redux/slices/weatherSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    AirQuality,
    Coordinates,
    Status,
    TemperatureUnit,
    WeatherData,
    WindSpeedUnit
} from "../types/types";
import {fetchWeather} from "../actions/fetchWeather";
import {fetchMoonPhase} from "../actions/fetchMoonPhase";
import {fetchAirQuality} from "../actions/fetchAirQuality";

export interface WeatherState {
    data: WeatherData | null;
    loading: boolean;
    error: string | null;
    status: Status;
    location: Coordinates | null;
    temperatureUnit: TemperatureUnit;
    windSpeedUnit: WindSpeedUnit;
    currentCity: string | null;
    moonPhase: number | null;
    airQuality: AirQuality | null;
}

const initialState: WeatherState = {
    data: null,
    loading: false,
    error: null,
    status: 'idle',
    location: null,
    temperatureUnit: '°C',
    windSpeedUnit: 'km/h',
    currentCity: null,
    moonPhase: null,
    airQuality: null,
};

const weatherSlice = createSlice({
    name: 'weather',
    initialState,
    reducers: {
        setTemperatureUnit(state, action: PayloadAction<TemperatureUnit>) {
            state.temperatureUnit = action.payload;
        },
        setWindSpeedUnit(state, action: PayloadAction<WindSpeedUnit>) {
            state.windSpeedUnit = action.payload;
        },
        setLocation(state, action: PayloadAction<Coordinates>) {
            state.location = action.payload;
        },
        setCurrentCity(state, action: PayloadAction<string | null>) {
            state.currentCity = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Обработка fetchWeather
            .addCase(fetchWeather.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWeather.fulfilled, (state, action: PayloadAction<WeatherData>) => {
                state.status = 'succeeded';
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchWeather.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка запроса';
            })
            // Обработка fetchMoonPhase
            .addCase(fetchMoonPhase.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMoonPhase.fulfilled, (state, action: PayloadAction<number>) => {
                state.status = 'succeeded';
                state.loading = false;
                state.moonPhase = action.payload;
            })
            .addCase(fetchMoonPhase.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка запроса фазы луны';
            })
            .addCase(fetchAirQuality.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAirQuality.fulfilled, (state, action: PayloadAction<AirQuality>) => {
                state.status = 'succeeded';
                state.loading = false;
                state.airQuality = action.payload;
            })
            .addCase(fetchAirQuality.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка запроса качества воздуха';
            });
    },
});

export const { setTemperatureUnit, setWindSpeedUnit, setLocation, setCurrentCity } = weatherSlice.actions;
export const weatherReducer = weatherSlice.reducer;