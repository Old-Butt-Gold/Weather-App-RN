import {Coordinates, MapLayerType, Status, WeatherMapData} from "../types/types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {fetchCurrentLocation} from "../actions/fetchCurrentLocation";
import {fetchMapWeather} from "../actions/fetchMapWeather";

interface WeatherMapState {
    activeLayer: MapLayerType;
    weatherData: WeatherMapData | null;
    coordinates: Coordinates | null;
    status: Status;
    error: string | null;
    loading: boolean;
}

const initialState: WeatherMapState = {
    activeLayer: MapLayerType.TEMPERATURE,
    weatherData: null,
    coordinates: null,
    status: 'idle',
    error: null,
    loading: false,
};

const weatherMapSlice = createSlice({
    name: 'weatherMap',
    initialState,
    reducers: {
        setActiveLayer: (state, action: PayloadAction<MapLayerType>) => {
            state.activeLayer = action.payload;
        },
        clearWeatherData: (state) => {
            state.weatherData = null;
        },
        setCoordinates: (state, action: PayloadAction<Coordinates>) => {
            state.coordinates = action.payload;
        },
        clearError: (state) => {
            state.error = null;
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMapWeather.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchMapWeather.fulfilled, (state, action : PayloadAction<WeatherMapData>) => {
                state.status = 'succeeded';
                state.weatherData = action.payload;
            })
            .addCase(fetchMapWeather.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = true;
                state.error = action.payload ? (action.payload as { message: string }).message : action.error.message || null;
            })
            .addCase(fetchCurrentLocation.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurrentLocation.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.coordinates = action.payload;
            })
            .addCase(fetchCurrentLocation.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? (action.payload as { message: string }).message : action.error.message || null;
            });
    }
});

export const {setActiveLayer, clearWeatherData, setCoordinates, clearError} = weatherMapSlice.actions;

export const weatherMapReducer = weatherMapSlice.reducer;