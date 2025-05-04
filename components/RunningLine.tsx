import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Easing } from 'react-native';
import {useRoute} from "@react-navigation/native";

type RunningLineProps = {
    title: string | null;
    maxWidth?: number;
    scrollThreshold?: number;
    textClassName?: string; // Новый пропс для классов текста
};

export const RunningLine = ({
                                  title,
                                  maxWidth = 150,
                                  scrollThreshold = 10,
                                  textClassName = "text-2xl font-extrabold text-white"
                              }: RunningLineProps) => {
    const [shouldScroll, setShouldScroll] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const textWidth = useRef(0);
    const currentScreenName = useRoute().name;

    useEffect(() => {
        if (title && title.length >= scrollThreshold) {
            setShouldScroll(true);
        } else {
            setShouldScroll(false);
            animatedValue.stopAnimation();
            animatedValue.setValue(0);
        }
    }, [title, scrollThreshold]);

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
        return animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [maxWidth, -textWidth.current],
        });
    };

    if (title === null) {
        return null;
    }

    return (
        <View
            className="items-center overflow-hidden"
            style={{
                maxWidth,
            }}
        >
            {shouldScroll ? (
                <Animated.View
                    style={{
                        transform: [{ translateX: getTranslateX() }],
                        flexDirection: 'row',
                    }}
                    onLayout={(event) => {
                        textWidth.current = event.nativeEvent.layout.width;
                        if (shouldScroll) startAnimation();
                    }}
                >
                    <Text
                        className={textClassName} // Применяем переданные классы
                        numberOfLines={1}
                        adjustsFontSizeToFit={false}
                        style={{
                            minWidth: 400,
                        }}
                    >
                        {title}
                    </Text>
                </Animated.View>
            ) : (
                <Text
                    className={`${textClassName} text-center self-start`} // Добавляем дополнительные классы
                >
                    {title}
                </Text>
            )}
            {(currentScreenName === "Home") &&
                ( <View className="w-20 h-2 bg-white/70 rounded-full opacity-15" />)
            }
        </View>
    );
};