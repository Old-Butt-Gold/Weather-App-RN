import axios from 'axios';
import { getAzureOpenAIEndpoint, getAzureOpenAIKey } from '../utils/env';
import { getPromptForQuestion } from '../utils/prompts';
import { WeatherData, AppSettingsState } from '../store/types/types';
import {WeatherState} from "../store/slices/weatherSlice";

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

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

export const openaiService = {
  sendChatRequest: async (
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<string> => {
    const endpoint = getAzureOpenAIEndpoint();
    const apiKey = getAzureOpenAIKey();
    const model = options.model || 'gpt-4o-mini';
    
    const url = `${endpoint}/openai/deployments/${model}/chat/completions?api-version=2024-02-01`;

    if (!endpoint || !apiKey) {
      throw new Error('Azure OpenAI configuration missing');
    }

    try {
      const requestBody: OpenAIChatRequest = {
        model: model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 800,
      };
      
      const response = await axios.post<OpenAIChatResponse>(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      });

      if (response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        console.log('[OPENAI SERVICE] Response content sample:', 
          content.substring(0, 50) + '...');
        return content;
      }

      throw new Error('No response from OpenAI API');
    } catch (error: any) {
      throw error;
    }
  },

  // Generate a chat response for a specific question type
  generateResponseForQuestion: async (
    questionType: string,
    userQuestion: string,
    weatherState: WeatherState,
    appSettings: AppSettingsState
  ): Promise<string> => {

    const systemPrompt = getPromptForQuestion(questionType, weatherState);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion }
    ];
    
    const language = appSettings.language || 'en';
    if (language === 'ru') {
      messages[0].content += '\nPlease respond in Russian language.';
    }

    return await openaiService.sendChatRequest(messages, {
      temperature: 0.7,
      maxTokens: 500,
      model: 'gpt-4o-mini',
    });
  }
};

export default openaiService;