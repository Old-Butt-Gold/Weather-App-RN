import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import WeatherIcon from "../assets/svg-icons/icon_components/WeatherIcon";
import { BlurView } from "expo-blur";
import { LinearGradient as ViewGradient } from 'expo-linear-gradient';
import { describeRingSector } from "../utils/ringUtils";
import WeatherIndicator from "./WeatherIndicator";

type ForecastItem = {
    dayOfWeek: string; // ПН, ВТ, СР и т.д.
    date: string;      // 08.04, 09.04 и т.д.
    temperature: number;
    dayTemp: number;
    nightTemp: number;
    code: string;
    isDay: boolean;
    windSpeed: number;  // Добавим скорость ветра для примера
    rainChance: number; // Добавим шанс осадков для примера
    humidity: number;   // Добавим влажность для примера
};

const MOCK_FORECAST: ForecastItem[] = [
    { dayOfWeek: 'ПН', date: '08.04', temperature: 18, dayTemp: 20, nightTemp: 12, code: '2', isDay: true, windSpeed: 2, rainChance: 52, humidity: 60 },
    { dayOfWeek: 'ВТ', date: '09.04', temperature: -21, dayTemp: -18, nightTemp: -25, code: '3', isDay: true, windSpeed: 35, rainChance: 64, humidity: 10 },
    { dayOfWeek: 'СР', date: '10.04', temperature: 19, dayTemp: 21, nightTemp: 14, code: '45', isDay: true, windSpeed: 5, rainChance: 61, humidity: 65 },
    { dayOfWeek: 'ЧТ', date: '11.04', temperature: 16, dayTemp: 17, nightTemp: 10, code: '61', isDay: true, windSpeed: 3, rainChance: 36, humidity: 55 },
    { dayOfWeek: 'ПТ', date: '12.04', temperature: 20, dayTemp: 22, nightTemp: 15, code: '0', isDay: true, windSpeed: 1, rainChance: 11, humidity: 50 }
];

const ForecastCard = ({
                          item,
                          isFirst = false,
                          isLast = false
                      }: {
    item: ForecastItem;
    isFirst?: boolean;
    isLast?: boolean;
}) => {
    const marginLeft = isFirst ? 0 : 10;
    const marginRight = isLast ? 12 : 0;

    return (
        <ViewGradient
            colors={['rgba(90, 139, 171, 0.1)', 'rgba(18,144,216, 0.6)']}
            className="bg-white/30 rounded-2xl flex-col items-center justify-center px-3 py-3 w-[130] relative overflow-hidden"
            style={{ marginLeft, marginRight }}
        >
            <BlurView
                intensity={15}
                tint="light"
                className="absolute w-80 h-80 z-0 overflow-hidden"
            />
            <View className="absolute w-[40] justify-center items-center top-[50px] left-3">
                <WeatherIcon code={item.code} isDay={item.isDay} size={60} fill="white" />
            </View>
            <Text className="absolute top-0 right-1 text-white font-manrope-bold text-[32px] leading-11">
                {item.temperature}&deg;
            </Text>
            <Text className="absolute top-20 right-1 text-white/60 font-manrope-bold text-[12px] leading-11">
                {item.dayTemp}&deg;/ {item.nightTemp}&deg;
            </Text>
            <View className="flex-row w-full">
                <View className="flex-col items-start h-36 w-[50%]">
                    <Text className="text-white font-manrope-extrabold text-[20px] text-center ml-1 leading-7">
                        {item.dayOfWeek}
                    </Text>
                    <Text className="text-white font-manrope-extrabold text-[9px] text-center ml-1">
                        {item.date}
                    </Text>
                </View>
            </View>

            {/* Новые компоненты WeatherIndicator */}
            <View className="absolute bottom-2 left-3 flex-row gap-1">
                <WeatherIndicator type="rainChance" value={item.rainChance} />
                <WeatherIndicator type="humidity" value={item.humidity} />
                <WeatherIndicator type="windSpeed" value={item.windSpeed} />

            </View>

        </ViewGradient>
    );
};

export const NextDaysWeatherWidget = () => {
    const { t } = useTranslation();

    return (
        <View className="w-full mt-4">
            <Text className="text-accent font-manrope-extrabold text-xl mb-2">
                {t('weather.nextDays')}
            </Text>
            <FlatList
                data={MOCK_FORECAST}
                keyExtractor={(item) => item.date}
                renderItem={({ item, index }) => (
                    <ForecastCard
                        item={item}
                        isFirst={index === 0}
                        isLast={index === MOCK_FORECAST.length - 1}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};
