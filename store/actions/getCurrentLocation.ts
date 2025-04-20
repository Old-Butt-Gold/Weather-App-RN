import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { Coordinates } from '../types/types';

// Async thunk to get current device location
export const getCurrentLocation = createAsyncThunk<Coordinates>(
  'weatherMap/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      // Request permission to use geolocation
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return rejectWithValue({ message: 'Location permission not granted' });
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      const coordinates: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      return coordinates;
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to get current location' });
    }
  }
);