import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocationResult } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppAsyncThunk } from '../hooks';

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
        addFavorite: (state, action: PayloadAction<ExtendedLocationResult>) => {
            if (!state.favorites.some(fav =>
                fav.utc_offset_seconds === action.payload.utc_offset_seconds &&
                fav.name === action.payload.name &&
                fav.country == action.payload.country &&
                fav.country_code == action.payload.country_code &&
                fav.latitude === action.payload.latitude &&
                fav.longitude === action.payload.longitude &&
                fav.admin1 == action.payload.admin1
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

export const loadFavorites = createAppAsyncThunk(
    'favorites/loadFavorites',
    async (_, { dispatch }) => {
        try {
            const savedFavorites = await AsyncStorage.getItem('@favorites');
            if (savedFavorites) {
                const parsedFavorites = JSON.parse(savedFavorites) as ExtendedLocationResult[];
                console.log('Loaded favorites:', parsedFavorites);
                return parsedFavorites;
            }
            return [];
        } catch (error) {
            throw error;
        }
    }
);

export const saveFavorites = createAppAsyncThunk(
    'favorites/saveFavorites',
    async (favorites: ExtendedLocationResult[], _) => {
        try {
            await AsyncStorage.setItem('@favorites', JSON.stringify(favorites));
        } catch (error) {
            throw error;
        }
    }
);

export const {addFavorite, removeFavorite } = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;