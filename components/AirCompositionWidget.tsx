import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import {t} from "i18next";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Svg, { Text as SvgText, Path} from "react-native-svg";
import {describeRingSector} from "../utils/ringUtils";
import {VerticalBar} from "./VerticalBar";
import {useAppSelector} from "../store/hooks";

const Infolabel = () => (
    <View className="absolute top-5 left-5 flex flex-row justify-center items-center gap-x-2">
        <FontAwesome name="leaf" size={16} color="rgba(243, 244, 246,0.6)" />
        <Text className="text-[16px] text-gray-100/60 font-manrope-medium mb-1">
            {t('airComposition.labelName')}
        </Text>
    </View>
);

const getAngleFromAQI = (aqi: number, max_aqi :number): number => {
    const clampedAQI = Math.min(max_aqi, Math.max(0, aqi));
    return 45 + (clampedAQI / max_aqi) * (315 - 45);
};

const getAirQualityLevelKey = (aqi: number): string => {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "unhealthyForSensitiveGroups";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "veryUnhealthy";
    return "hazardous";
};

type AirInfo = {
    label: string,
    value: string,
    max: string,
}

export const AirCompositionWidget = () => {

    const MAX_AQI = 500;

    const currentHour = new Date().getHours();

    const weatherState = useAppSelector(x => x.weather);

    const airComposition : AirInfo[] = [];

    airComposition.push({
       label: "CO",
       value: weatherState.airQuality!.us_aqi_carbon_monoxide[currentHour].toString(),
       max: "30"
    });

    airComposition.push({
        label: "PM2.5",
        value: weatherState.airQuality!.us_aqi_pm2_5[currentHour].toString(),
        max: "250"
    });

    airComposition.push({
        label: "PM10",
        value: weatherState.airQuality!.us_aqi_pm10[currentHour].toString(),
        max: "425"
    });

    airComposition.push({
        label: "O₃",
        value: weatherState.airQuality!.us_aqi_ozone[currentHour].toString(),
        max: "201"
    });

    airComposition.push({
        label: "NO₂",
        value: weatherState.airQuality!.us_aqi_nitrogen_dioxide[currentHour].toString(),
        max: "1250"
    });

    airComposition.push({
        label: "SO₂",
        value: weatherState.airQuality!.us_aqi_sulphur_dioxide[currentHour].toString(),
        max: "605"
    });

    const AIR_QUALITY_INDEX = weatherState.airQuality!.us_aqi[currentHour];
    const levelKey = getAirQualityLevelKey(AIR_QUALITY_INDEX);
    const screenWidth = Dimensions.get('window').width;
    const svgWidth = screenWidth / 1.7;
    const topMargin = 65;
    const cx = svgWidth / 2;
    const cy = svgWidth / 2;

    return (

    <View className="flex mt-8 items-center relative overflow-hidden rounded-[35] w-full bg-[#45576170]/25">

        <View className="absolute w-full h-full bg-[rgba(90,139,171,0.05)] rounded-[35]" />
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
        <View className="p-4 bg-white/25 w-[85%] rounded-[35] mt-6 mb-8 flex-row flex-wrap justify-between gap-y-6">
            {airComposition.map((item, index) => (
                <View
                    key={index}
                    className="w-[30%] flex-row items-end"
                >
                    <View className="flex flex-col mr-2 justify-between items-end w-[60%]">
                        <Text className="text-white font-poppins-medium text-2xl leading-9 h-10">
                            {item.value}
                        </Text>
                        <Text className="text-white/70 font-poppins-medium text-[12px] leading-5">
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
