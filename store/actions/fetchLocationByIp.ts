import { createAppAsyncThunk } from "../hooks";
import {Coordinates, LocationData} from "../types/types";
import * as Location from "expo-location";
import {LocationAccuracy} from "expo-location";
import yandexGeocoding from "../../api/yandexGeocoding";

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

                const locationInfo = await getLocationName(coordinates.latitude, coordinates.longitude, lang);

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

interface Components {
    kind: string,
    name: string,
}

const getLocationName = async (latitude: number, longitude: number, lang: string): Promise<LocationInfo> => {
    try {
        const params = {
            geocode: `${longitude},${latitude}`,
            lang: `${lang}_RU`,
            apikey: process.env.EXPO_PUBLIC_YANDEX_API_KEY,
            format: "json",
            results: "1"
        };

        const response = await yandexGeocoding.get('', { params });

        const data = response.data;

        if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
            const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;

            const countryCode = geoObject.metaDataProperty.GeocoderMetaData.AddressDetails?.Country?.CountryNameCode || '';
            const country = geoObject.metaDataProperty.GeocoderMetaData.AddressDetails?.Country?.CountryName || '';

            const formattedAddress = geoObject.metaDataProperty.GeocoderMetaData.Address?.formatted || '';
            const addressWithoutCountry = formattedAddress
                .split(', ')
                .slice(1)
                .join(', ');

            const components = geoObject.metaDataProperty.GeocoderMetaData.Address?.Components as Components[] || [];
            const cityPart = components.find(c => c.kind === 'locality')?.name || '';
            const streetPart = components.find(c => c.kind === 'street')?.name || '';
            const streetHouse = components.find(c => c.kind === 'house')?.name || '';
            const combinedAddress = [cityPart, streetPart, streetHouse].filter(Boolean).join(', ');

            return {
                city: addressWithoutCountry || combinedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                country: country,
                isoCountryCode: countryCode
            };
        }

        return {
            city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            country: '',
            isoCountryCode: ''
        };
    } catch (error) {
        return {
            city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            country: '',
            isoCountryCode: ''
        };
    }
};