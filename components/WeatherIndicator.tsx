import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Text } from 'react-native-svg';
import { describeRingSector } from "../utils/ringUtils";
import { Ionicons } from '@expo/vector-icons'; // Для иконки дождя
import { MaterialIcons } from '@expo/vector-icons'; // Для иконки воды
import { FontAwesome6 } from '@expo/vector-icons';

type WeatherIndicatorProps = {
    type: 'windSpeed' | 'rainChance' | 'humidity';
    value: number;
};

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
        endAngle = calculateAngle(value, 0, 40, 55, 305);
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
