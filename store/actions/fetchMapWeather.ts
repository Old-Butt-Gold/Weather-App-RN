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

export const fetchMapWeather = createAppAsyncThunk<WeatherMapData, Coordinates>(
    'weatherMap/fetchMapWeather',
    async ({ latitude, longitude }, { getState, dispatch, rejectWithValue }) => {
        try {
            console.log(`Fetching weather data for map: ${latitude}, ${longitude}`);
            const weatherState = getState().weather;

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

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                return rejectWithValue({ message: 'Location permission not granted' });
            }

            const locationInfo = await getLocationName(latitude, longitude);

            const weatherMapData: WeatherMapData = {
                temperatureUnit: currentTempUnit,
                windSpeedUnit: currentWindUnit,
                name: locationInfo.city,
                country: locationInfo.country,
                isoCountryCode: locationInfo.isoCountryCode,
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

interface LocationInfo {
    city: string;
    country: string;
    isoCountryCode: string;
}

// Helper function to get location name from coordinates
const getLocationName = async (latitude: number, longitude: number): Promise<LocationInfo> => {
    try {
        // Use reverse geocoding to get location name
        const location = await Location.reverseGeocodeAsync({
            latitude,
            longitude
        });

        if (location && location.length > 0) {
            const { city, district, street, region, country, isoCountryCode } = location[0];

            let locationName: string = "";
            let countryName: string = "";
            let postalCodeName: string = "";

            if (city)
                locationName = city;
            else if (district)
                locationName = district;
            else if (street)
                locationName = street;
            else if (region)
                locationName = region;

            if (country)
                countryName = country;

            if (isoCountryCode)
                postalCodeName = isoCountryCode;

            return {city: locationName, country: countryName, isoCountryCode: postalCodeName};
        }

        return {city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, country: "", isoCountryCode: ""};
    } catch (error) {
        return {city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, country: "", isoCountryCode: ""};
    }
};