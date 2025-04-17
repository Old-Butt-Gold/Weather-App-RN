import Constants from 'expo-constants';

export const getEnvValue = (key: string, defaultValue: string = ''): string => {
  try {
    console.log(`[ENV UTILS] Attempting to get env variable: ${key}`);
    
    const expoExtra = Constants.expoConfig?.extra?.[key];
    const processEnv = process.env[key];
    
    console.log(`[ENV UTILS] Found in Constants.expoConfig.extra: ${!!expoExtra}`);
    console.log(`[ENV UTILS] Found in process.env: ${!!processEnv}`);
    
    const envValue = expoExtra || processEnv;
    
    if (!envValue) {
      console.warn(`[ENV UTILS] Environment variable ${key} not found, using default`);
      return defaultValue;
    }
    
    console.log(`[ENV UTILS] Successfully retrieved ${key} (length: ${envValue.length})`);
    return envValue;
  } catch (error) {
    console.error(`[ENV UTILS] Error getting env var ${key}:`, error);
    return defaultValue;
  }
};

export const getAzureOpenAIKey = (): string => {
  const key = getEnvValue('EXPO_PUBLIC_AZURE_OPENAI_KEY');
  

  if (key) {
    const maskedKey = key.substring(0, 4) + '***' + (key.length - 4) + ' chars';
    console.log(`[ENV UTILS] Azure OpenAI Key: ${maskedKey}`);
  } else {
    console.error('[ENV UTILS] Azure OpenAI Key is missing!');
  }
  
  return key;
};

export const getAzureOpenAIEndpoint = (): string => {
  const endpoint = getEnvValue('EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT');
  
  if (endpoint) {
    console.log(`[ENV UTILS] Azure OpenAI Endpoint: ${endpoint}`);
  } else {
    console.error('[ENV UTILS] Azure OpenAI Endpoint is missing!');
  }
  
  return endpoint;
};