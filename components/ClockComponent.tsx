import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, Text as SvgText, Line } from 'react-native-svg';
import { BlurView } from "expo-blur";
import {LinearGradient} from "expo-linear-gradient";

export const ClockComponent = () => {
    const [time, setTime] = useState(new Date());
    const screenWidth = Dimensions.get('window').width;
    const svgSize = screenWidth;

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hourMarks = Array.from({ length: 24 }, (_, i) => i);

    // 🔥 Температура на каждый час (примерные данные)
    const temperatures = [
        -2, -1, 0, 0, 1, 3, 6, 10, 14, 17, 20, 22,
        24, 25, 24, 22, 19, 15, 12, 9, 6, 4, 2, 0
    ];

    return (
        <LinearGradient
            start={{ x: 0.5, y: 0.4 }} // Центр градиента
            end={{ x: 1.0, y: 1.0 }} // Расширение градиента (создает радиальный эффект)
            colors={[
            'rgba(90, 139, 171, 0.2)', // #7FC3AE с прозрачностью 70%
             '   rgb(18,144,216)', // #7FC3AE с прозрачностью 30%
            ]}
            className="mt-8 items-center relative overflow-hidden rounded-[35] w-full" style={{ height: svgSize }}>
            <BlurView
                intensity={44}
                tint="light"
                className="absolute w-full h-full z-0 overflow-hidden rounded-[35]"
            />
            <View className="absolute w-full h-full bg-[rgba(90,139,171,0.1)] rounded-[35]" />
            <Svg
                width={svgSize}
                height={svgSize}
                viewBox="0 0 100 100"
            >
                <Circle cx="50" cy="50" r="1" fill="#FFFFFF" />

                {hourMarks.map((hour) => {
                    const angle = hour * 15;
                    const rad = (angle * Math.PI) / 180;

                    const textRadius = 35;
                    const tempRadius = 42;
                    const markStartRadius = 20;
                    const markEndRadius = 24;

                    const displayHour = hour === 0 ? 24 : hour;

                    return (
                        <React.Fragment key={hour}>
                            {/* Метка */}
                            <Line
                                x1={50 + markStartRadius * Math.sin(rad)}
                                y1={50 - markStartRadius * Math.cos(rad)}
                                x2={50 + markEndRadius * Math.sin(rad)}
                                y2={50 - markEndRadius * Math.cos(rad)}
                                stroke="#FFFFFF"
                                strokeWidth={hour % 2 === 0 ? "1" : "0.4"}
                                strokeLinecap="round"
                                strokeOpacity={0.8}
                            />
                            {/* Время */}
                            <SvgText
                                x={50 + textRadius * Math.sin(rad)}
                                y={50 - textRadius * Math.cos(rad)}
                                textAnchor="middle"
                                fill="#FFFFFF"
                                fillOpacity={0.8}
                                fontSize="2.5"
                                fontFamily="Poppins-Medium"
                            >
                                {`${displayHour}:00`}
                            </SvgText>
                            {/* Температура */}
                            <SvgText
                                x={50 + tempRadius * Math.sin(rad)}
                                y={50 - tempRadius * Math.cos(rad)}
                                textAnchor="middle"
                                fill="#FFFFFF"
                                fillOpacity={1}
                                fontSize="3"
                                fontFamily="Poppins-SemiBold"
                            >
                                {`${temperatures[hour]}°`}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        </LinearGradient>
    );
};
