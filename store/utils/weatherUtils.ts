import {WeatherState} from "../slices/weatherSlice";

export const getWeatherCodeForHour = (weatherState: WeatherState, hour: number) => {
    return weatherState.data!.hourly.weather_code[hour];
}

export const getCurrentTemperature = (weatherState: WeatherState) => {
    return weatherState.data!.current.temperature_2m;
}

export const getCurrentTemperatureUnit = (weatherState: WeatherState) => {
    return weatherState.temperatureUnit;
}

export const getCurrentWindUnit = (weatherState: WeatherState) => {
    return weatherState.windSpeedUnit;
}

export const getCurrentTemperatureApparrent = (weatherState: WeatherState) => {
    return weatherState.data!.current.apparent_temperature;
}

export const getCurrentWindSpeed = (weatherState: WeatherState) => {
    return weatherState.data!.current.wind_speed_10m;
}

export const getCurrentRainChance = (weatherState: WeatherState, hour: number) => {
    return weatherState.data!.hourly.precipitation_probability[hour];
}

export const getCurrentHumidity = (weatherState: WeatherState) => {
    return weatherState.data!.current.relative_humidity_2m;
}

export function formatDate(date: Date): string {
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
}

export const getCurrentLocalDateFromWeatherState = (weatherState: WeatherState): Date => {
    const utcNow = new Date();

    const offsetSeconds = weatherState.data!.utc_offset_seconds;

    const localTime = new Date(utcNow.getTime() + offsetSeconds * 1000);

    return localTime;
}