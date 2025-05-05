import axios from 'axios';
import {getPromptForQuestion} from '../utils/prompts';
import {AppSettingsState} from '../store/types/types';
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
    const endpoint = process.env.EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.EXPO_PUBLIC_AZURE_OPENAI_KEY;
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
        return response.data.choices[0].message.content;
      }

      throw new Error('No response from OpenAI API');
    } catch (error: any) {
      throw error;
    }
  },

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