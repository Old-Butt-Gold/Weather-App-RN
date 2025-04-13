// components/AirCompositionWidget.tsx
import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import i18n from "i18next";
import {BlurView} from "expo-blur";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Svg, { Text as SvgText, Path} from "react-native-svg";
import {describeRingSector} from "../utils/ringUtils";
const AIR_COMPOSITION = [
    {
        icon: <FontAwesome5 name="cloud" size={20} color="white" />,
        label: "CO₂",
        value: "420",
    },
    {
        icon: <MaterialCommunityIcons name="weather-hazy" size={20} color="white" />,
        label: "PM2.5",
        value: "35",
    },
    {
        icon: <Ionicons name="leaf-outline" size={20} color="white" />,
        label: "O₃",
        value: "120",
    }
];

const Infolabel = () => (
    <View className="absolute top-5 left-5 flex flex-row justify-center items-center gap-x-2">
        <FontAwesome name="leaf" size={16} color="rgba(243, 244, 246,0.6)" />
        <Text className="text-[16px] text-gray-100/60 font-manrope-medium mb-1">
            {i18n.t('airComposition.labelName')}
        </Text>
    </View>
);

const getAngleFromAQI = (aqi: number): number => {
    const clampedAQI = Math.min(500, Math.max(0, aqi)); // защита от выхода за диапазон
    return 45 + (clampedAQI / 500) * (315 - 45);
};


export const AirCompositionWidget = () => {
    const screenWidth = Dimensions.get('window').width;
    const svgWidth = screenWidth /1.7;
    const radius = svgWidth / 2;
    const topMargin = 65;
    const cx = svgWidth / 2;
    const cy = svgWidth / 2;
    const AIR_QUALITY_INDEX = 194; // любое значение от 0 до 500
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
              style={{ height: screenWidth + 35 }}

        >

            <View style={{ marginTop: topMargin }}>
                <Svg width={svgWidth} height={svgWidth} >
                    <Path
                        d={describeRingSector(cx, cy, cx, cx-13, 45, 315, 180, true)}
                        fill="#004b5870"
                        fillOpacity={0.3}
                    />
                    <Path
                        d={describeRingSector(cx, cy, cx, cx-13, 45, getAngleFromAQI(AIR_QUALITY_INDEX), 180, true)}
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
                        ИКВ
                    </SvgText>
                    <SvgText
                        x={cx}
                        y={cy+47}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="23"
                        fillOpacity={1}
                        fontFamily="Manrope-ExtraBold"
                    >
                        Хороший
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
                        500
                    </SvgText>
                </Svg>
            </View>

        </View>
        <View className="p-4 bg-[#004b5830] w-full rounded-[35]" >

        </View>
    </View>
)};
