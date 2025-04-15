// Асинхронный thunk для получения данных погоды по координатам
import {createAppAsyncThunk} from "../hooks";
import {WeatherData} from "../types/types";
import meteoApi from "../../api/meteoApi";

export const fetchWeather = createAppAsyncThunk<WeatherData>(
    'weather/fetchWeather',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const location = getState().weather.location;
            if (!location) {
                return rejectWithValue({ message: 'Location not set' });
            }

            const params = {
                latitude: location.latitude,
                longitude: location.longitude,
                daily:
                    'weather_code,temperature_2m_mean,wind_speed_10m_mean,precipitation_probability_mean,relative_humidity_2m_mean,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
                hourly: 'temperature_2m,wind_speed_10m,weather_code,wind_direction_10m,precipitation_probability,is_day',
                current:
                    'wind_speed_10m,weather_code,apparent_temperature,temperature_2m,relative_humidity_2m,is_day',
                timezone: 'auto',
                forecast_hours: '24',
                past_days: '1'
            };
            const response = await meteoApi.get('', { params });
            return response.data as WeatherData;
        } catch (error: any) {
            return rejectWithValue({ message: error.message });
        }
    }
);
