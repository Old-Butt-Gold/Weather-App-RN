import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { persistedWeatherReducer } from './persistConfig';
import { persistedAppSettingsReducer } from './persistConfig';
import {locationReducer} from "./slices/locationSlice";
import chatReducer from './slices/chatSlice';
import {weatherMapReducer} from "./slices/weatherMapSlice";
import {favoritesReducer} from "./slices/favoritesSlice";

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        weather: persistedWeatherReducer,
        location: locationReducer,
        appSettings: persistedAppSettingsReducer,
        weatherMap: weatherMapReducer,
        favorites: favoritesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;