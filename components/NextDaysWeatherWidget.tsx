import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { t } from 'i18next';
import WeatherIcon from "../assets/svg-icons/icon_components/WeatherIcon";
import { BlurView } from "expo-blur";
import WeatherIndicator from "./WeatherIndicator";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {formatDate, getCurrentTemperatureUnit} from "../store/utils/weatherUtils";
import {TemperatureUnit} from "../store/types/types";

type ForecastItem = {
    dayOfWeek: string; // берем из date.weekdayShort.число
    date: string;      // вызвать функцию из utils
    temperature_2m_mean: number;
    temperature_2m_max: number;
    temperature_2m_min: number;
    weather_code: string;
    wind_speed_10m_mean: number;  // Добавим скорость ветра для примера
    precipitation_probability_mean: number; // Добавим шанс осадков для примера
    relative_humidity_2m_mean: number;   // Добавим влажность для примера
};

type ForecastProps = {
    item: ForecastItem,
    isFirst: boolean,
    isLast: boolean,
}

const ForecastCard = (props: ForecastProps) => {
    const marginLeft = props.isFirst ? 0 : 10;
    const marginRight = props.isLast ? 12 : 0;

    const { item } = props;

    return (
        <View
            className="bg-[#45576170]/25 rounded-2xl flex-col items-center justify-center px-3 py-3 w-[130] relative overflow-hidden"
            style={{ marginLeft, marginRight }}
        >
            <BlurView
                intensity={15}
                tint="light"
                className="absolute w-80 h-80 z-0 overflow-hidden"
            />
            <View className="absolute w-[40] justify-center items-center top-[70px] left-3">
                <WeatherIcon code={item.weather_code} isDay={true} size={50} fill="white" />
            </View>
            <Text className="absolute top-0 right-1 text-white font-manrope-bold text-[32px] leading-11">
                {item.temperature_2m_mean}&deg;
            </Text>
            <Text className="absolute top-24 right-1 text-white/60 font-manrope-bold text-[12px] leading-11">
                {`${Math.round(item.temperature_2m_max)}° / ${Math.round(item.temperature_2m_min)}°`}
            </Text>
            <View className="flex-row w-full ">
                <View className="flex-col items-start h-40 w-[50%]">
                    <Text className="text-white font-manrope-extrabold text-[20px] text-center ml-1 leading-7">
                        {item.dayOfWeek}
                    </Text>
                    <Text className="text-white font-manrope-extrabold text-[9px] text-center ml-1">
                        {item.date}
                    </Text>
                </View>
            </View>

            <View className="absolute bottom-2 left-3 flex-row gap-1">
                <WeatherIndicator type="rainChance" value={item.precipitation_probability_mean} />
                <WeatherIndicator type="humidity" value={item.relative_humidity_2m_mean} />
                <WeatherIndicator type="windSpeed" value={item.wind_speed_10m_mean} />
            </View>
            <View className="absolute top-16 left-3 flex-row">
                <Text className="text-white/60 font-manrope-bold text-[9px]">
                    {t("clock.weather_code_descriptions." + item.weather_code)}
                </Text>
            </View>
        </View>
    );
};

export const NextDaysWeatherWidget = () => {
    const weatherState = useAppSelector(x => x.weather);

    const dayForecastInfo : ForecastItem[] = [];

    for (let i = 0; i < weatherState.data!.daily.time.length; i++) {
        const date = new Date(weatherState.data!.daily.time[i]);
        const dayWeek = date.getDay();
        let dayItem : ForecastItem = {
            dayOfWeek: t(`date.weekdayShort.${dayWeek}`),
            date: formatDate(date),
            temperature_2m_mean: ~~weatherState.data!.daily.temperature_2m_mean[i],
            temperature_2m_max: weatherState.data!.daily.temperature_2m_max[i],
            temperature_2m_min: weatherState.data!.daily.temperature_2m_min[i],
            weather_code: weatherState.data!.daily.weather_code[i].toString(),
            wind_speed_10m_mean: weatherState.data!.daily.wind_speed_10m_mean[i],
            precipitation_probability_mean: weatherState.data!.daily.precipitation_probability_mean[i],
            relative_humidity_2m_mean: weatherState.data!.daily.relative_humidity_2m_mean[i],
        };

        dayForecastInfo.push(dayItem);
    }

    return (
        <View className="w-full mt-4">
            <Text className="text-accent font-manrope-extrabold text-xl mb-2">
                {t('weather.nextDays')}
            </Text>
            <FlatList
                data={dayForecastInfo}
                keyExtractor={(item) => item.date}
                renderItem={({ item, index }) => (
                    <ForecastCard
                        item={item}
                        isFirst={index === 0}
                        isLast={index === dayForecastInfo.length - 1}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};
