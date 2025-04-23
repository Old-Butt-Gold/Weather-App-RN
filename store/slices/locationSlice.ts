import {LocationResult, Status} from "../types/types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {fetchLocation} from "../actions/fetchLocation";

export interface LocationState {
    searchResults: LocationResult[];
    status: Status;
    loading: boolean;
    error: string | null;
}

const initialState: LocationState = {
    searchResults: [],
    status: "idle",
    loading: false,
    error: null,
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        // Для очистки результатов поиска, например, после выбора города
        clearSearchResults(state) {
            state.searchResults = [];
            state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocation.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLocation.fulfilled, (state, action: PayloadAction<LocationResult[]>) => {
                state.status = 'succeeded';
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(fetchLocation.rejected, (state, action) => {
                state.status = 'failed'
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка получения данных';
            });
    },
});

export const { clearSearchResults } = locationSlice.actions;
export const locationReducer = locationSlice.reducer;