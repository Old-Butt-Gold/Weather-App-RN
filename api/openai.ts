import axios from 'axios';
import { getAzureOpenAIEndpoint, getAzureOpenAIKey } from '../utils/env';
import { getPromptForQuestion } from '../utils/prompts';
import { WeatherData, AppSettingsState } from '../store/types/types';

// Define message types
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Define API request and response types
type OpenAIChatRequest = {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
};

type OpenAIChatResponseChoice = {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
};

type OpenAIChatResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChatResponseChoice[];
};

// OpenAI API service
export const openaiService = {
  // Send chat completion request to Azure OpenAI API
  sendChatRequest: async (
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<string> => {
    console.log('[OPENAI SERVICE] Starting API request');
    
    const endpoint = getAzureOpenAIEndpoint();
    const apiKey = getAzureOpenAIKey();
    const model = options.model || 'gpt-4o-mini';
    
    console.log('[OPENAI SERVICE] Config:', { 
      endpointExists: !!endpoint,
      apiKeyExists: !!apiKey,
      model,
      temperature: options.temperature,
      maxTokens: options.maxTokens
    });
    
    // Construct URL in Azure OpenAI format
    const url = `${endpoint}/openai/deployments/${model}/chat/completions?api-version=2024-02-01`;
    console.log('[OPENAI SERVICE] Request URL:', url);

    if (!endpoint || !apiKey) {
      console.error('[OPENAI SERVICE] Missing configuration!');
      throw new Error('Azure OpenAI configuration missing');
    }

    try {
      const requestBody: OpenAIChatRequest = {
        model: model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 800,
      };
      
      console.log('[OPENAI SERVICE] Request body:', JSON.stringify({
        ...requestBody,
        messages: requestBody.messages.map(m => ({
          role: m.role,
          content_length: m.content.length,
          content_preview: m.content.substring(0, 50) + '...'
        }))
      }));
      
      console.log('[OPENAI SERVICE] Messages count:', messages.length);

      console.log('[OPENAI SERVICE] Sending request to Azure...');
      const response = await axios.post<OpenAIChatResponse>(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      });

      console.log('[OPENAI SERVICE] Response received:', {
        status: response.status,
        statusText: response.statusText,
        hasChoices: !!response.data.choices,
        choicesLength: response.data.choices?.length
      });

      // Extract and return the assistant's message
      if (response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        console.log('[OPENAI SERVICE] Response content sample:', 
          content.substring(0, 50) + '...');
        return content;
      }

      console.error('[OPENAI SERVICE] No choices in response');
      throw new Error('No response from OpenAI API');
    } catch (error: any) {
      console.error('[OPENAI SERVICE] Error in API call:', error.message);
      
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('[OPENAI SERVICE] Error response data:', error.response.data);
        console.error('[OPENAI SERVICE] Error response status:', error.response.status);
        console.error('[OPENAI SERVICE] Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('[OPENAI SERVICE] No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('[OPENAI SERVICE] Error setting up request:', error.message);
      }
      
      throw error;
    }
  },

  // Generate a chat response for a specific question type
  generateResponseForQuestion: async (
    questionType: string,
    userQuestion: string,
    weatherData: WeatherData | null = null,
    appSettings: AppSettingsState | null = null
  ): Promise<string> => {
    console.log('[OPENAI SERVICE] Generating response for question type:', questionType);
    
    if (weatherData) {
      console.log('[OPENAI SERVICE] Using actual weather data:', {
        temperature: weatherData.current.temperature_2m,
        weatherCode: weatherData.current.weather_code,
        isDay: weatherData.current.is_day,
        units: {
          temp: weatherData.current_units?.temperature_2m,
          wind: weatherData.current_units?.wind_speed_10m
        }
      });
    } else {
      console.log('[OPENAI SERVICE] No weather data provided, using generic prompt');
    }
    
    // Get the appropriate system prompt for this question type
    const systemPrompt = getPromptForQuestion(questionType, weatherData);
    
    console.log('[OPENAI SERVICE] System prompt sample:', 
      systemPrompt.substring(0, 100) + '...');

    // Format messages for the API
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion }
    ];
    
    // Determine which language to use based on app settings
    const language = appSettings?.language || 'en';
    if (language === 'ru') {
      console.log('[OPENAI SERVICE] Using Russian language for response');
      // Add instruction to respond in Russian
      messages[0].content += '\nPlease respond in Russian language.';
    }
    
    console.log('[OPENAI SERVICE] Prepared messages for API call');

    // Send request to OpenAI
    return await openaiService.sendChatRequest(messages, {
      temperature: 0.7,
      maxTokens: 500,
      model: 'gpt-4o-mini',
    });
  }
};

export default openaiService;