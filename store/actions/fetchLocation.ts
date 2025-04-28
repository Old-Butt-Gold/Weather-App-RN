import {createAppAsyncThunk} from "../hooks";
import {LocationResult, LocationWeatherInfo, TemperatureUnit} from "../types/types";
import geocodingApi from "../../api/geocodingApi";
import {fetchRawWeather} from "../utils/weatherService";

export interface FetchLocationParams {
    query: string; //введенное значение в поле
    language: string; //язык i18next
    temperatureUnit: TemperatureUnit; // температурный Unit
}

export const fetchLocation = createAppAsyncThunk<LocationResult[], FetchLocationParams>(
    'location/fetchLocation',
    async (params, { getState, dispatch, rejectWithValue }) => {
        try {
            const { query, language, temperatureUnit } = params;

            const requestParams = {
                name: query,
                count: 10,
                language: language,
                format: 'json',
            };

            // 1) геокодим
            const geoRes = await geocodingApi.get("", {
                params: requestParams,
            });

            const rawLocations = (geoRes.data.results || []) as LocationResult[];

            // 2) для каждого location параллельно притягиваем погоду
            const enriched: LocationResult[] = await Promise.all(
                rawLocations.map(async loc => {
                    const w = await fetchRawWeather(loc.latitude, loc.longitude, temperatureUnit);

                    const weatherInfo: LocationWeatherInfo = {
                        utc_offset_seconds: w.utc_offset_seconds,
                        temperature_current: w.current.temperature_2m,
                        weather_code: w.current.weather_code,
                        is_day: w.current.is_day === 1,
                        temperature_max: w.daily.temperature_2m_max[0],
                        temperature_min: w.daily.temperature_2m_min[0],
                    };

                    return {
                        ...loc,
                        weatherInfo,
                    };
                })
            );

            return enriched;
        } catch (error: any) {
            return rejectWithValue({ message: error.message });
        }
    }
);

