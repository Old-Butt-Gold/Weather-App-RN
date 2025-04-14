// components/AirCompositionWidget.tsx
import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {t} from "i18next";
import {BlurView} from "expo-blur";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Svg, { Text as SvgText, Path} from "react-native-svg";
import {describeRingSector} from "../utils/ringUtils";
import {VerticalBar} from "./VerticalBar";
import { useTranslation } from "react-i18next";
const AIR_COMPOSITION = [
    {
        label: "CO₂",
        value: "70",
        max: "250",
    },
    {
        label: "PM2.5",
        value: "35",
        max: "250",
    },
    {
        label: "O₃",
        value: "120",
        max: "250",
    },
    {
        label: "SO₂",
        value: "10",
        max: "250",
    },
    {
        label: "NO₂",
        value: "35",
        max: "250",
    },
    {
        label: "PM₁₀",
        value: "120",
        max: "250",
    }
];
const MAX_AQI = 500;
const Infolabel = () => (
    <View className="absolute top-5 left-5 flex flex-row justify-center items-center gap-x-2">
        <FontAwesome name="leaf" size={16} color="rgba(243, 244, 246,0.6)" />
        <Text className="text-[16px] text-gray-100/60 font-manrope-medium mb-1">
            {t('airComposition.labelName')}
        </Text>
    </View>
);

const getAngleFromAQI = (aqi: number, max_aqi :number): number => {
    const clampedAQI = Math.min(max_aqi, Math.max(0, aqi)); // защита от выхода за диапазон
    return 45 + (clampedAQI / max_aqi) * (315 - 45);
};

const getAirQualityLevelKey = (aqi: number): string => {
    if (aqi <= 19) return "excellent";
    if (aqi <= 49) return "moderate";
    if (aqi <= 99) return "poor";
    if (aqi <= 149) return "unhealthy";
    if (aqi <= 249) return "veryUnhealthy";
    return "hazardous";
};

export const AirCompositionWidget = () => {
    const { t } = useTranslation();
    const AIR_QUALITY_INDEX = 170;
    const levelKey = getAirQualityLevelKey(AIR_QUALITY_INDEX);
    const screenWidth = Dimensions.get('window').width;
    const svgWidth = screenWidth /1.7;
    const radius = svgWidth / 2;
    const topMargin = 65;
    const cx = svgWidth / 2;
    const cy = svgWidth / 2;

    return (

    <View className="flex mt-8 items-center relative overflow-hidden rounded-[35] w-full">
        <BlurView
            intensity={44}
            tint="light"
            className="absolute w-full h-full z-0 overflow-hidden rounded-[35]"
        />
        <View className="absolute w-full h-full bg-[rgba(90,139,171,0.1)] rounded-[35]" />
        <Infolabel />

        <View
              style={{ height: svgWidth + 35 }}
        >

            <View style={{ marginTop: topMargin }}>
                <Svg width={svgWidth} height={svgWidth} >
                    <Path
                        d={describeRingSector(cx, cy, cx, cx-13, 45, 315, 180, true)}
                        fill="#004b5870"
                        fillOpacity={0.3}
                    />
                    <Path
                        d={describeRingSector(cx, cy, cx, cx-13, 45, getAngleFromAQI(AIR_QUALITY_INDEX, MAX_AQI), 180, true)}
                        fill="white"
                    />
                    <SvgText
                        x={cx}
                        y={cy + 15}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="70"
                        fillOpacity={1}
                        fontFamily="Poppins-SemiBold"
                    >
                        {AIR_QUALITY_INDEX}
                    </SvgText>
                    <SvgText
                        x={cx}
                        y={65}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="18"
                        fillOpacity={0.5}
                        fontFamily="Manrope-Bold"
                    >
                        {t(`airComposition.AQI`)}
                    </SvgText>
                    <SvgText
                        x={cx}
                        y={cy + 47}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="20"
                        fillOpacity={1}
                        fontFamily="Manrope-ExtraBold"
                    >
                        {t(`airComposition.level.${levelKey}`)}
                    </SvgText>
                    <SvgText
                        x={cx-75}
                        y={cy+105}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="15"
                        fillOpacity={0.4}
                        fontFamily="Poppins-Medium"
                    >
                        0
                    </SvgText>
                    <SvgText
                        x={cx+75}
                        y={cy+105}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="15"
                        fillOpacity={0.4}
                        fontFamily="Poppins-Medium"
                    >
                        {MAX_AQI}
                    </SvgText>
                </Svg>
            </View>

        </View>
        <Text className="text-white/70 font-manrope-semibold text-xs text-center mt-10 w-[80%]">
            {t(`airComposition.description.${levelKey}`)}
        </Text>
        <View className="p-4 bg-white/20 w-[85%] rounded-[35] mt-6 mb-8 flex-row flex-wrap justify-between gap-y-6">
            {AIR_COMPOSITION.map((item, index) => (
                <View
                    key={index}
                    className="w-[30%] flex-row items-end"
                >
                    <View className="flex flex-col mr-2 justify-between items-end w-[60%]">
                        <Text className="text-white font-poppins-medium text-2xl leading-9 h-10">
                            {item.value}
                        </Text>
                        <Text className="text-[#004b5870]/40 font-poppins-medium text-[12px] leading-5">
                            {item.label}
                        </Text>
                    </View>

                    <VerticalBar
                        width={5}
                        height={50}
                        value={parseFloat(item.value)}
                        maxValue={parseFloat(item.max)}
                        color="white"
                        backgroundColor="#004b5870"
                        backgroundOpacity={0.3}
                        fillOpacity={1}
                    />
                </View>
            ))}
        </View>

    </View>
)};
