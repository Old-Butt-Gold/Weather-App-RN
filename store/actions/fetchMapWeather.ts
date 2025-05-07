import * as Location from 'expo-location';
import {Coordinates, TemperatureUnit, WeatherMapData, WindSpeedUnit} from '../types/types';
import meteoApi from "../../api/meteoApi";
import {createAppAsyncThunk} from "../hooks";
import yandexGeocoding from "../../api/yandexGeocoding";

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
            const language = getState().appSettings.language;

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

            const locationInfo = await getLocationName(latitude, longitude, language);

            const weatherMapData: WeatherMapData = {
                temperatureUnit: currentTempUnit,
                windSpeedUnit: currentWindUnit,
                admin1: "",
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

interface Components {
    kind: string,
    name: string,
}

const getLocationName = async (latitude: number, longitude: number, lang: string): Promise<LocationInfo> => {
    try {
        const params = {
            geocode: `${longitude},${latitude}`,
            lang: `${lang}_RU`,
            apikey: process.env.EXPO_PUBLIC_YANDEX_API_KEY,
            format: "json",
            results: "1"
        };

        const response = await yandexGeocoding.get('', { params });

        const data = response.data;

        if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
            const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;

            const countryCode = geoObject.metaDataProperty.GeocoderMetaData.AddressDetails?.Country?.CountryNameCode || '';
            const country = geoObject.metaDataProperty.GeocoderMetaData.AddressDetails?.Country?.CountryName || '';

            const formattedAddress = geoObject.metaDataProperty.GeocoderMetaData.Address?.formatted || '';
            const addressWithoutCountry = formattedAddress
                .split(', ')
                .slice(1)
                .join(', ');

            const components = geoObject.metaDataProperty.GeocoderMetaData.Address?.Components as Components[] || [];
            const cityPart = components.find(c => c.kind === 'locality')?.name || '';
            const streetPart = components.find(c => c.kind === 'street')?.name || '';
            const streetHouse = components.find(c => c.kind === 'house')?.name || '';
            const combinedAddress = [cityPart, streetPart, streetHouse].filter(Boolean).join(', ');

            return {
                city: addressWithoutCountry || combinedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                country: country,
                isoCountryCode: countryCode
            };
        }

        return {
            city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            country: '',
            isoCountryCode: ''
        };
    } catch (error) {
        return {
            city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            country: '',
            isoCountryCode: ''
        };
    }
};