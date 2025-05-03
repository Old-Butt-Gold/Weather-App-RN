import { createAppAsyncThunk } from "../hooks";
import {Coordinates, LocationData} from "../types/types";
import * as Location from "expo-location";
import {LocationAccuracy} from "expo-location";

export const fetchLocationByIP = createAppAsyncThunk<LocationData, string>(
    'weather/fetchLocationByIP',
    async (lang, { getState, dispatch, rejectWithValue }) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                const response = await fetch(`http://ip-api.com/json/?lang=${lang}`);
                const data = await response.json();

                if (data && data.status === 'success') {
                    const locationData: LocationData = {
                        latitude: data.lat,
                        longitude: data.lon,
                        city: data.city,
                        country: data.country,
                        countryCode: data.countryCode,
                    };

                    console.log(locationData);

                    return locationData;
                } else {
                    return rejectWithValue({message: "Не удалось получить координаты по IP"});
                }
            } else {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: LocationAccuracy.Balanced
                });

                const coordinates: Coordinates = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };

                const locationInfo = await getLocationName(coordinates.latitude, coordinates.longitude);

                const locationData: LocationData = {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    city: locationInfo.city,
                    country: locationInfo.country,
                    countryCode: locationInfo.isoCountryCode,
                };

                return locationData;
            }
        } catch (error: any) {
            return rejectWithValue({ message: error.message });
        }
    }
);

interface LocationInfo {
    city: string;
    country: string;
    isoCountryCode: string;
}

const getLocationName = async (latitude: number, longitude: number): Promise<LocationInfo> => {
    try {
        const location = await Location.reverseGeocodeAsync({
            latitude,
            longitude
        });

        if (location && location.length > 0) {
            const { city, district, street, region, country, isoCountryCode } = location[0];

            let locationName: string = "";
            let countryName: string = "";
            let postalCodeName: string = "";

            if (city)
                locationName = city;
            else if (district)
                locationName = district;
            else if (street)
                locationName = street;
            else if (region)
                locationName = region;

            if (country)
                countryName = country;

            if (isoCountryCode)
                postalCodeName = isoCountryCode;

            return {city: locationName, country: countryName, isoCountryCode: postalCodeName};
        }

        return {city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, country: "", isoCountryCode: ""};
    } catch (error) {
        return {city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, country: "", isoCountryCode: ""};
    }
};