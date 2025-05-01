import React, {useState, useCallback, useRef, useEffect} from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { ClockComponent } from '../components/ClockComponent';
import { Ionicons, FontAwesome, Entypo, AntDesign, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { t } from 'i18next';
import { NextDaysWeatherWidget } from "../components/NextDaysWeatherWidget";
import { SunMoonWidget } from "../components/SunMoonWidget";
import { AirCompositionWidget } from "../components/AirCompositionWidget";
import { useAppDispatch, useAppSelector } from "../store/hooks";

import {
    getCurrentHumidity, getCurrentLocalDateFromWeatherState,
    getCurrentRainChance,
    getCurrentTemperature,
    getCurrentTemperatureApparrent,
    getCurrentTemperatureUnit, getCurrentWindSpeed, getCurrentWindUnit,
    getWeatherCodeForHour
} from "../store/utils/weatherUtils";
import { fetchLocationByIP } from "../store/actions/fetchLocationByIp";
import { fetchWeather } from "../store/actions/fetchWeather";
import { fetchMoonPhase } from "../store/actions/fetchMoonPhase";
import { fetchAirQuality } from "../store/actions/fetchAirQuality";
import BackgroundImage from "../components/BackgroundImage";
import {addFavorite, loadFavorites, removeFavorite, saveFavorites} from "../store/slices/favoritesSlice";
import {LocationResult} from "../store/types/types";
import {LocationTitle} from "../components/RunningLine";
import {AnimatedWeatherCloud} from "../components/WeatherAnimation";


type WeatherDetailsItem = {
    icon: any,
    value: number,
    unit: string,
    labelKey: string,
}

type WeatherButtonsProps = {
    onChatPress: () => void;
};

type WeatherCardProps = {
    isNightTime: boolean;
    onChatPress: () => void;
};

type HomeScreenProps = {
    navigation: any;
};

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <View className="p-3 rounded-[15] bg-[#004b5870]/15">{icon}</View>
);

// Компонент заголовка местоположения
// const LocationTitle = () => {
//     const weatherCity = useAppSelector(state => state.weather.currentCity);
//
//     return (
//         <View className="flex-col items-center">
//             <Text className="font-manrope-extrabold text-2xl text-accent">{weatherCity}</Text>
//             <View className="w-20 h-2 bg-[#004b5870]/15 rounded-2xl"></View>
//         </View>
//     );
// };


// Компонент заголовка погоды
const WeatherHeader = () => {
    const weatherState = useAppSelector(state => state.weather);
    const localNowDate = getCurrentLocalDateFromWeatherState(weatherState);

    const weekdayShort = t(`date.weekdayShort.${localNowDate.getUTCDay()}`);
    const monthShort = t(`date.monthShort.${localNowDate.getUTCMonth()}`);

    const dispatch = useAppDispatch();

    const currentLanguage = useAppSelector(state => state.appSettings.language);

    const handleRefreshPress = async () => {
        try {
            // Параллельно обновляем все данные
            await Promise.all([
                dispatch(fetchWeather()),
                dispatch(fetchMoonPhase()),
                dispatch(fetchAirQuality())
            ]);
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
        }
    };

    return (
        <View className="flex-row justify-between items-start">
            <View className="flex-row items-center gap-2">
                <Entypo name="calendar" size={20} color="white" />
                <Text className="text-primary font-manrope-semibold text-[14px]">
                    {weekdayShort} {localNowDate.getUTCDate()} {monthShort} {localNowDate.getUTCFullYear()}
                </Text>
            </View>
            <TouchableOpacity onPress={async () => await handleRefreshPress()} className="p-2 rounded-[15] bg-white/20">
                <Ionicons name="reload-circle-sharp" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

// Компонент диапазона температур
const TemperatureRange = () => {
    const weatherState = useAppSelector(state => state.weather);
    const max = ~~weatherState.data?.daily.temperature_2m_max[1]!;
    const min = ~~weatherState.data?.daily.temperature_2m_min[1]!;
    const unit = getCurrentTemperatureUnit(weatherState);

    return (<View className="flex-row justify-center w-[48%]">
        <View className="flex-row px-3 py-2 gap-1 bg-white/15 rounded-[35]">
            <View className="flex-row items-center">
                <AntDesign name="arrowup" size={18} color="white"/>
                <Text className="font-poppins-medium text-accent text-[15px] ml-1 pr-1.5">{max}{unit}</Text>
            </View>
            <View className="flex-row items-center">
                <AntDesign name="arrowdown" size={18} color="white"/>
                <Text className="font-poppins-medium text-accent text-[15px] ml-1 pr-1.5">{min}{unit}</Text>
            </View>
        </View>
    </View>);
};

const TemperatureDisplay = () => {
    const weatherState = useAppSelector(x => x.weather);
    const currentWeatherDescription = t("clock.weather_code_descriptions." + getWeatherCodeForHour(weatherState, 0));
    const currentTemperature = ~~getCurrentTemperature(weatherState);
    const currentTemperatureUnit = getCurrentTemperatureUnit(weatherState);

    return (
        <View className="flex-row items-start">
            <View className="flex-col flex">
                <Text className={`text-accent font-manrope-extrabold max-w-40 ${
                    currentWeatherDescription.length > 16
                        ? 'text-[12px]'
                        : currentWeatherDescription.length > 8
                            ? 'text-[15px]'
                            : 'text-[20px]'
                }`}>
                    {currentWeatherDescription}
                </Text>
                <View className="flex-row relative w-full h-[90] items-center">
                    {currentTemperature < 0 && (
                        <Text className="font-poppins-light text-primary text-[30px] ">
                            {currentTemperature < 0 ? "-" : ""}
                        </Text>
                    )}
                    <Text className="font-poppins-medium text-primary text-[60px] leading-[80px]">
                        {Math.abs(currentTemperature)}
                    </Text>
                    <Text className="font-poppins-medium text-primary text-[28px] self-center ml-1">
                        {currentTemperatureUnit}
                    </Text>
                </View>
            </View>
        </View>
    );
};

// Компонент карточки деталей погоды
const WeatherDetailCard = ({ item } : { item: WeatherDetailsItem }) => {
    return (
        <View className="w-[48%] bg-white/15 rounded-[20px] px-3 py-4">
            <View className="absolute top-2 right-3">{item.icon}</View>
            <View className="flex-row items-end">
                <Text className="font-manrope-bold text-accent text-[36px] h-[60]">{item.value}</Text>
                <Text className="text-accent font-manrope-bold text-[15px] mb-1 ml-1">{item.unit}</Text>
            </View>
            <Text className="font-manrope-medium text-white/60 text-[12px]">{t(`weather.${item.labelKey}`)}</Text>
        </View>
    );
};

const WeatherButtons = ({ onChatPress }: WeatherButtonsProps) => (
    <View className="flex-row flex-wrap justify-between mt-6 w-full">
        <TemperatureRange />
        <View className="flex-row justify-center items-center w-[48%]">
            <TouchableOpacity
                onPress={onChatPress}
                className="px-2 py-2 bg-white/15 rounded-[35] w-full justify-center items-center"
            >
                <Text className="font-manrope-semibold text-accent text-[15px] mb-1">
                    {t('buttons.chatWithMe')}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

// Компонент деталей погоды
const WeatherDetails = () => {
    const weatherState = useAppSelector(x => x.weather);
    const weatherDetails: WeatherDetailsItem[] = [];

    weatherDetails.push({
        icon: <FontAwesome6 name="temperature-three-quarters" size={24} color="white" />,
        value: ~~getCurrentTemperatureApparrent(weatherState),
        unit: getCurrentTemperatureUnit(weatherState),
        labelKey: "feelsLike",
    });

    weatherDetails.push({
        icon: <FontAwesome6 name="wind" size={24} color="white" />,
        value: getCurrentWindSpeed(weatherState),
        unit: t(`windUnit.${getCurrentWindUnit(weatherState)}`),
        labelKey: "windSpeed",
    });

    weatherDetails.push({
        icon: <Ionicons name="rainy-sharp" size={24} color="white" />,
        value: getCurrentRainChance(weatherState, 0),
        unit: "%",
        labelKey: "rainChance"
    });

    weatherDetails.push({
        icon: <MaterialIcons name="water-drop" size={24} color="white" />,
        value: getCurrentHumidity(weatherState),
        unit: "%",
        labelKey: "humidity"
    });

    return <View className="flex-row flex-wrap justify-between mt-6 gap-3">
        {weatherDetails.map((item, index) => (
            <WeatherDetailCard key={index} item={item} />
        ))}
    </View>
};

// Компонент контента погоды
const WeatherContent = ({ isNightTime,onChatPress  }: Omit<WeatherCardProps, 'onChatPress | currentAnimation | animationKey | onAnimationPress | onAnimationFinish'>) => (
    <View className="flex-col">
        <View className="flex-row justify-between">
            <TemperatureDisplay />
            <View className="flex-col justify-end items-end">
                <View
                    className="rounded-xl overflow-hidden ml-2"
                    style={{ width: 170, height: 120 }}
                >
                    <AnimatedWeatherCloud isNightTime={isNightTime}  />
                </View>
            </View>
        </View>
    </View>
);

// Компонент карточки погоды
const WeatherCard = ({
                         isNightTime,
                         onChatPress
                     }: WeatherCardProps) => (
    <View className="w-full mt-6 p-6 relative overflow-hidden rounded-[25] bg-[#45576170]/25">
        <View className="w-full z-10">
            <WeatherHeader />
            <WeatherContent
                isNightTime={isNightTime}
                onChatPress={onChatPress}
            />
            <WeatherButtons onChatPress={onChatPress}/>
            <WeatherDetails />
        </View>
    </View>
);

// Главный компонент экрана
export const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const dispatch = useAppDispatch();
    // DON'T DELETE IT ALL APP WORK ON THIS LINE
    const { language } = useAppSelector(state => state.appSettings);
    const weatherState = useAppSelector(x => x.weather);
    const { favorites } = useAppSelector(state => state.favorites);

    useEffect(() => {
        dispatch(loadFavorites());
    }, []);

    const isCurrentFavorite = favorites.some(fav =>
        fav.name === weatherState.currentCity
    );

    // В функции toggleFavorite заменим на:
    const toggleFavorite = async () => {
        if (!weatherState.location || !weatherState.currentCity) return;

        const location: LocationResult = {
            id: Date.now(), // временный ID
            name: weatherState.currentCity,
            country: '', // можно добавить из weatherState если есть
            latitude: weatherState.location.latitude,
            longitude: weatherState.location.longitude,
            weatherInfo: {
                temperature_current: weatherState.data?.current.temperature_2m || 0,
                temperature_max: weatherState.data?.daily.temperature_2m_max[0] || 0,
                temperature_min: weatherState.data?.daily.temperature_2m_min[0] || 0,
                weather_code: weatherState.data?.current.weather_code || 0,
                is_day: weatherState.data?.current.is_day === 1,
                utc_offset_seconds: weatherState.data?.utc_offset_seconds || 0
            }
        };

        if (isCurrentFavorite) {
            const favToRemove = favorites.find(fav =>
                fav.name === weatherState.currentCity
            );
            if (favToRemove) {
                dispatch(removeFavorite(favToRemove.id));
                // Сохраняем обновленные избранные
                const updatedFavorites = favorites.filter(fav => fav.id !== favToRemove.id);
                dispatch(saveFavorites(updatedFavorites));
            }
        } else {
            dispatch(addFavorite(location));
            // Сохраняем обновленные избранные
            dispatch(saveFavorites([...favorites, location]));
        }
    };

    const scrollY = useRef(new Animated.Value(0)).current;
    const isNightTime = weatherState.data!.current.is_day === 0;

    const handleChatPress = useCallback(() => {
        navigation.navigate('Chat');
    }, [navigation]);

    const headerBackgroundOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 0.7],
        extrapolate: 'clamp',
    });

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    return (
        <>
            <StatusBar style="light" />
            <BackgroundImage
                blurRadius={5}
                overlayColor="rgba(25, 50, 75, 0.2)"
                isPage={true}
            />

            {/* Фиксированный хедер с анимированным фоном */}
            <Animated.View
                className="w-full flex-row justify-between items-center px-4 pt-10 pb-4 absolute top-0 left-0 right-0 z-50"
                style={{
                    paddingTop: 60,
                    backgroundColor: scrollY.interpolate({
                        inputRange: [0, 50],
                        outputRange: ['rgba(25, 50, 75, 0)', 'rgba(112, 130, 140, 0.5)'],
                        extrapolate: 'clamp',
                    }),
                }}
            >
                <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <IconButton icon={<Ionicons name="settings" size={24} color="white"/>}/>
                </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('WeatherMap')}>
                        <IconButton icon={<Ionicons name="planet" size={24} color="white"/>}/>
                    </TouchableOpacity>
                </View>
                <LocationTitle
                    title={weatherState.currentCity}
                />

                <View className="flex-row gap-2">
                    <TouchableOpacity onPress={toggleFavorite}>
                        <IconButton icon={
                            <Ionicons
                                name={isCurrentFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={isCurrentFavorite ? "white" : "white"}
                            />
                        }/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                        <IconButton icon={<FontAwesome name="search" size={24} color="white"/>}/>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.ScrollView
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: 100, // Отступ для фиксированного хедера
                }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 justify-center items-center px-4 w-full relative pb-5">
                    <WeatherCard
                        isNightTime={isNightTime}
                        onChatPress={handleChatPress}
                    />
                    <ClockComponent />
                    <NextDaysWeatherWidget />
                    <SunMoonWidget/>
                    <AirCompositionWidget />
                </View>
            </Animated.ScrollView>
        </>
    );
};
