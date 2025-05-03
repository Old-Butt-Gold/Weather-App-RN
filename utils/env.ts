import Constants from 'expo-constants';

export const getEnvValue = (key: string, defaultValue: string = ''): string => {
  try {

    const expoExtra = Constants.expoConfig?.extra?.[key];
    const processEnv = process.env[key];
    
    const envValue = expoExtra || processEnv;
    
    if (!envValue) {
      return defaultValue;
    }
    
    return envValue;
  } catch (error) {
    return defaultValue;
  }
};

export const getAzureOpenAIKey = (): string => {
  return getEnvValue('EXPO_PUBLIC_AZURE_OPENAI_KEY');
};

export const getAzureOpenAIEndpoint = (): string => {
  return getEnvValue('EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT');
};

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