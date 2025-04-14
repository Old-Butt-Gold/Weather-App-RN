import {createAppAsyncThunk} from "../hooks";
import {LocationResult} from "../types/types";
import geocodingApi from "../../api/geocodingApi";

export interface FetchLocationParams {
    query: string; //введенное значение в поле
    language: string; //язык i18next
}

export const fetchLocation = createAppAsyncThunk<LocationResult[], FetchLocationParams>(
    'location/fetchLocation',
    async (params, { getState, dispatch, rejectWithValue }) => {
        try {
            const { query, language } = params;
            const requestParams = {
                name: query,
                count: 5,
                language: language,
                format: 'json',
            };
            const response = await geocodingApi.get('', { params: requestParams });
            return (response.data.results || []) as LocationResult[];
        } catch (error: any) {
            return rejectWithValue({ message: error.message });
        }
    }
);