import React, { useState, useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAppSelector } from "../store/hooks";

// Типы погоды и соответствующие им группы анимаций
//type WeatherType = 'clear' | 'partly_cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
type WeatherType = 'clear' | 'partly_cloudy';
interface WeatherAnimationGroup {
    idle: Array<{ source: any; repeats: number }>;
    click: {
        day: { source: any; repeats: number };
        night: { source: any; repeats: number };
    };
    night: { source: any; repeats: number };
}

// Полная карта анимаций для всех типов погоды
const WEATHER_ANIMATIONS: Record<WeatherType, WeatherAnimationGroup> = {
    partly_cloudy: {
        idle: [
            { source: require("../assets/svg-icons/animations/cloudSpeaks.json"), repeats: 3 },
            { source: require("../assets/svg-icons/animations/cloudyStatic.json"), repeats: 2 },
            { source: require("../assets/svg-icons/animations/cloudSpeaks.json"), repeats: 1 },
            { source: require("../assets/svg-icons/animations/cloudyStart.json"), repeats: 1 },
            { source: require("../assets/svg-icons/animations/welcomeCloudy.json"), repeats: 1 }
        ],
        click: {
            day: { source: require("../assets/svg-icons/animations/welcomeCloudy.json"), repeats: 1 },
             night: { source: require("../assets/svg-icons/animations/angryCloud.json"), repeats: 1 }
        },
        night: { source: require("../assets/svg-icons/animations/sleepingCloudNew.json"), repeats: 1 }
    },
    clear: {
        idle: [
            { source: require("../assets/svg-icons/animations/sunny/staticSun.json"), repeats: 3 },
            { source: require("../assets/svg-icons/animations/sunny/activeSun.json"), repeats: 1 },
            { source: require("../assets/svg-icons/animations/sunny/staticSun.json"), repeats: 1 },
            { source: require("../assets/svg-icons/animations/sunny/activeSun.json"), repeats: 1 },
        ],
        click: {
            day: { source: require("../assets/svg-icons/animations/sunny/TouchSun.json"), repeats: 1 },
            night: { source: require("../assets/svg-icons/animations/sunny/TouchSun.json"), repeats: 1 }
        },
        night: { source: require("../assets/svg-icons/animations/sunny/TouchSun.json"), repeats: 1 }
    },
    // partly_cloudy: {
    //     idle: [
    //         { source: require('../assets/svg-icons/animations/cloudSpeaks.json'), repeats: 3 },
    //         { source: require('../assets/svg-icons/animations/cloudyStatic.json'), repeats: 2 },
    //         { source: require('../assets/svg-icons/animations/cloudyStart.json'), repeats: 1 }
    //     ],
    //     click: {
    //         day: { source: require('../assets/svg-icons/animations/welcomeCloudy.json'), repeats: 1 },
    //         night: { source: require('../assets/svg-icons/animations/angryCloud.json'), repeats: 1 }
    //     },
    //     night: { source: require('../assets/svg-icons/animations/partlyCloudyNight.json'), repeats: 1 }
    // },
    // fog: {
    //     idle: [
    //         { source: require('../assets/svg-icons/animations/fogAnimation.json'), repeats: 3 }
    //     ],
    //     click: {
    //         day: { source: require('../assets/svg-icons/animations/fogClick.json'), repeats: 1 },
    //         night: { source: require('../assets/svg-icons/animations/fogNightClick.json'), repeats: 1 }
    //     },
    //     night: { source: require('../assets/svg-icons/animations/fogNight.json'), repeats: 1 }
    // },
    // drizzle: {
    //     idle: [
    //         { source: require('../assets/svg-icons/animations/drizzleAnimation.json'), repeats: 2 }
    //     ],
    //     click: {
    //         day: { source: require('../assets/svg-icons/animations/drizzleClick.json'), repeats: 1 },
    //         night: { source: require('../assets/svg-icons/animations/drizzleNightClick.json'), repeats: 1 }
    //     },
    //     night: { source: require('../assets/svg-icons/animations/drizzleNight.json'), repeats: 1 }
    // },
    // rain: {
    //     idle: [
    //         { source: require('../assets/svg-icons/animations/rainAnimation.json'), repeats: 2 },
    //         { source: require('../assets/svg-icons/animations/rainHeavy.json'), repeats: 1 }
    //     ],
    //     click: {
    //         day: { source: require('../assets/svg-icons/animations/rainClick.json'), repeats: 1 },
    //         night: { source: require('../assets/svg-icons/animations/rainNightClick.json'), repeats: 1 }
    //     },
    //     night: { source: require('../assets/svg-icons/animations/rainNight.json'), repeats: 1 }
    // },
    // snow: {
    //     idle: [
    //         { source: require('../assets/svg-icons/animations/snowAnimation.json'), repeats: 3 }
    //     ],
    //     click: {
    //         day: { source: require('../assets/svg-icons/animations/snowClick.json'), repeats: 1 },
    //         night: { source: require('../assets/svg-icons/animations/snowNightClick.json'), repeats: 1 }
    //     },
    //     night: { source: require('../assets/svg-icons/animations/snowNight.json'), repeats: 1 }
    // },
    // thunderstorm: {
    //     idle: [
    //         { source: require('../assets/svg-icons/animations/thunderstormAnimation.json'), repeats: 2 }
    //     ],
    //     click: {
    //         day: { source: require('../assets/svg-icons/animations/thunderstormClick.json'), repeats: 1 },
    //         night: { source: require('../assets/svg-icons/animations/thunderstormNightClick.json'), repeats: 1 }
    //     },
    //     night: { source: require('../assets/svg-icons/animations/thunderstormNight.json'), repeats: 1 }
    // }
};

// Фильтры цветов для Lottie
const LOTTIE_COLOR_FILTERS = [
    { keypath: 'mouth', color: '#2B3F56' },
    { keypath: 'eye_r', color: '#2B3F56' },
    { keypath: 'eye_l', color: '#2B3F56' },
    { keypath: 'hand', color: '#FFFFFF' },
    { keypath: 'hand Container', color: '#FFFFFF' },
    { keypath: 'cloud', color: '#FFFFFF' },
];

type AnimationState = {
    currentIndex: number;
    repeatCount: number;
    animationKey: number;
    clickAnimation: { source: any; repeats: number } | null;
};

type AnimatedWeatherCloudProps = {
    isNightTime: boolean;
};

// Функция для определения типа погоды по коду
const getWeatherType = (weatherCode: number): WeatherType => {
    if (weatherCode === 0 || weatherCode === 1) return 'clear';
    // if (weatherCode >= 2 && weatherCode <= 3) return 'partly_cloudy';
    // if (weatherCode === 45 || weatherCode === 48) return 'fog';
    // if (weatherCode >= 51 && weatherCode <= 57) return 'drizzle';
    // if (weatherCode >= 61 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 86) return 'rain';
    // if (weatherCode >= 71 && weatherCode <= 77) return 'snow';
    // if (weatherCode >= 95 && weatherCode <= 99) return 'thunderstorm';
    return 'clear'; // fallback
};

export const AnimatedWeatherCloud: React.FC<AnimatedWeatherCloudProps> = ({
                                                                              isNightTime,
                                                                          }) => {
    const weatherState = useAppSelector(x => x.weather);
    const weatherCode = weatherState.data?.current.weather_code ?? 0;

    // Определяем тип погоды
    const weatherType = getWeatherType(weatherCode);
    // Получаем группу анимаций для текущего типа погоды
    const currentAnimations = WEATHER_ANIMATIONS[weatherType];

    const [animationState, setAnimationState] = useState<AnimationState>({
        currentIndex: 0,
        repeatCount: 0,
        animationKey: 0,
        clickAnimation: null,
    });

    const handleAnimationPress = useCallback(() => {
        setAnimationState((prev) => ({
            ...prev,
            clickAnimation: isNightTime
                ? currentAnimations.click.night
                : currentAnimations.click.day,
            animationKey: prev.animationKey + 1,
        }));
    }, [isNightTime, currentAnimations]);

    const handleAnimationFinish = useCallback(() => {
        setAnimationState((prev) => {
            if (prev.clickAnimation) {
                return { ...prev, clickAnimation: null };
            }
            if (isNightTime) {
                return { ...prev, animationKey: prev.animationKey + 1 };
            }
            if (prev.repeatCount < currentAnimations.idle[prev.currentIndex].repeats - 1) {
                return {
                    ...prev,
                    repeatCount: prev.repeatCount + 1,
                    animationKey: prev.animationKey + 1,
                };
            }
            return {
                ...prev,
                repeatCount: 0,
                currentIndex: (prev.currentIndex + 1) % currentAnimations.idle.length,
                animationKey: prev.animationKey + 1,
            };
        });
    }, [isNightTime, currentAnimations]);

    const currentAnimation = useMemo(() => {
        if (animationState.clickAnimation) return animationState.clickAnimation.source;
        if (isNightTime) return currentAnimations.night.source;
        return currentAnimations.idle[animationState.currentIndex].source;
    }, [animationState, isNightTime, currentAnimations]);

    return (
        <TouchableOpacity onPress={handleAnimationPress} activeOpacity={1}>
            <LottieView
                key={animationState.animationKey}
                source={currentAnimation}
                autoPlay
                loop={false}
                style={{ width: '100%', height: '100%' }}
                onAnimationFinish={handleAnimationFinish}
                colorFilters={LOTTIE_COLOR_FILTERS}
            />
        </TouchableOpacity>
    );
};