declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_OPENWEATHER_API_KEY: string;
      EXPO_PUBLIC_OPENMETEO_API_URL: string;
      EXPO_PUBLIC_OPENWEATHER_API_URL: string;
    }
  }
}

export const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
export const OPENMETEO_API_URL = process.env.EXPO_PUBLIC_FORECAST_API_URL || '';