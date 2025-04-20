import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MapLayerType, Status, WeatherMapData } from '../types/types';
import { fetchMapWeather } from '../actions/fetchMapWeather';
import { getCurrentLocation } from '../actions/getCurrentLocation';

// Weather map state interface
interface WeatherMapState {
  activeLayer: MapLayerType;
  weatherData: WeatherMapData | null;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  status: Status;
  error: string | null;
}

// Initial state
const initialState: WeatherMapState = {
  activeLayer: MapLayerType.TEMPERATURE,
  weatherData: null,
  coordinates: null,
  status: 'idle',
  error: null
};

// Create slice
const weatherMapSlice = createSlice({
  name: 'weatherMap',
  initialState,
  reducers: {
    // Change active map layer
    setActiveLayer: (state, action: PayloadAction<MapLayerType>) => {
      state.activeLayer = action.payload;
    },
    // Clear weather data
    clearWeatherData: (state) => {
      state.weatherData = null;
    },
    // Set coordinates manually
    setCoordinates: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.coordinates = action.payload;
    },
    // Reset error state
    clearError: (state) => {
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Handle fetchMapWeather
    builder
      .addCase(fetchMapWeather.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMapWeather.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.weatherData = action.payload;
        state.coordinates = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude
        };
      })
      .addCase(fetchMapWeather.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { message: string }).message : action.error.message || null;
      })
      
      // Handle getCurrentLocation
      .addCase(getCurrentLocation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coordinates = action.payload;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ? (action.payload as { message: string }).message : action.error.message || null;
      });
  }
});

// Export actions
export const { 
  setActiveLayer, 
  clearWeatherData, 
  setCoordinates,
  clearError
} = weatherMapSlice.actions;

// Export reducer
export default weatherMapSlice.reducer;