import meteoApi from "../../api/meteoApi";
import {TemperatureUnit} from "../types/types";

export interface RawWeatherResponse {
    utc_offset_seconds: number;
    current: {
        temperature_2m: number;
        weather_code: number;
        is_day: number;
    };
    daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
    };
}

function getQueryTemperature(tempUnit: TemperatureUnit): string {
    return tempUnit === "°C" ? "celsius" : "fahrenheit";
}

export async function fetchRawWeather(
    latitude: number,
    longitude: number,
    tempUnit: TemperatureUnit
): Promise<RawWeatherResponse> {
    const queryTemperatureUnit = getQueryTemperature(tempUnit);
    const params = {
        latitude,
        longitude,
        daily: "temperature_2m_max,temperature_2m_min",
        current: "temperature_2m,is_day,weather_code",
        timezone: 'auto',
        forecast_days: 1,
        temperature_unit: queryTemperatureUnit
    };
    const { data } = await meteoApi.get<RawWeatherResponse>("", { params });
    return data;
}