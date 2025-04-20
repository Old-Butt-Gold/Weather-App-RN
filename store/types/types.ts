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

export interface HourlyUnits {
    time: string;
    temperature_2m: string;
    wind_speed_10m: string;
    weather_code: string;
    wind_direction_10m: string;
}

export interface HourlyData {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    weather_code: number[];
    wind_direction_10m: number[];
    precipitation_probability: number[];
    is_day: number[];
    uv_index: number[];
}

export interface DailyUnits {
    time: string;
    weather_code: string;
    temperature_2m_mean: string;
    wind_speed_10m_mean: string;
    precipitation_probability_mean: string;
    relative_humidity_2m_mean: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    sunrise: string;
    sunset: string;
    uv_index_max: string;
}

export interface DailyData {
    time: string[];
    weather_code: number[];
    temperature_2m_mean: number[];
    wind_speed_10m_mean: number[];
    precipitation_probability_mean: number[];
    relative_humidity_2m_mean: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
}

export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: Record<string, string>;
    current: CurrentWeather;
    hourly_units: HourlyUnits;
    hourly: HourlyData;
    daily_units: DailyUnits;
    daily: DailyData;
}

export interface LocationResult {
    id: number,
    name: string | null;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1: string;
}

export interface AirQuality {
    time: string[],
    us_aqi: number[],
    us_aqi_pm2_5: number[],
    us_aqi_pm10: number[],
    us_aqi_nitrogen_dioxide: number[],
    us_aqi_carbon_monoxide: number[],
    us_aqi_ozone: number[],
    us_aqi_sulphur_dioxide: number[],
}

export interface LocationData extends Coordinates {
    city: string;
}

export interface AppSettingsState {
    language: 'ru' | 'en';
}

export type MapLayerType = 
  | 'temp_new'
  | 'precipitation_new'
  | 'wind_new'
  | 'clouds_new'
  | 'pressure_new'
  | 'none';