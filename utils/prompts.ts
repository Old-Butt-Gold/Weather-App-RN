// This file contains system prompts for the ChatGPT model
import { WeatherData, LocationResult } from '../store/types/types';

// Helper function to get weather condition text from code
export const getWeatherConditionText = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
};

// Base system prompt that defines the assistant's personality and constraints
export const BASE_SYSTEM_PROMPT = `You are a friendly weather assistant in a mobile app.
You provide helpful, concise, and friendly responses to weather-related questions.
Keep your answers relatively short (2-3 paragraphs maximum) and conversational.
Be enthusiastic but not overly verbose.
You can be creative and personable.
If asked about specific weather conditions, you'll respond based on the current conditions shown in the app.`;

// Generate context string about current weather conditions and location
export const generateWeatherContext = (
  weatherData: WeatherData | null,
  locationData: LocationResult | null
): string => {
  if (!weatherData) {
    return "Current weather data is not available.";
  }
  
  try {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;
    
    const currentCondition = getWeatherConditionText(current.weather_code);
    const isDay = current.is_day === 1;
    const timeOfDay = isDay ? "day" : "night";
    
    // Today's min/max
    const todayMaxTemp = daily.temperature_2m_max[0];
    const todayMinTemp = daily.temperature_2m_min[0];
    
    // Precipitation probability for the day
    const precipProbability = daily.precipitation_probability_mean[0];
    
    // Wind speed
    const windSpeed = current.wind_speed_10m;
    const windSpeedUnit = weatherData.current_units?.wind_speed_10m || "km/h";
    
    // Humidity
    const humidity = current.relative_humidity_2m;
    
    // Location information
    let locationInfo = "";
    if (locationData) {
      const cityName = locationData.name || "Unknown location";
      const country = locationData.country || "";
      locationInfo = `Location: ${cityName}, ${country}\n`;
    }
    
    return `${locationInfo}Current weather: ${currentCondition}, ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)
Time of day: ${timeOfDay}
Today's temperature range: ${todayMinTemp}°C to ${todayMaxTemp}°C
Precipitation probability: ${precipProbability}%
Wind speed: ${windSpeed} ${windSpeedUnit}
Humidity: ${humidity}%
Timezone: ${weatherData.timezone}`;
  } catch (error) {
    console.error("Error generating weather context:", error);
    return "Error processing weather data.";
  }
};

// Specific prompt templates for different question types
export const WHAT_TO_WEAR_PROMPT = `${BASE_SYSTEM_PROMPT}
When suggesting clothing options, consider the following weather conditions:

WEATHER_CONTEXT

Based on the location and current weather, suggest specific outfit components (like layers, accessories, footwear) appropriate for these weather conditions.
Consider both practicality and comfort for the current conditions, as well as any local customs or typical dress in this region if relevant.`;

export const SUGGEST_MUSIC_PROMPT = `${BASE_SYSTEM_PROMPT}
When suggesting music for the current weather:

WEATHER_CONTEXT

Suggest 2-3 music genres and a few specific artists or songs that would complement the current weather conditions and location.
Consider both the weather mood and local musical culture if relevant.
Be creative with your suggestions and explain briefly why they match the weather mood.`;

export const INTERESTING_FACT_PROMPT = `${BASE_SYSTEM_PROMPT}
Share an interesting and educational weather fact.

Current conditions:
WEATHER_CONTEXT

You can relate it to the current weather conditions, the current location/region, or share a general fascinating weather phenomenon.
If the location has any interesting weather patterns or history, feel free to mention that.
Make it engaging and informative, something that would surprise most people.`;

export const OUTDOOR_ACTIVITIES_PROMPT = `${BASE_SYSTEM_PROMPT}
Suggest outdoor activities appropriate for:

WEATHER_CONTEXT

Recommend 3-4 activities that would be enjoyable and practical in these conditions and location.
If there are popular or traditional activities in this region, prioritize those that fit the current weather.
Include a brief explanation of why each activity would be good for this weather.`;

// Function to generate the appropriate prompt based on question type
export const getPromptForQuestion = (
  questionType: string,
  weatherData: WeatherData | null = null,
  locationData: LocationResult | null = null
): string => {
  // Generate weather context with location
  const weatherContext = generateWeatherContext(weatherData, locationData);
  
  // Replace placeholder with actual weather context
  const replacePlaceholders = (prompt: string) => {
    return prompt.replace('WEATHER_CONTEXT', weatherContext);
  };

  // Select appropriate prompt based on question type
  switch (questionType) {
    case 'whatToWear':
      return replacePlaceholders(WHAT_TO_WEAR_PROMPT);
    case 'suggestMusic':
      return replacePlaceholders(SUGGEST_MUSIC_PROMPT);
    case 'interestingFact':
      return replacePlaceholders(INTERESTING_FACT_PROMPT);
    case 'outdoorActivities':
      return replacePlaceholders(OUTDOOR_ACTIVITIES_PROMPT);
    default:
      return BASE_SYSTEM_PROMPT + "\n\n" + weatherContext;
  }
};