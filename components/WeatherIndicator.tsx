import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Text } from 'react-native-svg';
import { describeRingSector } from "../utils/ringUtils";
import { Ionicons } from '@expo/vector-icons'; // Для иконки дождя
import { MaterialIcons } from '@expo/vector-icons'; // Для иконки воды
import { FontAwesome6 } from '@expo/vector-icons'; // Для иконки ветра

type WeatherIndicatorProps = {
    type: 'windSpeed' | 'rainChance' | 'humidity';
    value: number;
};

// Цвета по шкале Бофорта для windSpeed
const BEAUFORT_COLORS = [
    '#3DDC84', // 0-0.3 m/s (Calm)
    '#8AB4F8', // 0.3-1.5 m/s (Light air)
    '#4285F4', // 1.5-3.3 m/s (Light breeze)
    '#34A853', // 3.3-5.5 m/s (Gentle breeze)
    '#FBBC05', // 5.5-8 m/s (Moderate breeze)
    '#FF9800', // 8-10.8 m/s (Fresh breeze)
    '#F44336', // 10.8-13.9 m/s (Strong breeze)
    '#9C27B0', // 13.9-17.2 m/s (High wind)
    '#673AB7', // 17.2-20.7 m/s (Gale)
    '#3F51B5', // 20.7-24.5 m/s (Strong gale)
    '#2196F3', // 24.5-28.4 m/s (Storm)
    '#F44336', // 28.4-32.6 m/s (Violent storm)
    '#E91E63', // 32.6+ m/s (Hurricane)
];

const WeatherIndicator = ({ type, value }: WeatherIndicatorProps) => {
    // Функция для расчета угла сектора
    const calculateAngle = (val: number, minVal: number, maxVal: number, minAngle: number, maxAngle: number) => {
        const normalized = Math.min(Math.max(val, minVal), maxVal);
        return minAngle + (normalized - minVal) * (maxAngle - minAngle) / (maxVal - minVal);
    };

    // Получение параметров в зависимости от типа
    let startAngle = 55;
    let endAngle = 55;
    let fillColor = 'white';
    let displayValue = Math.round(value);
    let IconComponent = null;

    if (type === 'rainChance' || type === 'humidity') {
        endAngle = calculateAngle(value, 0, 100, 55, 305);
    } else if (type === 'windSpeed') {
        if (value < 6) {
            endAngle = calculateAngle(value, 0, 6, 55, 120);
            fillColor = 'white';
        } else if (value >= 35 && value <= 40) {
            endAngle = calculateAngle(value, 35, 40, 240, 305);
            fillColor = '#FF3A30'; // Красный для сильного ветра
        } else {
            // Определяем цвет по шкале Бофорта
            const beaufortIndex = Math.min(
                Math.floor(value / 3.3), // Упрощенное преобразование в шкалу Бофорта
                BEAUFORT_COLORS.length - 1
            );
            fillColor = BEAUFORT_COLORS[beaufortIndex];
            endAngle = calculateAngle(value, 6, 40, 120, 305);
        }
    }

    // Выбор иконки в зависимости от типа
    if (type === 'rainChance') {
        IconComponent = <Ionicons name="rainy-sharp" size={10} color="white" />;
    } else if (type === 'humidity') {
        IconComponent = <MaterialIcons name="water-drop" size={10} color="white" />;
    } else if (type === 'windSpeed') {
        IconComponent = <FontAwesome6 name="wind" size={10} color="white" />;
    }

    return (
        <View>
            <Svg width={35} height={35}>
                {/* Фоновый сектор */}
                <Path
                    d={describeRingSector(17, 17, 17, 12, 55, 305, 180, true)}
                    fill="#004b5870"
                    fillOpacity={0.3}
                />

                {/* Активный сектор */}
                <Path
                    d={describeRingSector(17, 17, 17, 12, startAngle, endAngle, 180, true)}
                    fill={fillColor}
                />

                {/* Текст с значением */}
                <Text
                    x={17}
                    y={20}
                    fill="white"
                    fontSize={12}
                    fontFamily="Poppins-SemiBold"
                    textAnchor="middle"
                >
                    {displayValue}
                </Text>
            </Svg>

            {/* Иконка */}
            <View style={{ position: 'absolute', top:24, left: 12 }}>
                {IconComponent}
            </View>
        </View>
    );
};

export default WeatherIndicator;
