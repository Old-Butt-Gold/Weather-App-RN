import React, { useState, useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAppSelector } from "../store/hooks";

// Типы погоды и соответствующие им группы анимаций
type WeatherType = 'clear' | 'partly_cloudy' | 'rain' | 'drizzle' | 'snow';
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
            night: { source: require("../assets/svg-icons/animations/moon/FallingStar.json"), repeats: 1 }
        },
        night: { source: require("../assets/svg-icons/animations/moon/Moon.json"), repeats: 1 }
    },
    drizzle: {
        idle: [
            { source: require('../assets/svg-icons/animations/coldy/Coldy.json'), repeats: 1 }
        ],
        click: {
            day: { source: require("../assets/svg-icons/animations/coldy/WindDrizzleClick.json"), repeats: 1 },
            night: { source: require("../assets/svg-icons/animations/coldy/ClickWindSleeping.json"), repeats: 1 }
        },
        night: { source: require("../assets/svg-icons/animations/coldy/SleepingDrizzle.json"), repeats: 1 }
    },
    rain: {
        idle: [
            { source: require('../assets/svg-icons/animations/rain_sunny/Rain.json'), repeats: 1 },
        ],
        click: {
            day: { source: require("../assets/svg-icons/animations/rain_sunny/RainClick.json"), repeats: 1 },
            night: { source: require("../assets/svg-icons/animations/rain_night/RainSleepClickNight.json"), repeats: 1 }
        },
        night: { source: require("../assets/svg-icons/animations/rain_night/SleepRain.json"), repeats: 1 }
    },
    snow: {
        idle: [
            { source: require('../assets/svg-icons/animations/snow/SnowDay.json'), repeats: 1 }
        ],
        click: {
            day: { source: require("../assets/svg-icons/animations/snow/SnowClickDay.json"), repeats: 1 },
            night: { source: require("../assets/svg-icons/animations/snow/SleepSnow.json"), repeats: 1 }
        },
        night: { source: require("../assets/svg-icons/animations/snow/NightSnow.json"), repeats: 1 }
    },

};

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

const getWeatherType = (weatherCode: number): WeatherType => {
    if (weatherCode === 0 || weatherCode === 1) return 'clear';
    if ((weatherCode >= 2 && weatherCode <= 3) || weatherCode === 45) return 'partly_cloudy';
    if (weatherCode >= 51 && weatherCode <= 57) return 'drizzle';
     if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 86) || (weatherCode >= 95 && weatherCode <= 99)) return 'rain';
    if (weatherCode >= 71 && weatherCode <= 77) return 'snow';
    return 'clear'; // fallback
};

export const AnimatedWeatherCloud: React.FC<AnimatedWeatherCloudProps> = ({
                                                                              isNightTime,
                                                                          }) => {
    const weatherState = useAppSelector(x => x.weather);
    const weatherCode = weatherState.data?.current.weather_code ?? 0;

    const weatherType = getWeatherType(weatherCode);
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