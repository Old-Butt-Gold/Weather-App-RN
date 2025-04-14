import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Типы для сообщений и состояния
interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  isError?: boolean;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

// Константы для подключения к Azure OpenAI (замените на свои)
const AZURE_OPENAI_ENDPOINT = 'YOUR_AZURE_OPENAI_ENDPOINT';
const AZURE_OPENAI_KEY = 'YOUR_AZURE_OPENAI_KEY';
const AZURE_OPENAI_DEPLOYMENT = 'YOUR_DEPLOYMENT_NAME';
const API_VERSION = '2023-05-15';

// Асинхронный action для отправки сообщения и получения ответа от ИИ
export const sendMessage = createAsyncThunk<
  { userMessage: Message; botMessage: Message },
  string,
  { 
    state: { chat: ChatState },
    rejectValue: string 
  }
>(
  'chat/sendMessage',
  async (message, { getState, rejectWithValue }) => {
    try {
      // Добавляем сообщение пользователя
      const userMessage: Message = { 
        text: message, 
        sender: 'user', 
        timestamp: new Date().toISOString() 
      };
      
      // Формируем историю сообщений для контекста
      const { messages } = getState().chat;
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Запрос к Azure OpenAI API
      const response = await axios.post(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`,
        {
          messages: [
            { role: 'system', content: 'Вы погодный ассистент, который отвечает на вопросы о погоде кратко и информативно.' },
            ...conversationHistory
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_OPENAI_KEY,
          },
        }
      );

      // Получаем ответ от ИИ
      const botResponse = response.data.choices[0].message.content.trim();
      
      // Формируем объект сообщения бота
      const botMessage: Message = {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      return { userMessage, botMessage };
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return rejectWithValue('Не удалось получить ответ. Пожалуйста, попробуйте позже.');
    }
  }
);

// Начальное состояние
const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<{ userMessage: Message; botMessage: Message }>) => {
        const { userMessage, botMessage } = action.payload;
        state.messages.push(userMessage);
        state.messages.push(botMessage);
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Добавляем сообщение об ошибке от бота
        state.messages.push({
          text: action.payload as string || 'Произошла ошибка при получении ответа',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isError: true,
        });
      });
  },
});

export const { resetMessages } = chatSlice.actions;
export default chatSlice.reducer;