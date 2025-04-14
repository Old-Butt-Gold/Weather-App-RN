import { configureStore } from '@reduxjs/toolkit';
import {weatherReducer} from "./slices/weatherSlice";
import {locationReducer} from "./slices/locationSlice";

export const store = configureStore({
    reducer: {
        weather: weatherReducer,
        location: locationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// Выведение типов RootState и AppDispatch из хранилища
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;