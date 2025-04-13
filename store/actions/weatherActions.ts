
import {  } from '@reduxjs/toolkit';
import {createAppAsyncThunk} from "../createAppAsyncThunk";
import visualCrossingApi from "../../api/visualcrossing/api-instance/api-instance";

export const fetchWeather = createAppAsyncThunk(
    'weather/fetchWeather',
    async (location: string, { rejectWithValue }) => {
        try {
            const response = await visualCrossingApi.get(`/forecast?location=${location}`);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch weather');
        }
    }
);
