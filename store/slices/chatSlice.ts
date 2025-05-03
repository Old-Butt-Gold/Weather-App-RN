import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import openaiService, { ChatMessage } from '../../api/openai';
import { t } from 'i18next';
import { AppSettingsState } from '../types/types';
import {WeatherState} from "./weatherSlice";

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

export const sendQuestion = createAsyncThunk(
  'chat/sendQuestion',
  async (
    {
      questionType,
      questionText,
      weatherState,
      appSettings,
    } : {
      questionType: string;
      questionText: string;
      weatherState: WeatherState;
      appSettings: AppSettingsState;
    },
    { rejectWithValue, getState }
  ) => {
    
    try {
      const response = await openaiService.generateResponseForQuestion(questionType, questionText,
        weatherState, appSettings
      );

      return {questionText, responseText: response};
    } catch (error: any) {
      
      return rejectWithValue(
        error.message || 'Failed to get response from AI'
      );
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendQuestion.fulfilled, (state, action) => {
        state.isLoading = false;

        state.messages.push({
          role: 'assistant',
          content: action.payload.responseText,
        });
      })
      .addCase(sendQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'An unknown error occurred';
        
        state.messages.push({
          role: 'assistant',
          content: t('chat.errorGettingResponse', 'Sorry, I encountered an error getting a response. Please try again later.'),
        });
        
      });
  },
});

export const { addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;