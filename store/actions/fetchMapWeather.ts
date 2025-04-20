import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import * as Location from 'expo-location';
import { WeatherMapData } from '../types/types';

// Async thunk to fetch weather data for the map
export const fetchMapWeather = createAsyncThunk<WeatherMapData, {latitude: number, longitude: number}>(
  'weatherMap/fetchMapWeather',
  async ({ latitude, longitude }, { rejectWithValue }) => {
    try {
      console.log(`Fetching weather data for map: ${latitude}, ${longitude}`);
      
      // Fetch weather data from Open-Meteo API
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude,
          longitude,
          current: 'temperature_2m,wind_speed_10m,relative_humidity_2m,is_day,weather_code,pressure_msl,precipitation,cloudcover',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max',
          timezone: 'auto',
          temperature_unit: 'celsius',
          wind_speed_unit: 'ms'
        }
      });
      
      // Get location name using reverse geocoding
      const locationName = await getLocationName(latitude, longitude);
      
      // Create weather map data object
      const weatherMapData: WeatherMapData = {
        name: locationName,
        latitude,
        longitude,
        current: response.data.current,
        daily: response.data.daily
      };
      
      return weatherMapData;
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to fetch weather data for map' });
    }
  }
);

// Helper function to get location name from coordinates
const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Use reverse geocoding to get location name
    const location = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    if (location && location.length > 0) {
      const { city, district, street, region, country } = location[0];
      
      if (city) return city;
      if (district) return district;
      if (street) return street;
      if (region) return region;
      if (country) return country;
    }
    
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting location name:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};