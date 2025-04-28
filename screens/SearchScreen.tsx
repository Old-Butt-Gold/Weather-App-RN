import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { t } from 'i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLocation } from '../store/actions/fetchLocation';
import { clearSearchResults } from '../store/slices/locationSlice';
import { setLocation, setCurrentCity } from '../store/slices/weatherSlice';
import { Ionicons } from '@expo/vector-icons';
import { LocationResult } from "../store/types/types";
import { fetchWeather } from "../store/actions/fetchWeather";
import { fetchMoonPhase } from "../store/actions/fetchMoonPhase";
import { fetchAirQuality } from "../store/actions/fetchAirQuality";
import { useNavigation } from '@react-navigation/native';
import BackgroundImage from "../components/BackgroundImage";
import {getLocalDateByOffsetSeconds} from "../store/utils/convertUtils";
import {getWeatherCodeForHour} from "../store/utils/weatherUtils";
import { Keyboard } from 'react-native';

// const mockSearchResults: LocationResult[] = [
//     {
//         id: 1,
//         name: "New York",
//         country: "USA",
//         country_code: "US",
//         admin1: "New York",
//         latitude: 40.7128,
//         longitude: -74.0060,
//         weatherInfo: {
//             weather_code: 61,
//             temperature_current: 21,
//             temperature_min: 17,
//             temperature_max: 25,
//             utc_offset_seconds: -14400,
//             is_day: true,
//         },
//     },
//     {
//         id: 2,
//         name: "London",
//         country: "UK",
//         country_code: "GB",
//         admin1: "England",
//         latitude: 51.5072,
//         longitude: -0.1276,
//         weatherInfo: {
//             weather_code: 1,
//             temperature_current: 14,
//             temperature_min: 10,
//             temperature_max: 18,
//             utc_offset_seconds: 0,
//             is_day: false,
//         },
//     },
//     {
//         id: 3,
//         name: "TokyoTokyoTokyoTokyo ",
//         country: "Japan",
//         country_code: "JP",
//         admin1: "TokyoTokyoTokyoTokyo ",
//         latitude: 35.6762,
//         longitude: 139.6503,
//         weatherInfo: {
//             weather_code: 82,
//             temperature_current: 23,
//             temperature_min: 19,
//             temperature_max: 26,
//             utc_offset_seconds: 32400,
//             is_day: true,
//         },
//     },
//     {
//         id: 4,
//         name: "Paris",
//         country: "France",
//         country_code: "FR",
//         admin1: "Île-de-France",
//         latitude: 48.8566,
//         longitude: 2.3522,
//         weatherInfo: {
//             weather_code: 2,
//             temperature_current: 17,
//             temperature_min: 12,
//             temperature_max: 20,
//             utc_offset_seconds: 7200,
//             is_day: false,
//         },
//     },
// ];

interface SearchResultCardProps {
    item: LocationResult;
    onPress: () => void;
}
const SearchResultCard: React.FC<SearchResultCardProps> = ({ item, onPress }) => {
    const localDate = item.weatherInfo.utc_offset_seconds !== null
        ? getLocalDateByOffsetSeconds(item.weatherInfo.utc_offset_seconds)
        : null;
    const temperatureText = item.weatherInfo.temperature_current !== null
        ? `${~~item.weatherInfo.temperature_current}°`
        : '-';
    return (
        <TouchableOpacity
            className="bg-white/10 rounded-3xl px-4 py-2 mb-3 h-40 flex-col"
            onPress={onPress}
        >
            <BackgroundImage
                blurRadius={1}
                overlayColor="rgba(25, 50, 75, 0.5)"
                hourOverride={localDate?.getUTCHours()}
                containerStyle={[{ borderRadius: 20 }, { overflow: 'hidden' }]}
                isPage={false}
                weatherCodeOverride={item.weatherInfo.weather_code ?? undefined}
            />
            <View className="flex-row w-full justify-between h-[70%] items-start">
                <View className="flex-col">
                    <Text
                        className={`text-white font-manrope-bold ${
                            item.name!.length > 20 ? 'text-[16px]' :
                                item.name!.length > 13 ? 'text-[20px]' :
                                    'text-[24px]'
                        } h-[40px]`}
                    >
                        {item.name}
                    </Text>
                    <Text className="text-white/40 font-poppins-regular text-[12px] h-5 leading-4">{item.country}</Text>
                    <Text className="text-white font-poppins-regular text-[13px] text-left leading-[35px]">{`${localDate?.getUTCHours().toString().padStart(2, '0')}:${localDate?.getUTCMinutes().toString().padStart(2, '0')}`}</Text>
                </View>
                <Text className="text-white font-manrope-regular text-[50px] leading-[65px]">{temperatureText}</Text>
            </View>
            <View className="flex-row w-full justify-between items-start">
                    <Text className="text-white font-manrope-medium text-[13px] max-w-60 text-left">{t("clock.weather_code_descriptions." + item.weatherInfo.weather_code)}</Text>
                    <Text className="text-white/80 font-manrope-bold text-[13px]">{`${t("search.maxLabel")}:${~~item.weatherInfo.temperature_max!}°,${t("search.minLabel")}:${~~item.weatherInfo.temperature_min!}°`}</Text>
            </View>
        </TouchableOpacity>
    );
};

const SearchScreen = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const { searchResults, loading } = useAppSelector(state => state.location);
    const { language } = useAppSelector(state => state.appSettings);
    const [searchQuery, setSearchQuery] = useState('');
    const temperatureUnit = useAppSelector(state => state.weather.temperatureUnit);
    // const [useMockData, setUseMockData] = useState(false); // переключалка
    // const displayedResults = useMockData ? mockSearchResults : searchResults;
    useEffect(() => {
        return () => {
            setSearchQuery('');
            dispatch(clearSearchResults());
        };
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.length > 2) {
                dispatch(fetchLocation({ query: searchQuery, language, temperatureUnit }));
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, language]);

    const handleSelectLocation = async (location: LocationResult) => {
        dispatch(setLocation({
            latitude: location.latitude,
            longitude: location.longitude
        }));
        dispatch(setCurrentCity(location.name || location.country));

        await Promise.all([
            dispatch(fetchWeather()),
            dispatch(fetchMoonPhase()),
            dispatch(fetchAirQuality())
        ]);

        navigation.goBack();
    };

    return (
        <View className="flex-1 p-4 pt-14">
            <BackgroundImage
                blurRadius={5}
                overlayColor="rgba(25, 50, 75, 0.2)"
                isPage={true}
            />
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-manrope-bold text-xl">{t('search.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Input */}
            <View className="bg-white/10 rounded-xl p-1 mb-4 flex-row items-center">
                <Ionicons name="search" size={20} color="white" style={{ marginRight: 8 }} />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('search.placeholder')}
                    placeholderTextColor="#ffffff80"
                    className="flex-1 text-white font-manrope-medium text-base"
                    autoFocus
                />
            </View>

            {/* Results List */}
            {loading ? (
                <ActivityIndicator size="large" color="white" />
            ) : (
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <SearchResultCard
                            item={item}
                            onPress={async () => await handleSelectLocation(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <Text className="text-white/60 text-center font-manrope-medium">
                            {t('search.noResults')}
                        </Text>
                    }
                />
            )}
        </View>
    );
};

export default SearchScreen;
