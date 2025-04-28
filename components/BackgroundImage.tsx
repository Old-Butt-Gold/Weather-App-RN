import React, { useEffect, useRef } from 'react';
import { View, Image, StyleProp, ImageStyle, ViewStyle, Animated, Easing, StyleSheet } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { getCurrentLocalDateFromWeatherState, getWeatherCodeForHour } from '../store/utils/weatherUtils';
import bgImages from "../utils/bgConverter";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient'; // Если ты на Expo

type BackgroundImageProps = {
    blurRadius?: number;
    overlayColor?: string;
    imageStyle?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    isPage: boolean;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    weatherCodeOverride?: number;
    hourOverride?: number;
};

const BackgroundImage: React.FC<BackgroundImageProps> = ({
                                                             blurRadius = 6,
                                                             overlayColor = 'rgba(0, 0, 0, 0.1)',
                                                             imageStyle,
                                                             containerStyle,
                                                             isPage,
                                                             resizeMode = 'cover',
                                                             weatherCodeOverride,
                                                             hourOverride,
                                                         }) => {
    const weatherState = useAppSelector(x => x.weather);
    const defaultWeatherCode = getWeatherCodeForHour(weatherState, 0);
    const defaultLocalNowDate = getCurrentLocalDateFromWeatherState(weatherState);
    const currentScreenName = useRoute().name;

    const currentHour = hourOverride ?? defaultLocalNowDate.getUTCHours();
    const weatherCode = weatherCodeOverride ?? defaultWeatherCode;

    let timeOfDay: 'sunrise' | 'day' | 'sunset' | 'night' = 'day';
    if (hourOverride !== undefined) {
        if (currentHour >= 6 && currentHour < 8) {
            timeOfDay = 'sunrise';
        } else if (currentHour >= 8 && currentHour < 19) {
            timeOfDay = 'day';
        } else if (currentHour >= 19 && currentHour < 21) {
            timeOfDay = 'sunset';
        } else {
            timeOfDay = 'night';
        }
    } else {
        const sunset = new Date(weatherState.data!.daily.sunset[1]).getHours();
        const sunrise = new Date(weatherState.data!.daily.sunrise[1]).getHours();

        if (currentHour >= sunrise && currentHour < sunrise + 2) {
            timeOfDay = 'sunrise';
        } else if (currentHour >= sunrise + 2 && currentHour < sunset - 2) {
            timeOfDay = 'day';
        } else if (currentHour >= sunset - 2 && currentHour < sunset) {
            timeOfDay = 'sunset';
        } else {
            timeOfDay = 'night';
        }
    }

    const gradientColors: { [key in typeof timeOfDay]: [string, string, string] } = {
        sunrise: ['#8ab1e8', '#d4b4a5', '#f0cfc0'],
        day: ['#1a80d5', '#4d94e6', '#6ca6e5'],
        sunset: ['#5b9ae7', '#fca46d', '#fcb16d'],
        night: ['#041a63', '#1d3f85', '#3772b4'],
    };

    const source = bgImages[weatherCode]?.[timeOfDay] ?? require('../assets/1_day.png');

    // Анимация пульсации
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.18,
                    duration: 4000,
                    useNativeDriver: false,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, containerStyle]}>
            {(currentScreenName === 'Search' || currentScreenName === 'Settings') && isPage ? (
                <>
                    <LinearGradient
                        colors={gradientColors[timeOfDay]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{ flex: 1, width: '100%', height: '100%' }}
                    />
                    <Animated.View style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: '#b5d0f2',
                        opacity: pulseAnim,
                    }} />
                </>
            ) : (
                <Image
                    source={source}
                    style={[{ flex: 1, width: '100%', height: '100%' }, imageStyle]}
                    blurRadius={blurRadius}
                    resizeMode={resizeMode}
                />
            )}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: overlayColor,
                }}
            />
        </View>
    );
};

export default BackgroundImage;
