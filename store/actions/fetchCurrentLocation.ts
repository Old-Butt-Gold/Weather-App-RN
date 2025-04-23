import {Coordinates} from "../types/types";
import * as Location from 'expo-location';
import {LocationAccuracy} from 'expo-location';
import {createAppAsyncThunk} from "../hooks";

export const fetchCurrentLocation = createAppAsyncThunk<Coordinates>(
    'weatherMap/fetchCurrentLocation',
    async (_, { rejectWithValue }) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                return rejectWithValue({ message: 'Location permission not granted' });
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: LocationAccuracy.BestForNavigation
            });


            const coordinates: Coordinates = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };

            console.log('Navigator: ', JSON.stringify(coordinates, null, 2));

            return coordinates;
        } catch (error: any) {
            return rejectWithValue({ message: error.message || 'Failed to get current location' });
        }
    }
);