import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppSettingsState} from "../types/types";

const initialState: AppSettingsState = {
    language: 'ru',
};

const appSettingsSlice = createSlice({
    name: 'appSettings',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<'ru' | 'en'>) => {
            state.language = action.payload;
        },
    },
});

export const { setLanguage } = appSettingsSlice.actions;
export const appSettingsReducer = appSettingsSlice.reducer;