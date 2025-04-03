import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Text as SvgText, Line } from 'react-native-svg';

export const ClockComponent = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Углы для стрелок (24-часовой формат)
    const hourAngle = hours * 15 + minutes * 0.25; // 360° / 24 = 15° на час
    const minuteAngle = minutes * 6; // 360° / 60 = 6° на минуту
    const secondAngle = seconds * 6; // 360° / 60 = 6° на секунду

    // Метки для 24-часового циферблата
    const hourMarks = Array.from({ length: 24 }, (_, i) => i);

    return (
        <View className="mt-10 mb-20 items-center">
            <Svg height="400" width="400" viewBox="0 0 100 100">
                {/* Внешний круг */}
                <Circle cx="50" cy="50" r="45" fill="#5A8BAB" stroke="#2B3F56" strokeWidth="0.5" />

                {/* Центр часов */}
                <Circle cx="50" cy="50" r="2" fill="#2B3F56" />

                {/* Метки часов (24 деления) */}
                {hourMarks.map((hour) => {
                    const angle = hour * 15; // 360° / 24 = 15°
                    const rad = (angle * Math.PI) / 180;
                    const x = 50 + 40 * Math.sin(rad);
                    const y = 50 - 40 * Math.cos(rad);

                    // Для лучшей читаемости размещаем цифры только на основных позициях
                    if (hour % 2 === 0) {
                        return (
                            <React.Fragment key={hour}>
                                {/* Длинные метки для четных часов */}
                                <Line
                                    x1={50 + 35 * Math.sin(rad)}
                                    y1={50 - 35 * Math.cos(rad)}
                                    x2={50 + 40 * Math.sin(rad)}
                                    y2={50 - 40 * Math.cos(rad)}
                                    stroke="#FFFFFF"
                                    strokeWidth="0.5"
                                />
                                {/* Цифры */}
                                <SvgText
                                    x={50 + 30 * Math.sin(rad)}
                                    y={50 - 30 * Math.cos(rad)}
                                    textAnchor="middle"
                                    fill="#FFFFFF"
                                    fontSize="4"
                                >
                                    {hour === 0 ? 24 : hour}
                                </SvgText>
                            </React.Fragment>
                        );
                    } else {
                        // Короткие метки для нечетных часов
                        return (
                            <Line
                                key={hour}
                                x1={50 + 38 * Math.sin(rad)}
                                y1={50 - 38 * Math.cos(rad)}
                                x2={50 + 40 * Math.sin(rad)}
                                y2={50 - 40 * Math.cos(rad)}
                                stroke="#FFFFFF"
                                strokeWidth="0.3"
                            />
                        );
                    }
                })}

                {/* Стрелка часов (24-часовая) */}
                <Line
                    x1="50" y1="50"
                    x2="50" y2="25"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    transform={`rotate(${hourAngle}, 50, 50)`}
                />

                {/* Стрелка минут */}

            </Svg>

            {/* Индикаторы (оставляем как было) */}
            <View className="flex-row mt-4">
                <Text className="text-white mx-2">30 TIM</Text>
                <Text className="text-white mx-2">30 SEX</Text>
                <Text className="text-white mx-2">1 31 PPM</Text>
            </View>
            <View className="flex-row mt-2">
                <Text className="text-white mx-2">90 SAM</Text>
                <Text className="text-white mx-2">90 MESS</Text>
                <Text className="text-white mx-2">20</Text>
            </View>
            <View className="flex-row mt-4">
                <Text className="text-white mx-2">RAN 2M</Text>
                <Text className="text-white mx-2">00 00</Text>
                <Text className="text-white mx-2">0</Text>
            </View>
        </View>
    );
};