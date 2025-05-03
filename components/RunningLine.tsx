import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, Easing } from 'react-native';
import {useRoute} from "@react-navigation/native";

type LocationTitleProps = {
    title: string | null;
    maxWidth?: number;
    scrollThreshold?: number;
};

export const LocationTitle = ({
                                  title,
                                  maxWidth = 150,
                                  scrollThreshold = 10
                              }: LocationTitleProps) => {
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
                        className="text-2xl font-extrabold text-white"
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
                    className="text-2xl font-extrabold text-white text-center self-start"
                >
                    {title}
                </Text>
            )}
            {(currentScreenName === "Home") &&
                ( <View className="w-20 h-2 bg-[#004b5870] rounded-full opacity-15" />)
            }

        </View>
    );
};