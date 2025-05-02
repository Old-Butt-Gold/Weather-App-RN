import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocationResult } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppAsyncThunk } from '../hooks';
import {fetchLocation} from "../actions/fetchLocation";

export type ExtendedLocationResult = LocationResult & {
    utc_offset_seconds: number;
};

interface FavoritesState {
    favorites: ExtendedLocationResult[];
}

const initialState: FavoritesState = {
    favorites: [],
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        setFavorites: (state, action: PayloadAction<ExtendedLocationResult[]>) => {
            state.favorites = action.payload;
        },
        // Изменим редьюсер addFavorite:
        addFavorite: (state, action: PayloadAction<ExtendedLocationResult>) => {
            // Проверяем по имени и координатам, чтобы избежать дубликатов
            if (!state.favorites.some(fav =>
                fav.utc_offset_seconds === action.payload.utc_offset_seconds &&
                fav.name === action.payload.name &&
                fav.country == action.payload.country &&
                fav.country_code == action.payload.country_code &&
                fav.latitude === action.payload.latitude &&
                fav.longitude === action.payload.longitude
            )) {
                state.favorites.push(action.payload);
            }
        },
        removeFavorite: (state, action: PayloadAction<number>) => {
            state.favorites = state.favorites.filter(fav => fav.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadFavorites.fulfilled, (state, action) => {
            state.favorites = action.payload;
        });
    },
});

// Типизированные асинхронные thunk'и с createAppAsyncThunk
export const loadFavorites = createAppAsyncThunk(
    'favorites/loadFavorites',
    async (_, { dispatch }) => {
        try {
            console.log('Loading favorites...');
            const savedFavorites = await AsyncStorage.getItem('@favorites');
            if (savedFavorites) {
                const parsedFavorites = JSON.parse(savedFavorites) as ExtendedLocationResult[];
                console.log('Loaded favorites:', parsedFavorites);
                return parsedFavorites;
            }
            console.log('No favorites found in storage');
            return [];
        } catch (error) {
            console.error('Failed to load favorites', error);
            throw error;
        }
    }
);

export const saveFavorites = createAppAsyncThunk(
    'favorites/saveFavorites',
    async (favorites: ExtendedLocationResult[], _) => {
        try {
            console.log('Saving favorites:', favorites);
            await AsyncStorage.setItem('@favorites', JSON.stringify(favorites));
            console.log('Favorites saved successfully');
        } catch (error) {
            console.error('Failed to save favorites', error);
            throw error;
        }
    }
);

// Экспорт actions и редьюсера
export const { setFavorites, addFavorite, removeFavorite } = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;