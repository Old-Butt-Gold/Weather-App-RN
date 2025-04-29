import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Easing, Dimensions } from 'react-native';
import { useAppSelector } from '../store/hooks';

const SCREEN_WIDTH = Dimensions.get('window').width;

type LocationTitleProps = {
    maxWidth?: number; // Добавлен проп для максимальной ширины
};

export const LocationTitle = ({ maxWidth = 100 }: LocationTitleProps) => {
    const weatherCity = useAppSelector(state => state.weather.currentCity);
    const [shouldScroll, setShouldScroll] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const textWidth = useRef(0);

    useEffect(() => {
        if (weatherCity && weatherCity.length >= 10) {
            setShouldScroll(true);
        } else {
            setShouldScroll(false);
            animatedValue.stopAnimation();
            animatedValue.setValue(0);
        }
    }, [weatherCity]);

    useEffect(() => {
        if (shouldScroll && textWidth.current > 0) {
            startAnimation();
        }
    }, [shouldScroll]);

    const startAnimation = () => {
        animatedValue.setValue(0);
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 8000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const getTranslateX = () => {
        const distance = textWidth.current + maxWidth; // весь путь прокрутки
        return animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -distance],
        });
    };

    return (
        <View className="items-center" style={{ maxWidth }}>
            {shouldScroll ? (
                <View
                    className="overflow-hidden h-[30px] justify-center"
                    style={{ maxWidth }}
                >
                    <Animated.Text
                        onLayout={(e) => {
                            textWidth.current = e.nativeEvent.layout.width;
                        }}
                        style={{
                            transform: [{ translateX: getTranslateX() }],
                        }}
                        className="text-2xl font-extrabold text-[#00A3AD]"
                    >
                        {weatherCity}
                    </Animated.Text>
                </View>
            ) : (
                <Text
                    className="text-2xl font-extrabold text-[#00A3AD]"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ maxWidth }}
                >
                    {weatherCity}
                </Text>
            )}
            <View className="w-20 h-2 bg-[#004b5870] rounded-full opacity-15" />
        </View>
    );
};
