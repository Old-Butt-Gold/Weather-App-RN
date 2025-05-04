import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';
import {appSettingsReducer} from "./slices/appSettingsSlice";
import {weatherReducer} from "./slices/weatherSlice";

const appSettingsPersistConfig = {
    key: 'appSettings',
    storage: AsyncStorage,
    whitelist: ['language']
};

const weatherPersistConfig = {
    key: 'weather',
    storage: AsyncStorage,
    whitelist: ['temperatureUnit', 'windSpeedUnit']
};


export const persistedAppSettingsReducer = persistReducer(appSettingsPersistConfig, appSettingsReducer);
export const persistedWeatherReducer = persistReducer(weatherPersistConfig, weatherReducer);