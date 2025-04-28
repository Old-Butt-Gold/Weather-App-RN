import { configureStore } from '@reduxjs/toolkit';
import {weatherReducer} from "./slices/weatherSlice";
import {locationReducer} from "./slices/locationSlice";
import chatReducer from './slices/chatSlice';
import {appSettingsReducer} from "./slices/appSettingsSlice";
import {weatherMapReducer} from "./slices/weatherMapSlice";
import {favoritesReducer} from "./slices/favoritesSlice";


export const store = configureStore({
    reducer: {
        chat: chatReducer,
        weather: weatherReducer,
        location: locationReducer,
        appSettings: appSettingsReducer,
        weatherMap: weatherMapReducer,
        favorites: favoritesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;