import axios from 'axios';
import * as Location from 'expo-location';
import {Coordinates, TemperatureUnit, WeatherMapData, WindSpeedUnit} from '../types/types';
import meteoApi from "../../api/meteoApi";
import {createAppAsyncThunk} from "../hooks";

function getQueryWind(windUnit: WindSpeedUnit): string {
    if (windUnit === 'km/h') return "kmh";
    if (windUnit === 'm/s') return "ms";
    return "mph";
}

function getQueryTemperature(tempUnit: TemperatureUnit): string {
    return tempUnit === "°C" ? "celsius" : "fahrenheit";
}

export const fetchMapWeather = createAppAsyncThunk<WeatherMapData>(
    'weatherMap/fetchMapWeather',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {

            const weatherState = getState().weather;
            const location = getState().weatherMap.coordinates;
            if (!location) {
                return rejectWithValue({ message: 'Location not set' });
            }

            const {latitude, longitude} = location;

            console.log(`Fetching weather data for map: ${latitude}, ${longitude}`);

            const currentWindUnit = weatherState.windSpeedUnit;
            const currentTempUnit = weatherState.temperatureUnit;

            const queryTemperatureUnit = getQueryTemperature(currentTempUnit);
            const queryWindUnit = getQueryWind(currentWindUnit);

            const params = {
                latitude,
                longitude,
                current: 'temperature_2m,wind_speed_10m,relative_humidity_2m,is_day,weather_code,pressure_msl,precipitation,cloudcover',
                daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max',
                timezone: 'auto',
                forecast_days: '1',
                wind_speed_unit: queryWindUnit,
                temperature_unit: queryTemperatureUnit,
            };

            const response = await meteoApi.get('', { params });

            const locationName = await getLocationName(latitude, longitude);

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