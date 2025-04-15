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
import {useAppSelector} from "../store/hooks";
import {
    getCurrentHumidity,
    getCurrentRainChance,
    getCurrentTemperature,
    getCurrentTemperatureApparrent,
    getCurrentTemperatureUnit, getCurrentWindSpeed, getCurrentWindUnit,
    getWeatherCodeForHour
} from "../store/utils/weatherUtils";

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
};

// Компонент фонового изображения
const BackgroundImage = () => (
    <View className="absolute top-0 left-0 right-0 bottom-0">
        <Image
            source={require("../assets/bg.png")}
            style={{ flex: 1, width: '100%', height: '100%' }}
            blurRadius={6}
            resizeMode="cover"
        />
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/10" />
    </View>
);

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
const Header = () => (
    <View className="w-full flex-row justify-between items-center mt-10 px-4 pt-10">
        <IconButton icon={<Ionicons name="settings" size={24} color="white" />} />
        <LocationTitle />
        <IconButton icon={<FontAwesome name="search" size={24} color="white" />} />
    </View>
);

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

    return (
        <View className="flex-row justify-between items-start">
            <View className="flex-row items-center gap-2">
                <Entypo name="calendar" size={20} color="white" />
                <Text className="text-primary font-manrope-semibold text-[14px]">
                    {weekdayShort} {date.getDate()} {monthShort} {date.getFullYear()}
                </Text>
            </View>
            <TouchableOpacity className="p-2 rounded-[15] bg-white/20">
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

    return (<View className="flex-row justify-center mt-2">
        <View className="flex-row px-4 py-2 gap-3 bg-white/20 rounded-[35]">
            <View className="flex-row items-center">
                <AntDesign name="arrowup" size={18} color="white"/>
                <Text className="font-poppins-medium text-accent text-[13px] ml-1">{max}{unit}</Text>
            </View>
            <View className="flex-row items-center">
                <AntDesign name="arrowdown" size={18} color="white"/>
                <Text className="font-poppins-medium text-accent text-[13px] ml-1">{min}{unit}</Text>
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
            <View className="flex-col flex border-accent">
                <Text className="text-accent text-[20px] font-manrope-extrabold">{currentWeatherDescription}</Text>
                <Text className="font-poppins-medium text-primary text-[90px] h-[90] leading-[100px]">{currentTemperature}</Text>
                <TemperatureRange />
            </View>
            <Text className="text-primary font-poppins-bold text-[25px] mt-8">{currentTemperatureUnit}</Text>
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

// Компонент контента погоды
const WeatherContent = ({
                            currentAnimation,
                            animationKey,
                            onAnimationPress,
                            onAnimationFinish
                        }: Omit<WeatherCardProps, 'isNightTime'>) => (
    <View className="flex-row justify-between mt-4">
        <TemperatureDisplay />
        <TouchableOpacity onPress={onAnimationPress} activeOpacity={1}>
            <LottieView
                key={animationKey}
                source={currentAnimation}
                autoPlay
                loop={false}
                style={{ width: 170, height: 170 }}
                onAnimationFinish={onAnimationFinish}
                colorFilters={LOTTIE_COLOR_FILTERS}
            />
        </TouchableOpacity>
    </View>
);

// Основной компонент карточки погоды
const WeatherCard = ({
                         isNightTime,
                         currentAnimation,
                         animationKey,
                         onAnimationPress,
                         onAnimationFinish
}: WeatherCardProps) => (
    <View
        className="w-full mt-6 p-6 relative overflow-hidden rounded-[25]"
    >
        <BlurBackground />
        <View className="w-full z-10">
            <WeatherHeader />
            <WeatherContent
                currentAnimation={currentAnimation}
                animationKey={animationKey}
                onAnimationPress={onAnimationPress}
                onAnimationFinish={onAnimationFinish}
            />
            <WeatherDetails />
        </View>
    </View>
);

export const HomeScreen = () => {
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


    return (
        <>
            <StatusBar style="light" />
            <BackgroundImage />

            <View className="absolute top-0 left-0 right-0 z-50">
                <Header />
            </View>

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: 80, // Добавляем отступ сверху равный высоте Header
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
                    />
                    <ClockComponent />
                    <NextDaysWeatherWidget />
                    <SunMoonWidget/>
                    <AirCompositionWidget />
                </View>
            </ScrollView>
        </>
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