import React, { useEffect, useState, useMemo } from 'react';
import { View, Dimensions, Text, TouchableOpacity } from 'react-native';
import Svg, {
    Circle,
    Text as SvgText,
    Line,
    Path,
    TSpan,
    Polygon,
    Defs,
    Stop,
    LinearGradient,
    RadialGradient
} from 'react-native-svg';
import { BlurView } from "expo-blur";
import { LinearGradient as ViewGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import RingWithGradient from "./RingWithGradientProps";
import {
    CloudyNightIcon,
    NightRainIcon,
    RainyIcon,
    SunnyRainIcon
} from "../assets/svg-icons/icon_components";

// Константы и типы
type WeatherDataType = 'temperature' | 'wind' | 'precipitation';

const WEATHER_ICONS = [
    CloudyNightIcon,
    NightRainIcon,
    RainyIcon,
    SunnyRainIcon
];

const WEATHER_DESCRIPTIONS = [
    "Ясно", "Облачно", "Небольшой дождь", "Ливень",
    "Гроза", "Снег", "Туман", "Пасмурно",
    "Переменная облачность", "Морось", "Град", "Метель"
];

const DIRECTIONS = ["C", "В", "Ю", "З"];
const LINE_PATTERN = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0];
const HOUR_MARKS = Array.from({ length: 24 }, (_, i) => i);
const ANGLE_PER_HOUR = 15;
const ANGLE_OFFSET = 7.5;

export const ClockComponent = () => {
    // Состояния
    const [time, setTime] = useState(new Date());
    const [selectedType, setSelectedType] = useState<WeatherDataType>('temperature');

    // Данные
    const temperatures = useMemo(() => [-2, -1, 12, 0, 1, 3, 6, 10, 14, 17, 20, 22, 24, 25, 24, 22, 19, 15, 12, 9, 6, 4, 2, 0], []);
    const windSpeeds = useMemo(() => [5.0, 5.4, 4.2, 3.1, 3.5, 2.0, 2.3, 3.7, 5.1, 7.2, 10.0, 12.5, 14.3, 13.2, 12.1, 10.4, 8.2, 6.3, 5.5, 4.8, 4.0, 4.2, 5.1, 5.0], []);

    // Размеры
    const screenWidth = Dimensions.get('window').width;
    const svgSize = screenWidth;
    const topMargin = 40;

    // Таймер
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Текущие значения
    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();
    const currentTemperature = temperatures[currentHour];
    const currentWindSpeed = windSpeeds[currentHour];
    const currentWeatherDescription = WEATHER_DESCRIPTIONS[currentHour % WEATHER_DESCRIPTIONS.length];
    const currentWindDirection = 60;
    const angleRad = useMemo(() => ((currentWindDirection - 90) * Math.PI) / 180, [currentWindDirection]);
    const segments = currentHour > 17 ? 25 : undefined;

    // Вспомогательные функции
    const describeFullRing = (cx: number, cy: number, rOuter: number, rInner: number): string => {
        return `
      M ${cx + rOuter},${cy}
      A ${rOuter},${rOuter} 0 1 1 ${cx - rOuter},${cy}
      A ${rOuter},${rOuter} 0 1 1 ${cx + rOuter},${cy}
      Z
      M ${cx + rInner},${cy}
      A ${rInner},${rInner} 0 1 0 ${cx - rInner},${cy}
      A ${rInner},${rInner} 0 1 0 ${cx + rInner},${cy}
      Z
    `;
    };

    const describeRingSector = (
        cx: number, cy: number, rOuter: number, rInner: number,
        startAngleDeg: number, endAngleDeg: number
    ): string => {
        const startRad = (Math.PI / 180) * (startAngleDeg - 90);
        const endRad = (Math.PI / 180) * (endAngleDeg - 90);

        const x1 = cx + rOuter * Math.cos(startRad);
        const y1 = cy + rOuter * Math.sin(startRad);
        const x2 = cx + rOuter * Math.cos(endRad);
        const y2 = cy + rOuter * Math.sin(endRad);
        const x3 = cx + rInner * Math.cos(endRad);
        const y3 = cy + rInner * Math.sin(endRad);
        const x4 = cx + rInner * Math.cos(startRad);
        const y4 = cy + rInner * Math.sin(startRad);

        const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? "0" : "1";

        return `
      M ${x1},${y1}
      A ${rOuter},${rOuter} 0 ${largeArcFlag} 1 ${x2},${y2}
      L ${x3},${y3}
      A ${rInner},${rInner} 0 ${largeArcFlag} 0 ${x4},${y4}
      Z
    `;
    };

    // Компоненты интерфейса
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
        <View className="flex absolute top-[15px] h-[40px] rounded-[35px] z-[999] justify-center items-center flex-row">
            <Text className="text-white font-manrope-bold text-2xl">
                {`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`}
            </Text>
        </View>
    );

    const DateIndicator = () => (
        <View className="absolute top-[15px] left-[10px] w-[120px] gap-3 h-[40px] rounded-[35px] bg-white/20 z-[999] justify-center items-center flex-row">
            <View className="flex flex-row justify-center items-center gap-x-1">
                <View className="rounded-full bg-[rgba(229,229,234,0.4)] w-2 h-2"/>
                <Text className="text-white/80 font-manrope-semibold text-sm">7.04</Text>
            </View>
            <View className="flex flex-row justify-center items-center gap-x-1">
                <View className="rounded-full bg-[rgba(18,144,216,0.4)] w-2 h-2"/>
                <Text className="text-white/80 font-manrope-semibold text-sm">8.04</Text>
            </View>
        </View>
    );

    const TypeSelector = () => (
        <View className="absolute top-[15px] right-[10px] w-[120px] gap-1 h-[40px] rounded-[35px] bg-white/20 z-[999] justify-center items-center flex-row">
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

    const renderHourMark = (hour: number) => {
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
                        {`${temperatures[hour]}°`}
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
                        <TSpan fontSize="4">{windSpeeds[hour].toFixed(1)}</TSpan>
                        <TSpan x={50 + dataRadius * Math.sin(rad)} dy={2.2} dx={0.5} fontSize="2.3">м/с</TSpan>
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
                    {DIRECTIONS[quarterIndex]}
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

    const renderPrecipitationIcon = (hour: number) => {
        const angle = hour * ANGLE_PER_HOUR;
        const rad = (angle * Math.PI) / 180;
        const iconRadius = 32;
        const IconComponent = WEATHER_ICONS[hour % WEATHER_ICONS.length];

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
                <IconComponent width={38} height={38} fill="white" />
            </View>
        );
    };

    return (
        <ViewGradient
            colors={['rgba(90, 139, 171, 0.2)', 'rgb(18,144,216)']}
            className="flex mt-8 items-center relative overflow-hidden rounded-[35] w-full"
            style={{ height: svgSize + topMargin }}
        >
            <BlurView
                intensity={44}
                tint="light"
                className="absolute w-full h-full z-0 overflow-hidden rounded-[35]"
            />
            <View className="absolute w-full h-full bg-[rgba(90,139,171,0.1)] rounded-[35]" />

            <TypeSelector />
            <TimeDisplay />
            <DateIndicator />

            <View style={{ marginTop: topMargin }}>
                <Svg width={svgSize} height={svgSize} viewBox="0 0 100 100">

                    {/* Основные элементы */}
                    <Path d={describeFullRing(50, 50, 38, 26)} fill="rgba(17, 24, 39, 0.05)" />
                    <Path d={describeFullRing(50, 50, 46, 38)} fill="rgba(255, 255, 255, 0.05)" />

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

                    {/* Направления */}
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

                    {/* Активный сектор */}
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


                    {/* Часовые метки */}
                    {HOUR_MARKS.map(renderHourMark)}

                    {/* Индикатор ветра */}


                    {/* Линия направления ветра */}
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
                                <Stop offset="0%" stopColor="#78b7d8" stopOpacity="1" />
                                <Stop offset="100%" stopColor="black" stopOpacity="0.1" />
                            </RadialGradient>
                        </Defs>

                        {/* Фоновая тень */}
                        <Circle
                            cx={50}
                            cy={63}
                            r={3.6}
                            fill="url(#shadowGlow)"
                        />

                        {/* Основной круг */}
                        <Circle
                            cx={50}
                            cy={63}
                            r={3.5}
                            fill="#78b7d8"
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
                        {currentWindSpeed.toFixed(0)}
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
                        м / с
                    </SvgText>
                </Svg>
            </View>

            {/* Иконки осадков */}
            {selectedType === 'precipitation' && HOUR_MARKS.map(renderPrecipitationIcon)}
        </ViewGradient>
    );
};