import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { ClockComponent } from '../components/ClockComponent';
import { Ionicons, FontAwesome, Entypo, AntDesign, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {NextDaysWeatherWidget} from "../components/nextDaysWeatherWidget";

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

// Данные о погоде
const WEATHER_DETAILS = [
    {
        icon: <FontAwesome6 name="temperature-three-quarters" size={24} color="white" />,
        value: "12",
        unit: "°C",
        labelKey: "feelsLike"
    },
    {
        icon: <FontAwesome6 name="wind" size={24} color="white" />,
        value: "5",
        unit: "м/c",
        labelKey: "windSpeed"
    },
    {
        icon: <Ionicons name="rainy-sharp" size={24} color="white" />,
        value: "68",
        unit: "%",
        labelKey: "rainChance"
    },
    {
        icon: <MaterialIcons name="water-drop" size={24} color="white" />,
        value: "4",
        unit: "%",
        labelKey: "humidity"
    }
];
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
    <View className="absolute h-full w-full">
        <Image
            blurRadius={6}
            source={require("../assets/bg.png")}
            className="h-full w-full"
        />
        <View className="absolute h-full w-full bg-black/5" />
    </View>
);

// Компонент кнопки с иконкой
const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <View className="p-3 rounded-[15] bg-white/20">{icon}</View>
);

// Компонент заголовка местоположения
const LocationTitle = () => {
    const { t } = useTranslation();
    return (
        <View className="flex-col items-center">
            <Text className="font-manrope-extrabold text-2xl text-accent">{t('city')}</Text>
            <View className="w-20 h-2 bg-white/20 rounded-2xl"></View>
        </View>
    );
};

// Компонент шапки
const Header = () => (
    <View className="w-full flex-row justify-between items-center mt-4 px-4 pt-10">
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
            borderRadius: 35,
            overflow: 'hidden',
            zIndex: 0,
        }}
    />
);

// Компонент заголовка погоды
const WeatherHeader = () => {
    const { t } = useTranslation();
    const date = new Date();

    return (
        <View className="flex-row justify-between items-start">
            <View className="flex-row items-center gap-1">
                <Entypo name="calendar" size={20} color="white" />
                <Text className="text-primary font-manrope-semibold text-[14px]">
                    {t('date.weekdayShort')} {date.getDate()} {t('date.monthShort')} {date.getFullYear()}
                </Text>
            </View>
            <TouchableOpacity className="p-2 rounded-[15] bg-white/20">
                <Ionicons name="reload-circle-sharp" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

// Компонент диапазона температур
const TemperatureRange = () => (
    <View className="flex-row justify-center mt-2">
        <View className="flex-row px-4 py-2 gap-3 bg-white/20 rounded-[35]">
            <View className="flex-row items-center">
                <AntDesign name="arrowup" size={18} color="white" />
                <Text className="font-poppins-medium text-accent text-[13px] ml-1">25&deg;</Text>
            </View>
            <View className="flex-row items-center">
                <AntDesign name="arrowdown" size={18} color="white" />
                <Text className="font-poppins-medium text-accent text-[13px] ml-1">9&deg;</Text>
            </View>
        </View>
    </View>
);

const TemperatureDisplay = () => {
    const { t } = useTranslation();

    return (
        <View className="flex-row items-start">
            <View className="flex-col flex border-accent">
                <Text className="text-accent text-[20px] font-manrope-extrabold">{t('weather.rainy')}</Text>
                <Text className="font-poppins-medium text-primary text-[90px] h-[90] leading-[100px]">25</Text>
                <TemperatureRange />
            </View>
            <Text className="text-primary font-poppins-bold text-[25px] mt-8">&deg;C</Text>
        </View>
    );
};
// Компонент карточки деталей погоды
const WeatherDetailCard = ({ item }: { item: typeof WEATHER_DETAILS[0] }) => {
    const { t } = useTranslation();

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
const WeatherDetails = () => (
    <View className="flex-row flex-wrap justify-between mt-6 gap-3">
        {WEATHER_DETAILS.map((item, index) => (
            <WeatherDetailCard key={index} item={item} />
        ))}
    </View>
);

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
    <LinearGradient
        colors={['rgba(90, 139, 171, 0.2)', 'rgb(18,144,216)']}
        className="w-full mt-6 p-6 relative overflow-hidden rounded-[35]"
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 1.0, y: 1.0 }}
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
    </LinearGradient>
);

// Главный компонент экрана
export const HomeScreen = () => {
    const [animationState, setAnimationState] = useState<AnimationState>({
        currentIndex: 0,
        repeatCount: 0,
        animationKey: 0,
        clickAnimation: null
    });
    const { t } = useTranslation();
    const [currentTime] = useState(new Date());
    const isNightTime = currentTime.getHours() >= 0 && currentTime.getHours() < 6;

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

            {/* Фиксированный Header */}
            <View className="absolute top-0 left-0 right-0 z-50">
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
                    {/* Убираем Header отсюда, так как он теперь фиксированный */}
                    <WeatherCard
                        isNightTime={isNightTime}
                        currentAnimation={getCurrentAnimation(animationState, isNightTime)}
                        animationKey={animationState.animationKey}
                        onAnimationPress={handleAnimationPress}
                        onAnimationFinish={handleAnimationFinish}
                    />
                    <ClockComponent />
                    <NextDaysWeatherWidget />
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