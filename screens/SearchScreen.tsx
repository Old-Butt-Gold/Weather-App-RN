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

const SearchScreen = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const { searchResults, loading } = useAppSelector(state => state.location);
    const { language } = useAppSelector(state => state.appSettings);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        return () => {
            setSearchQuery('');
            dispatch(clearSearchResults());
        };
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.length > 2) {
                dispatch(fetchLocation({ query: searchQuery, language }));
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

        // Обновляем данные после выбора локации
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
            />
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-manrope-bold text-xl">{t('search.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Input */}
            <View className="bg-white/10 rounded-xl p-3 mb-4">
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('search.placeholder')}
                    placeholderTextColor="#ffffff80"
                    className="text-white font-manrope-medium text-base"
                    autoFocus
                />
            </View>

            {/* Results List */}
            {loading ? (
                <ActivityIndicator size="large" color="white" />
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white/10 rounded-xl p-4 mb-2"
                            onPress={async () => await handleSelectLocation(item)}
                        >
                            <Text className="text-white font-manrope-bold text-lg">{item.name}</Text>
                            <Text className="text-white/60 font-manrope-medium text-sm">
                                {item.country} • {item.admin1}
                            </Text>
                        </TouchableOpacity>
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