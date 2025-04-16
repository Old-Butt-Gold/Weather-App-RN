import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import openaiService, { ChatMessage } from '../../api/openai';
import { t } from 'i18next';

// Define chat state type
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

// Define an async thunk to send a question and get a response
export const sendQuestion = createAsyncThunk(
  'chat/sendQuestion',
  async (
    {
      questionType,
      questionText,
      weatherData = { temperature: 25, condition: 'Rainy' },
    }: {
      questionType: string;
      questionText: string;
      weatherData?: { temperature: number; condition: string };
    },
    { rejectWithValue }
  ) => {
    console.log('[CHAT THUNK] Starting request with:', { questionType, questionText, weatherData });
    
    try {
      console.log('[CHAT THUNK] Calling OpenAI service...');
      
      // Send the question to OpenAI and get a response
      const response = await openaiService.generateResponseForQuestion(
        questionType,
        questionText,
        weatherData
      );
      
      console.log('[CHAT THUNK] Received successful response:', { 
        responseLength: response.length,
        responseSample: response.substring(0, 100) + '...' // Log just a sample for brevity
      });
      
      return {
        questionText,
        responseText: response,
      };
    } catch (error: any) {
      console.error('[CHAT THUNK] Error occurred:', error);
      console.log('[CHAT THUNK] Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      
      return rejectWithValue(
        error.message || 'Failed to get response from AI'
      );
    }
  }
);

// Create chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Add a message directly to the chat
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      console.log('[CHAT SLICE] Adding message:', action.payload);
      state.messages.push(action.payload);
    },
    // Clear all messages
    clearChat: (state) => {
      console.log('[CHAT SLICE] Clearing chat');
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(sendQuestion.pending, (state) => {
        console.log('[CHAT SLICE] Request pending, setting loading state');
        state.isLoading = true;
        state.error = null;
      })
      // Handle successful response
      .addCase(sendQuestion.fulfilled, (state, action) => {
        console.log('[CHAT SLICE] Request fulfilled, adding messages');
        state.isLoading = false;
        
        // Add user question to messages
        state.messages.push({
          role: 'user',
          content: action.payload.questionText,
        });
        
        // Add assistant response to messages
        state.messages.push({
          role: 'assistant',
          content: action.payload.responseText,
        });
        
        console.log('[CHAT SLICE] New message count:', state.messages.length);
      })
      // Handle error
      .addCase(sendQuestion.rejected, (state, action) => {
        console.error('[CHAT SLICE] Request rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string || 'An unknown error occurred';
        
        // Add error message
        state.messages.push({
          role: 'assistant',
          content: t('chat.errorGettingResponse', 'Sorry, I encountered an error getting a response. Please try again later.'),
        });
        
        console.log('[CHAT SLICE] Added error message, new count:', state.messages.length);
      });
  },
});

// Export actions and reducer
export const { addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;