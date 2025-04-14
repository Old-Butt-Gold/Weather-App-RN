export type Status = "idle" | "loading" | "succeeded" | "failed";

export type WindSpeedUnit = "km/h" | "m/s" | "mph";

export type TemperatureUnit = "°C" | "°F";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface WeatherError {
    message: string;
}

export interface CurrentWeather {
    time: string;
    interval: number;
    wind_speed_10m: number;
    weather_code: number;
    apparent_temperature: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: number; // 0 for night, 1 for day
}

export interface Units {
    temperature: TemperatureUnit;
    wind_speed: WindSpeedUnit;
    relative_humidity: string;
}

export interface HourlyData {
    time: Date[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    weather_code: number[];
    wind_direction_10m: number[];
}

export interface DailyData {
    time: Date[];
    weather_code: number[];
    temperature_2m_mean: number[];
    wind_speed_10m_mean: number[];
    precipitation_probability_mean: number[];
    relative_humidity_2m_mean: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: Date[];
    sunset: Date[];
    uv_index_max: number[];
}

export interface WeatherData {
    latitude: number;
    longitude: number;
    utc_offset_seconds: number;
    current_units: Units;
    current: CurrentWeather;
    hourly_units: Units;
    hourly: HourlyData;
    daily_units: Units;
    daily: DailyData;
}

export interface LocationResult {
    name: string;
    coordinates: Coordinates;
}

export interface LocationSearchResult {
    results: LocationResult[];
}