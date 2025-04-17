import React, {useEffect, useMemo, useState} from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Circle, Defs, Line, Path, Polygon, RadialGradient, Stop, Text as SvgText, TSpan} from 'react-native-svg';
import {BlurView} from "expo-blur";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import RingWithGradient from "../utils/RingWithGradientProps";
import WeatherIcon from "../assets/svg-icons/icon_components/WeatherIcon";
import Feather from '@expo/vector-icons/Feather';
import {describeFullRing, describeRingSector} from '../utils/ringUtils';
import {t} from "i18next";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {formatDate, getCurrentWindUnit, getWeatherCodeForHour} from "../store/utils/weatherUtils";

export type WeatherDataType = 'temperature' | 'wind' | 'precipitation';

const LINE_PATTERN = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0];
const ANGLE_PER_HOUR = 15;
const ANGLE_OFFSET = 7.5;

export const ClockComponent = () => {
    const dispatch = useAppDispatch();
    const weatherState = useAppSelector(x => x.weather);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [time, setTime] = useState(today);
    const [selectedType, setSelectedType] = useState<WeatherDataType>('temperature');

    const TypeSelectorButton = ({ type, icon }: { type: WeatherDataType, icon: React.ReactNode }) => (
        <TouchableOpacity
            onPress={() => setSelectedType(type)}
            className={`w-[30] h-[30] rounded-[15] items-center justify-center ${
                selectedType === type ? 'bg-[#1290d8]/30' : 'bg-white/20'
            }`}
        >
            {icon}
        </TouchableOpacity>
    );

    const TimeDisplay = () => (
        <View className="flex absolute top-[65px] h-[35px] rounded-[35px] z-[999] justify-center items-center flex-col">
            <Text className="text-white font-manrope-bold text-2xl h-[30]">
                {`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`}
            </Text>
            <Text className="text-white/50 font-manrope-bold text-sm h-[20] leading-4">
                {utc}
            </Text>
        </View>
    );

    const temperatures = weatherState.data!.hourly.temperature_2m;
    const windSpeeds = weatherState.data!.hourly.wind_speed_10m;

    // Размеры
    const svgSize = Dimensions.get('window').width;
    const topMargin = 95;

    // Таймер
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Текущие значения
    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();

    const HOUR_MARKS = Array.from({ length: 24 }, (_, i) => (currentHour + i) % 24);

    const currentTemperature = temperatures[0];

    const currentWindSpeed = windSpeeds[0];

    const windSpeedUnit = t(`windUnit.${getCurrentWindUnit(weatherState)}`);

    // 0 – текущий час
    const currentWeatherDescription = t("clock.weather_code_descriptions." + getWeatherCodeForHour(weatherState, 0));

    const currentWindDirection = weatherState.data!.hourly.wind_direction_10m[0];
    const angleRad = useMemo(() => ((currentWindDirection - 90) * Math.PI) / 180, [currentWindDirection]);
    const segments = currentHour > 17 ? 25 : undefined;

    const offsetSeconds = weatherState.data!.utc_offset_seconds;
    const hours = offsetSeconds / 3600;
    const utc: string = `UTC${hours >= 0 ? '+' : '-'}${Math.abs(hours)}`;

    const DateIndicator = () => (
        <View className="absolute top-[60px] left-[10px] w-[120px] gap-3 h-[40px] rounded-[35px] bg-white/20 z-[999] justify-center items-center flex-row">
            <View className="flex flex-row justify-center items-center gap-x-1">
                <View className="rounded-full bg-[rgba(229,229,234,0.4)] w-2 h-2"/>
                <Text className="text-white/80 font-manrope-semibold text-sm">{formatDate(today)}</Text>
            </View>
            <View className="flex flex-row justify-center items-center gap-x-1">
                <View className="rounded-full bg-[rgba(18,144,216,0.4)] w-2 h-2"/>
                <Text className="text-white/80 font-manrope-semibold text-sm">{formatDate(tomorrow)}</Text>
            </View>
        </View>
    );
    const Infolabel = () => (
        <View className="absolute top-5 left-5 flex flex-row justify-center items-center gap-x-2">
            <Feather name="clock" size={16} color="rgba(243, 244, 246,0.6)"/>
            <Text className="text-[16px] text-gray-100/60 font-manrope-medium mb-1">
                {t('clock.hourlyForecast')}
            </Text>
        </View>
    );
    const TypeSelector = () => (
        <View className="absolute top-[60px] right-[10px] w-[120px] gap-1 h-[40px] rounded-[35px] bg-white/20 z-[999] justify-center items-center flex-row">
            <TypeSelectorButton
                type="temperature"
                icon={<FontAwesome6 name="temperature-three-quarters" size={16} color="white" />}
            />
            <TypeSelectorButton
                type="wind"
                icon={<FontAwesome5 name="wind" size={16} color="white" />}
            />
            <TypeSelectorButton
                type="precipitation"
                icon={<Entypo name="cloud" size={16} color="white" />}
            />
        </View>
    );

    const renderHourMark = (hour: number, index: number) => {
        const baseAngle = hour * ANGLE_PER_HOUR;
        const rad = (baseAngle * Math.PI) / 180;
        const textRadius = 42;
        const dataRadius = 32;

        return (
            <React.Fragment key={hour}>
                <SvgText
                    x={50 + textRadius * Math.sin(rad) + 0.4}
                    y={50 - textRadius * Math.cos(rad) + 1}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fillOpacity={1}
                    fontSize="4"
                    fontFamily="Poppins-Regular"
                >
                    {hour}
                </SvgText>

                {selectedType === 'temperature' && (
                    <SvgText
                        x={50 + dataRadius * Math.sin(rad)}
                        y={50 - dataRadius * Math.cos(rad) + 1.5}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="4"
                        fontFamily="Poppins-SemiBold"
                    >
                        {`${~~temperatures[index]}°`}
                    </SvgText>
                )}

                {selectedType === 'wind' && (
                    <SvgText
                        x={50 + dataRadius * Math.sin(rad) + 0.4}
                        y={50 - dataRadius * Math.cos(rad) + 1.5}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontFamily="Poppins-SemiBold"
                    >
                        <TSpan fontSize="4">{windSpeeds[index].toFixed(1)}</TSpan>
                        <TSpan x={50 + dataRadius * Math.sin(rad)} dy={2.2} dx={0.5} fontSize="2.3">{windSpeedUnit}</TSpan>
                    </SvgText>
                )}
            </React.Fragment>
        );
    };

    const renderDirectionIndicator = (baseAngle: number, quarterIndex: number) => {
        const angleRad = ((baseAngle - 11.25) * Math.PI) / 180;
        const radius = 5.5;
        const lineLength = 1.5;

        return (
            <React.Fragment key={`direction-${quarterIndex}`}>
                <SvgText
                    x={50.3 + (radius - 2.8 + lineLength + 2) * Math.sin(angleRad)}
                    y={63.2 - (radius - 2.8 + lineLength + 2) * Math.cos(angleRad)}
                    fontSize="3"
                    fill="white"
                    textAnchor="middle"
                    fontFamily="Manrope-ExtraBold"
                    alignmentBaseline="middle"
                >
                    {t(`clock.directions.${quarterIndex}`)}
                </SvgText>

                {LINE_PATTERN.map((isWhite, lineIndex) => {
                    const angle = baseAngle + (lineIndex * 6);
                    const rad = (angle * Math.PI) / 180;

                    return (
                        <Line
                            key={`line-${quarterIndex}-${lineIndex}`}
                            x1={50 + radius * Math.sin(rad)}
                            y1={63 - radius * Math.cos(rad)}
                            x2={50 + (radius + lineLength) * Math.sin(rad)}
                            y2={63 - (radius + lineLength) * Math.cos(rad)}
                            stroke={isWhite ? "rgba(255, 255, 255, 0.7)" : "rgba(207,213,214,0.4)"}
                            strokeWidth={0.3}
                            strokeLinecap="round"
                        />
                    );
                })}
            </React.Fragment>
        );
    };

    const renderPrecipitationIcon = (hour: number, index: number) => {
        const angle = hour * ANGLE_PER_HOUR;
        const rad = (angle * Math.PI) / 180;
        const iconRadius = 32;

        // Пример генерации weatherCode и isDay. Ты можешь подставлять реальные данные.
        const weatherCode = getWeatherCodeForHour(weatherState, index); // например, '63'
        const isDay = weatherState.data!.hourly.is_day[index] === 1;

        return (
            <View
                key={`icon-${hour}`}
                style={{
                    position: 'absolute',
                    left: svgSize * (50 + iconRadius * Math.sin(rad)) / 100 - 32,
                    top: topMargin + svgSize * (50 - iconRadius * Math.cos(rad)) / 100 - 18,
                    width: 35,
                    height: 35,
                }}
            >
                <WeatherIcon
                    code={weatherCode.toString()}
                    isDay={isDay}
                    size={38}
                    fill="white"
                />
            </View>
        );
    };

    return (
        <View
            className="flex mt-8 items-center relative overflow-hidden rounded-[35] w-full"
            style={{ height: svgSize + topMargin }}
        >
            <BlurView
                intensity={44}
                tint="light"
                className="absolute w-full h-full z-0 overflow-hidden rounded-[35]"
            />
            <View className="absolute w-full h-full bg-[rgba(90,139,171,0.1)] rounded-[35]" />
            <Infolabel/>
            <TypeSelector />
            <TimeDisplay />
            <DateIndicator />

            <View style={{ marginTop: topMargin }}>
                <Svg width={svgSize} height={svgSize} viewBox="0 0 100 100">

                    {/* Основные элементы */}
                    <Path d={describeFullRing(50, 50, 38, 26)} fill="rgba(17, 24, 39, 0.05)" />
                    <Path d={describeFullRing(50, 50, 46, 38)} fill="rgba(255, 255, 255, 0.1)" />

                    {/* Центральная информация */}
                    <SvgText
                        x="52"
                        y="43"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="14"
                        fontFamily="Poppins-SemiBold"
                        dy=".3em"
                    >
                        {`${currentTemperature}°`}
                    </SvgText>
                    <SvgText
                        x="50.5"
                        y="52"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="3.5"
                        fillOpacity={0.7}
                        fontFamily="Manrope-SemiBold"
                    >
                        {currentWeatherDescription}
                    </SvgText>

                    {[12, 102, 192, 282].map(renderDirectionIndicator)}

                    {/* Кольца с градиентом */}
                    <RingWithGradient
                        radiusInner={22}
                        radiusOuter={26}
                        startAngle={currentHour * ANGLE_PER_HOUR + ANGLE_OFFSET}
                        endAngle={360}
                        gradientRanges={[
                        ]}
                        segments={segments}
                        defaultColor="rgb(255,255,255)"
                        opacity={0.45}
                    />
                    <RingWithGradient
                        radiusInner={22}
                        radiusOuter={26}
                        endAngle={currentHour * ANGLE_PER_HOUR - ANGLE_OFFSET}
                        startAngle={0}
                        gradientRanges={[
                            {
                                startAngle: 0,
                                endAngle: 60,
                                colorStart: { r: 255, g: 255, b: 255 },
                                colorEnd: { r: 10, g: 132, b: 255 }
                            },
                            {
                                startAngle: currentHour * ANGLE_PER_HOUR,
                                endAngle: currentHour * ANGLE_PER_HOUR - ANGLE_OFFSET,
                                colorStart: { r: 10, g: 132, b: 255 },
                                colorEnd: { r: 255, g: 255, b: 255 },
                            },
                            {
                                startAngle: 60,
                                endAngle: currentHour * ANGLE_PER_HOUR - ANGLE_OFFSET,
                                colorStart: { r: 10, g: 132, b: 255 },
                                colorEnd: { r: 17, g: 81, b: 219 },
                            },
                        ]}
                        defaultColor="rgb(10,132,255)"
                        opacity={0.45}
                    />

                    <Path
                        d={describeRingSector(50, 50, 46, 26, currentHour * ANGLE_PER_HOUR - ANGLE_OFFSET, currentHour * ANGLE_PER_HOUR + ANGLE_OFFSET)}
                        fill="white"
                        fillOpacity={0.2}
                    />
                    <Path
                        d={describeRingSector(50, 50, 26, 22, currentHour * ANGLE_PER_HOUR - ANGLE_OFFSET, currentHour * ANGLE_PER_HOUR + ANGLE_OFFSET)}
                        fill="rgba(255, 255, 255, 1)"
                        fillOpacity={1}
                    />

                    {HOUR_MARKS.map(renderHourMark)}

                    <Line
                        x1={50 + 5.5 * Math.cos(angleRad)}
                        y1={63 + 5.5 * Math.sin(angleRad)}
                        x2={50 + 5.5 * Math.cos(angleRad + Math.PI)}
                        y2={63 + 5.5 * Math.sin(angleRad + Math.PI)}
                        stroke="white"
                        strokeWidth={0.3}
                        strokeOpacity={0.4}
                        strokeLinecap="round"
                    />

                    <Svg>
                        {/* Тень (размытый круг под основным) */}
                        <Defs>
                            <RadialGradient
                                id="shadowGlow"
                                cx="50%"
                                cy="50%"
                                rx="50%"
                                ry="50%"
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop offset="0%" stopColor="#c2c5cf" stopOpacity="0.1" />
                                <Stop offset="100%" stopColor="black" stopOpacity="0.05" />
                            </RadialGradient>
                        </Defs>

                        {/* Фоновая тень */}
                        <Circle
                            cx={50}
                            cy={63}
                            r={3.6}
                            fill="url(#shadowGlow)"
                        />


                    </Svg>
                    {/* Стрелка направления ветра */}
                    <Polygon
                        points={`
                          ${50 + (5.5 * 1.35) * Math.cos(angleRad)},${63 + (5.5 * 1.35) * Math.sin(angleRad)} 
                          ${50 + (5.5 - 0.5) * Math.cos(angleRad + Math.PI / 10)},${63 + (5.5 - 0.5) * Math.sin(angleRad + Math.PI / 10)} 
                          ${50 + 5.5 * Math.cos(angleRad)},${63 + 5.5 * Math.sin(angleRad)} 
                          ${50 + (5.5 - 0.5) * Math.cos(angleRad - Math.PI / 10)},${63 + (5.5 - 0.5) * Math.sin(angleRad - Math.PI / 10)}
                        `}
                        fill="white"
                    />

                    {/* Круг на конце линии ветра */}
                    <Circle
                        cx={50 + (5.5 + 1) * Math.cos(angleRad + Math.PI)}
                        cy={63 + (5.5 + 1) * Math.sin(angleRad + Math.PI)}
                        r="1.2"
                        fill="white"
                    />

                    <SvgText
                        x="50.3"
                        y="62.5"
                        fontSize="4"
                        fill="white"
                        textAnchor="middle"
                        fontFamily="Manrope-Bold"
                        alignmentBaseline="middle"
                    >
                        {currentWindSpeed}
                    </SvgText>
                    <SvgText
                        x="50.3"
                        y="65"
                        fontSize="2.3"
                        fill="white"
                        textAnchor="middle"
                        fontFamily="Manrope-Bold"
                        alignmentBaseline="middle"
                    >
                        <TSpan>{windSpeedUnit}</TSpan>
                    </SvgText>
                </Svg>
            </View>

            {/* Иконки осадков */}
            {selectedType === 'precipitation' && HOUR_MARKS.map(renderPrecipitationIcon)}
        </View>
    );
};