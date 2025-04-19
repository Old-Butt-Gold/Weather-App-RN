import React, { useState, useCallback } from 'react';
import {View, ScrollView, TouchableOpacity, Text, Image} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { ClockComponent } from '../components/ClockComponent';
import { Ionicons, FontAwesome, Entypo, AntDesign, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { t } from 'i18next';
import {NextDaysWeatherWidget} from "../components/NextDaysWeatherWidget";
import {SunMoonWidget} from "../components/SunMoonWidget";
import {AirCompositionWidget} from "../components/AirCompositionWidget";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {
    getCurrentHumidity,
    getCurrentRainChance,
    getCurrentTemperature,
    getCurrentTemperatureApparrent,
    getCurrentTemperatureUnit, getCurrentWindSpeed, getCurrentWindUnit,
    getWeatherCodeForHour
} from "../store/utils/weatherUtils";
import {useNavigation} from "@react-navigation/native";
import i18n from "../i18n/i18n";
import {fetchLocationByIP} from "../store/actions/fetchLocationByIp";
import {fetchWeather} from "../store/actions/fetchWeather";
import {fetchMoonPhase} from "../store/actions/fetchMoonPhase";
import {fetchAirQuality} from "../store/actions/fetchAirQuality";
import SearchModal from "./SearchModal";
import {clearSearchResults} from "../store/slices/locationSlice";
import {ScreenLayout} from "../components/ScreenLayout";


// Константы анимаций
const ANIMATIONS = [
    { source: require("../assets/svg-icons/animations/cloudSpeaks.json"), repeats: 3 },
    { source: require("../assets/svg-icons/animations/cloudyStatic.json"), repeats: 2 },
    { source: require("../assets/svg-icons/animations/cloudSpeaks.json"), repeats: 1 },
    { source: require("../assets/svg-icons/animations/cloudyStart.json"), repeats: 1 },
    { source: require("../assets/svg-icons/animations/welcomeCloudy.json"), repeats: 1 }
];

const CLICK_ANIMATIONS = {
    day: { source: require("../assets/svg-icons/animations/welcomeCloudy.json"), repeats: 1 },
    night: { source: require("../assets/svg-icons/animations/angryCloud.json"), repeats: 1 }
};

const NIGHT_ANIMATION = {
    source: require("../assets/svg-icons/animations/sleepingCloudNew.json"),
    repeats: 1
};

type WeatherDetailsItem = {
    icon: any,
    value: number,
    unit: string,
    labelKey: string,
}
type WeatherButtonsProps = {
    onChatPress: () => void;
};
// Фильтры цветов для Lottie
const LOTTIE_COLOR_FILTERS = [
    { keypath: "mouth", color: "#2B3F56" },
    { keypath: "eye_r", color: "#2B3F56" },
    { keypath: "eye_l", color: "#2B3F56" },
    { keypath: "hand", color: "#FFFFFF" },
    { keypath: "hand Container", color: "#FFFFFF" },
    { keypath: "cloud", color: "#FFFFFF" },
];

// Типы
type AnimationState = {
    currentIndex: number;
    repeatCount: number;
    animationKey: number;
    clickAnimation: { source: any; repeats: number } | null;
};

type WeatherCardProps = {
    isNightTime: boolean;
    currentAnimation: any;
    animationKey: number;
    onAnimationPress: () => void;
    onAnimationFinish: () => void;
    onChatPress: () => void; // Добавлен новый prop для обработки нажатия на кнопку чата
};

type HomeScreenProps = {
    navigation: any; // Добавлен тип для навигации
};

// Компонент фонового изображения


// Компонент кнопки с иконкой
const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <View className="p-3 rounded-[15] bg-white/20">{icon}</View>
);

// Компонент заголовка местоположения
const LocationTitle = () => {
    const weatherCity = useAppSelector(state => state.weather.currentCity);

    return (
        <View className="flex-col items-center">
            <Text className="font-manrope-extrabold text-2xl text-accent">{weatherCity}</Text>
            <View className="w-20 h-2 bg-white/20 rounded-2xl"></View>
        </View>
    );
};

// Компонент шапки

// Компонент размытого фона
const BlurBackground = () => (
    <BlurView
        intensity={44}
        tint="light"
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 25,
            overflow: 'hidden',
            zIndex: 0,
        }}
    />
);

// Компонент заголовка погоды
const WeatherHeader = () => {
    const date = new Date();

    const weekdayShort = t(`date.weekdayShort.${date.getDay()}`);
    const monthShort = t(`date.monthShort.${date.getMonth()}`);

    const dispatch = useAppDispatch();
    const { loading } = useAppSelector(state => state.weather);
    const currentLanguage = useAppSelector(state => state.appSettings.language);

    const handleSearchPress = async () => {
        try {
            // Обновляем геолокацию
            await dispatch(fetchLocationByIP(currentLanguage));

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
                    {weekdayShort} {date.getDate()} {monthShort} {date.getFullYear()}
                </Text>
            </View>
            <TouchableOpacity onPress={async () => await handleSearchPress()} className="p-2 rounded-[15] bg-white/20">
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
        <View className="flex-row px-3 py-2 gap-1 bg-white/20 rounded-[35]">
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
                <Text
                    className={`text-accent font-manrope-extrabold max-w-40 ${
                        currentWeatherDescription.length > 16
                            ? 'text-[12px]'
                            : currentWeatherDescription.length > 8
                                ? 'text-[15px]'
                                : 'text-[20px]'
                    }`}
                >{currentWeatherDescription}</Text>
                <View className="flex-row relative w-full h-[90] items-center">
                    {/* Основная температура с минусом */}
                    {currentTemperature < 0 && (
                        <Text className="font-poppins-light text-primary text-[30px] ">
                            {currentTemperature < 0 ? "-" : ""}
                        </Text>
                    )}
                    <Text className="font-poppins-medium text-primary text-[60px] leading-[80px]">
                        {Math.abs(currentTemperature)}
                    </Text>

                    {/* Единица измерения справа */}
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
        <View className="w-[48%] bg-white/20 rounded-[20px] px-3 py-4">
            <View className="absolute top-2 right-3">{item.icon}</View>
            <View className="flex-row items-end">
                <Text className="font-manrope-bold text-accent text-[36px] h-[60]">{item.value}</Text>
                <Text className="text-accent font-manrope-bold text-[15px] mb-1 ml-1">{item.unit}</Text>
            </View>
            <Text className="font-manrope-medium text-white/60 text-[12px]">{t(`weather.${item.labelKey}`)}</Text>
        </View>
    );
};
const WeatherButtons = ({
                            onChatPress
                        }:WeatherButtonsProps) =>(
    <View className="flex-row flex-wrap justify-between mt-6 w-full">
        <TemperatureRange />
        <View className="flex-row justify-center items-center w-[48%]">
            <TouchableOpacity
                onPress={onChatPress}
                className="px-2 py-2 bg-white/20 rounded-[35] w-full justify-center items-center"
            >
                <Text className="font-manrope-semibold text-accent text-[15px] mb-1">
                    {t('buttons.chatWithMe')}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
)
// Компонент деталей погоды
const WeatherDetails = () => {
    const weatherState = useAppSelector(x => x.weather);
    const weatherDetails : WeatherDetailsItem[] = [];


    // apparrent
    weatherDetails.push({
        icon: <FontAwesome6 name="temperature-three-quarters" size={24} color="white" />,
        value: getCurrentTemperatureApparrent(weatherState),
        unit: getCurrentTemperatureUnit(weatherState),
        labelKey: "feelsLike",
    })

    // Wind
    weatherDetails.push({
        icon: <FontAwesome6 name="wind" size={24} color="white" />,
        value: getCurrentWindSpeed(weatherState),
        unit: t(`windUnit.${getCurrentWindUnit(weatherState)}`),
        labelKey: "windSpeed",
    });

    // rain chance
    weatherDetails.push({
        icon: <Ionicons name="rainy-sharp" size={24} color="white" />,
        value: getCurrentRainChance(weatherState, 0),
        unit: "%",
        labelKey: "rainChance"
    });

    // humidity
    weatherDetails.push({
        icon: <MaterialIcons name="water-drop" size={24} color="white" />,
        value: getCurrentHumidity(weatherState),
        unit: "%",
        labelKey: "humidity"
    })

    return <View className="flex-row flex-wrap justify-between mt-6 gap-3">
        {weatherDetails.map((item, index) => (
            <WeatherDetailCard key={index} item={item} />
        ))}
    </View>
};

// Обновленный компонент контента погоды с кнопкой чата рядом с диапазоном температур
const WeatherContent = ({
                            currentAnimation,
                            animationKey,
                            onAnimationPress,
                            onAnimationFinish,
                        }: Omit<WeatherCardProps, 'isNightTime' | 'onChatPress'>) => (
    <View className="flex-col">
        <View className="flex-row justify-between">
            <TemperatureDisplay />
            <View className="flex-col justify-end items-end">
                <View
                    className="rounded-xl overflow-hidden ml-2"
                    style={{ width: 170, height: 120 }}
                >
                    <TouchableOpacity onPress={onAnimationPress} activeOpacity={1}>
                        <LottieView
                            key={animationKey}
                            source={currentAnimation}
                            autoPlay
                            loop={false}
                            style={{ width: '100%', height: '100%' }}
                            onAnimationFinish={onAnimationFinish}
                            colorFilters={LOTTIE_COLOR_FILTERS}
                        />
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    </View>
);

// Основной компонент карточки погоды
const WeatherCard = ({
                         isNightTime,
                         currentAnimation,
                         animationKey,
                         onAnimationPress,
                         onAnimationFinish,
                         onChatPress
                     }: WeatherCardProps) => (
    <View className="w-full mt-6 p-6 relative overflow-hidden rounded-[25]">
        <BlurBackground />
        <View className="w-full z-10">
            <WeatherHeader />
            <WeatherContent
                currentAnimation={currentAnimation}
                animationKey={animationKey}
                onAnimationPress={onAnimationPress}
                onAnimationFinish={onAnimationFinish}
            />
            <WeatherButtons  onChatPress={onChatPress}/>
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
    const [animationState, setAnimationState] = useState<AnimationState>({
        currentIndex: 0,
        repeatCount: 0,
        animationKey: 0,
        clickAnimation: null
    });

    //TODO Брать из Апишки IsDayOrNight
    const isNightTime = weatherState.data!.current.is_day === 0;

    const handleAnimationPress = useCallback(() => {
        setAnimationState(prev => ({
            ...prev,
            clickAnimation: isNightTime ? CLICK_ANIMATIONS.night : CLICK_ANIMATIONS.day,
            animationKey: prev.animationKey + 1
        }));
    }, [isNightTime]);

    const handleAnimationFinish = useCallback(() => {
        setAnimationState(prev => {
            if (prev.clickAnimation) {
                return { ...prev, clickAnimation: null };
            }

            if (isNightTime) {
                return { ...prev, animationKey: prev.animationKey + 1 };
            }

            if (prev.repeatCount < ANIMATIONS[prev.currentIndex].repeats - 1) {
                return {
                    ...prev,
                    repeatCount: prev.repeatCount + 1,
                    animationKey: prev.animationKey + 1
                };
            }

            return {
                ...prev,
                repeatCount: 0,
                currentIndex: (prev.currentIndex + 1) % ANIMATIONS.length,
                animationKey: prev.animationKey + 1
            };
        });
    }, [isNightTime]);

    // Обработчик нажатия на кнопку чата
    const handleChatPress = useCallback(() => {
        navigation.navigate('Chat');
    }, [navigation]);

    const Header = () => (
        <View className="w-full flex-row justify-between items-center mt-10 px-4 pt-10">
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <IconButton icon={<Ionicons name="settings" size={24} color="white"/>}/>
            </TouchableOpacity>
            <LocationTitle/>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <IconButton icon={<FontAwesome name="search" size={24} color="white"/>}/>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenLayout>
            <StatusBar style="light" />


            <View className="absolute z-50">
                <Header />
            </View>

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: 100, // Добавляем отступ сверху равный высоте Header
                }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 justify-center items-center px-4 w-full relative pb-5">
                    <WeatherCard
                        isNightTime={isNightTime}
                        currentAnimation={getCurrentAnimation(animationState, isNightTime)}
                        animationKey={animationState.animationKey}
                        onAnimationPress={handleAnimationPress}
                        onAnimationFinish={handleAnimationFinish}
                        onChatPress={handleChatPress}
                    />
                    <ClockComponent />
                    <NextDaysWeatherWidget />
                    <SunMoonWidget/>
                    <AirCompositionWidget />
                </View>
            </ScrollView>
        </ScreenLayout>
    );
};

// Вспомогательная функция для получения текущей анимации
const getCurrentAnimation = (
    state: AnimationState,
    isNightTime: boolean
) => {
    if (state.clickAnimation) return state.clickAnimation.source;
    if (isNightTime) return NIGHT_ANIMATION.source;
    return ANIMATIONS[state.currentIndex].source;
};