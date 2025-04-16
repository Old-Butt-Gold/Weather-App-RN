import { createAppAsyncThunk } from "../hooks";
import {LocationData} from "../types/types";

export const fetchLocationByIP = createAppAsyncThunk<LocationData, string>(
    'weather/fetchLocationByIP',
    async (lang, { getState, dispatch, rejectWithValue }) => {
        try {
            const response = await fetch(`http://ip-api.com/json/?lang=${lang}`);
            const data = await response.json();

            if (data && data.status === 'success') {
                const locationData: LocationData = {
                    latitude: data.lat,
                    longitude: data.lon,
                    city: data.city,
                };

                console.log(locationData);

                return locationData;
            } else {
                return rejectWithValue({ message: "Не удалось получить координаты по IP" });
            }
        } catch (error: any) {
            return rejectWithValue({ message: error.message });
        }
    }
);
