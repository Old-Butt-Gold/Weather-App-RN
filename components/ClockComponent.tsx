import "../global.css";
import React, { useEffect, useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import Svg, {Circle, Text as SvgText, Line, Path, TSpan, Polygon, Defs, Stop, RadialGradient} from 'react-native-svg';
import { BlurView } from "expo-blur";
import { LinearGradient as SvgGradient } from 'react-native-svg';
import { LinearGradient as ViewGradient } from 'expo-linear-gradient';
import CloudyNightIcon from "../assets/svg-icons/сomponents/CloudyNightIcon";
import NightRainIcon from "../assets/svg-icons/сomponents/NightRainIcon";
import RainyIcon from "../assets/svg-icons/сomponents/RainyIcon";
import SunnyRainIcon from "../assets/svg-icons/сomponents/SunnyRainIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import { TouchableOpacity } from "react-native";
import RingWithGradient from "./RingWithGradientProps";
import RingWithConicGradient from "./RingWithGradientProps";

export const ClockComponent = () => {
    const [time, setTime] = useState(new Date());

    const [selectedType, setSelectedType] = useState<'temperature' | 'wind' | 'precipitation'>('temperature');

    const screenWidth = Dimensions.get('window').width;
    const svgSize = screenWidth;
    const topMargin = 40;

    useEffect(() => {
        // Обновляем время каждую секунду
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const hourMarks = Array.from({ length: 24 }, (_, i) => i);

    const temperatures = [ -2, -1, 12, 0, 1, 3, 6, 10, 14, 17, 20, 22, 24, 25, 24, 22, 19, 15, 12, 9, 6, 4, 2, 0 ];
    const windSpeeds = [5.0, 5.4, 4.2, 3.1, 3.5, 2.0, 2.3, 3.7, 5.1, 7.2, 10.0, 12.5, 14.3, 13.2, 12.1, 10.4, 8.2, 6.3, 5.5, 4.8, 4.0, 4.2, 5.1, 5.0]; // м/с
    const weatherStates = Array.from({ length: 24 }, (_, i) =>
        [CloudyNightIcon, NightRainIcon, RainyIcon, SunnyRainIcon][i % 4]
    );
    const weatherDescriptions = [
        "Ясно", "Облачно", "Небольшой дождь", "Ливень",
        "Гроза", "Снег", "Туман", "Пасмурно",
        "Переменная облачность", "Морось", "Град", "Метель",
        // ... добавьте другие описания по необходимости
    ];

    const getColor = (
        angle: number,
        startAngle: number,
        endAngle: number,
        colorStart = { r: 255, g: 255, b: 255 },     // белый по умолчанию
        colorEnd = { r: 18, g: 144, b: 216 }         // голубой по умолчанию
    ): string => {
        if (angle < startAngle) angle += 360;
        if (endAngle < startAngle) endAngle += 360;

        if (angle < startAngle) return `rgb(${colorStart.r},${colorStart.g},${colorStart.b})`;
        if (angle > endAngle) return `rgb(${colorEnd.r},${colorEnd.g},${colorEnd.b})`;

        const t = (angle - startAngle) / (endAngle - startAngle);

        const r = Math.round(colorStart.r + t * (colorEnd.r - colorStart.r));
        const g = Math.round(colorStart.g + t * (colorEnd.g - colorStart.g));
        const b = Math.round(colorStart.b + t * (colorEnd.b - colorStart.b));

        return `rgb(${r},${g},${b})`;
    };
    const currentHour = 17;
    const anglePerHour = 15;
    const angleOffset = -7.5; // чтобы каждый сектор был по центру часа
    const segments = currentHour > 17 ? 25 : undefined;
    const hourAngle = currentHour * anglePerHour;

    const currentWindDirection = 60;
    const angleRad = ((currentWindDirection - 90) * Math.PI) / 180;
    const currentWeatherDescription = weatherDescriptions[currentHour % weatherDescriptions.length];
    const currentMinute = time.getMinutes();
    const currentTemperature = temperatures[currentHour];
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
    const linePattern = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0];
        const directions = ["C", "В", "Ю", "З"];
        const radius = 5.5;
        const lineLength = 1.5;
    const describeRingSector = (
        cx: number, cy: number, rOuter: number, rInner: number,
        startAngleDeg: number, endAngleDeg: number
    ): string => {
        const startRad = (Math.PI / 180) * startAngleDeg;
        const endRad = (Math.PI / 180) * endAngleDeg;

        const x1 = cx + rOuter * Math.sin(startRad);
        const y1 = cy - rOuter * Math.cos(startRad);
        const x2 = cx + rOuter * Math.sin(endRad);
        const y2 = cy - rOuter * Math.cos(endRad);
        const x3 = cx + rInner * Math.sin(endRad);
        const y3 = cy - rInner * Math.cos(endRad);
        const x4 = cx + rInner * Math.sin(startRad);
        const y4 = cy - rInner * Math.cos(startRad);

        const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? "0" : "1";

        return `
            M ${x1},${y1}
            A ${rOuter},${rOuter} 0 ${largeArcFlag} 1 ${x2},${y2}
            L ${x3},${y3}
            A ${rInner},${rInner} 0 ${largeArcFlag} 0 ${x4},${y4}
            Z
        `;
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

            {/* Кнопки переключения */}
            <View className="absolute top-[15px] right-[10px] w-[120px] gap-1 h-[40px] rounded-[35px] bg-white/20 z-[999] justify-center items-center flex-row">
                <TouchableOpacity
                    onPress={() => setSelectedType('temperature')}
                    className={`w-[30] h-[30] rounded-[15] items-center justify-center ${selectedType === 'temperature' ? 'bg-[rgb(10,132,255)]/30' : 'bg-white/20'}`}>
                    <FontAwesome6 name="temperature-three-quarters" size={16} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedType('wind')}
                    className={`w-[30] h-[30] rounded-[15] items-center justify-center ${selectedType === 'wind' ? 'bg-[#1290d8]/30' : 'bg-white/20'}`}>
                    <FontAwesome5 name="wind" size={16} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedType('precipitation')}
                    className={`w-[30] h-[30] rounded-[15] items-center justify-center ${selectedType === 'precipitation' ? 'bg-[#1290d8]/30' : 'bg-white/20'}`}>
                    <Entypo name="cloud" size={16} color="white" />
                </TouchableOpacity>
            </View>
            <View className="flex absolute top-[15px] h-[40px] rounded-[35px] z-[999] justify-center items-center flex-row">
                <Text className="text-[#ffffff] font-manrope-bold text-2xl" style={{ color: 'white',}}> {`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`}</Text>
            </View>
            <View className="absolute top-[15px] left-[10px] w-[120px] gap-3 h-[40px] rounded-[35px] bg-white/20 z-[999] justify-center items-center flex-row">
                <View className="flex flex-row justify-center items-center gap-x-1">
                    <View className="rounded-full bg-[rgba(229,229,234,0.4)] w-2 h-2"/>
                    <Text className="text-white/80 font-manrope-semibold text-sm">
                        7.04
                    </Text>
                </View>
                <View className="flex flex-row justify-center items-center gap-x-1">
                    <View className="rounded-full bg-[rgba(18,144,216,0.4)] w-2 h-2 "/>
                    <Text className="text-white/80 font-manrope-semibold text-sm">
                        8.04
                    </Text>
                </View>
            </View>
            {/* Круговая визуализация */}
            <View style={{ marginTop: topMargin }}>
                <Svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
                    {/* Отображение текущего времени */}


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


                    {/* Для каждой из 4-х четвертей (0°, 90°, 180°, 270°) */}
                    {[12, 102, 192, 282].map((baseAngle, quarterIndex) => {
                        const angleRad = ((baseAngle - 11.25) * Math.PI) / 180;

                        return (
                            <>
                                {/* Буква направления */}
                                <SvgText
                                    key={`dir-${quarterIndex}`}
                                    x={50.3 + (radius - 2.8 + lineLength + 2) * Math.sin(angleRad)}
                                    y={63.2 - (radius - 2.8 + lineLength + 2) * Math.cos(angleRad)}
                                    fontSize="3"
                                    fill="white"
                                    textAnchor="middle"
                                    fontFamily="Manrope-ExtraBold"
                                    alignmentBaseline="middle"
                                >
                                    {directions[quarterIndex]}
                                </SvgText>

                                {/* 12 линий вокруг буквы */}
                                {linePattern.map((isWhite, lineIndex) => {
                                    const angle = baseAngle + (lineIndex * 6); // 6° между линиями
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
                            </>
                        );
                    })}


                    <Path
                        d={describeFullRing(50, 50, 38, 26)}
                        fill="rgba(17, 24, 39, 0.05)"
                    />
                    <Path
                        d={describeFullRing(50, 50, 46, 38)}
                        fill="rgba(255, 255, 255, 0.05)"
                    />
                    <Svg width="100" height="100">
                        <Defs>
                            {/* Градиент от белого (в начале сектора) к синему (в конце сектора) */}
                            <SvgGradient id="whiteToBlue" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0%" stopColor="white" />
                                <Stop offset="100%" stopColor="#1290D8" stopOpacity="0.7" />
                            </SvgGradient>

                            {/* Просто синий */}
                            <SvgGradient id="blueOnly" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0%" stopColor="#1290D8" stopOpacity="0.7" />
                                <Stop offset="100%" stopColor="#1290D8" stopOpacity="0.7" />
                            </SvgGradient>
                        </Defs>

                        <RingWithGradient
                            radiusInner={22}
                            radiusOuter={26}
                            startAngle={currentHour*15 +7.5}
                            endAngle={360}
                            segments={segments}
                            gradientRanges={[
                            ]}
                            defaultColor="rgb(255,255,255)"  // Для углов вне диапазона
                            opacity={0.45}
                        />
                        <RingWithGradient
                            radiusInner={22}
                            radiusOuter={26}
                            endAngle={currentHour*15 - 7.5}
                            startAngle={0}
                            gradientRanges={[
                                {
                                    startAngle: 0,
                                    endAngle: 60,
                                    colorStart: { r: 255, g: 255, b: 255 },
                                    colorEnd: { r: 10, g: 132, b: 255 }
                                },
                                {
                                    startAngle: currentHour*15,
                                    endAngle: currentHour*15 - 7.5,
                                    colorStart: { r: 10, g: 132, b: 255 },
                                    colorEnd: { r: 255, g: 255, b: 255 },

                                },
                                {
                                    startAngle: 60,
                                    endAngle: currentHour*15 - 7.5,
                                    colorStart: { r: 10, g: 132, b: 255 },
                                    colorEnd: { r: 17, g: 81, b: 219 },

                                },
                            ]}
                            defaultColor="rgb(10,132,255)"  // Для углов вне диапазона
                            opacity={0.45}
                        />

                    </Svg>
                    <Path
                        d={describeRingSector(50, 50, 46, 26, currentHour * 15 - 7.5, currentHour * 15 + 7.5)}
                        fill="white"
                        fillOpacity={0.2}
                    />
                    <Path
                        d={describeRingSector(
                            50, 50, 26, 22,
                            currentHour * 15 - 7.5,
                            currentHour * 15 + 7.5
                        )}
                        fill="rgba(255, 255, 255, 1)"
                        fillOpacity={1}
                    />
                    {/* Разметка часов */}
                    {hourMarks.map((hour) => {
                        const baseAngle = hour * 15;
                        const rad = (baseAngle * Math.PI) / 180;
                        const textRadius = 42;
                        const dataRadius = 32;
                        const sectorEndAngle = baseAngle + 7.5;
                        const sectorEndRad = (sectorEndAngle * Math.PI) / 180;
                        return (
                            <React.Fragment key={hour}>
                                {/* Часы */}
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

                                {/* Температура / ветер */}
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
                                        <TSpan fontSize="4">
                                            {windSpeeds[hour].toFixed(1)}
                                        </TSpan>
                                        <TSpan x={50 + dataRadius * Math.sin(rad)} dy={2.2} dx={0.5} fontSize="2.3">м/с</TSpan>
                                    </SvgText>

                                )}
                            </React.Fragment>
                        );
                    })}
                    {/* Скорость ветра по центру */}
                    <SvgText
                        x="50.2"
                        y="62.5"
                        fontSize="5"
                        fill="white"
                        textAnchor="middle"
                        fontFamily="Manrope-Bold"
                        alignmentBaseline="middle"
                    >
                        {windSpeeds[currentHour].toFixed(0)} {/* Отображение с 1 десятичным знаком */}
                    </SvgText>

                    {/* Единицы измерения под скоростью */}
                    <SvgText
                        x="50.3"
                        y="66"
                        fontSize="3"
                        fill="white"
                        textAnchor="middle"
                        fontFamily="Manrope-Bold"
                        alignmentBaseline="middle"
                    >
                        м / с
                    </SvgText>
                    <Line
                        x1={50 + radius * Math.cos(angleRad)}
                        y1={63 + radius * Math.sin(angleRad)}
                        x2={50 + radius * Math.cos(angleRad + Math.PI)}
                        y2={63 + radius * Math.sin(angleRad + Math.PI)}
                        stroke="white"
                        strokeWidth={0.3}
                        strokeOpacity={0.4}
                        strokeLinecap="round"
                    />

                    {/* Треугольник на начале линии (должен указывать НАПРАВЛЕНИЕ ветра) */}
                    <Polygon
                        points={`
        ${50 + (radius * 1.35) * Math.cos(angleRad)},${63 + (radius * 1.35) * Math.sin(angleRad)} 
        ${50 + (radius - 0.5) * Math.cos(angleRad + Math.PI / 10)},${63 + (radius - 0.5) * Math.sin(angleRad + Math.PI / 10)} 
        ${50 + (radius) * Math.cos(angleRad)},${63 + (radius) * Math.sin(angleRad)} 
        ${50 + (radius - 0.5) * Math.cos(angleRad - Math.PI / 10)},${63 + (radius - 0.5) * Math.sin(angleRad - Math.PI / 10)}
    `}
                        fill="white"
                    />

                    {/* Круг на конце линии */}
                    <Circle
                        cx={50 + (radius + 1) * Math.cos(angleRad + Math.PI)}
                        cy={63 + (radius + 1) * Math.sin(angleRad + Math.PI)}
                        r="1.2"
                        fill="white"
                    />

                </Svg>
            </View>

            {/* Иконки осадков */}
            {selectedType === 'precipitation' && hourMarks.map((hour) => {
                const angle = hour * 15;
                const rad = (angle * Math.PI) / 180;
                const iconRadius = 32;
                const IconComponent = weatherStates[hour];

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
            })}

        </ViewGradient>
    );
};