// components/AirCompositionWidget.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {t} from "i18next";
import {BlurView} from "expo-blur";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const AIR_COMPOSITION = [
    {
        icon: <FontAwesome5 name="cloud" size={20} color="white" />,
        label: "CO₂",
        value: "420",
        unit: "ppm"
    },
    {
        icon: <MaterialCommunityIcons name="weather-hazy" size={20} color="white" />,
        label: "PM2.5",
        value: "35",
        unit: "µg/m³"
    },
    {
        icon: <Ionicons name="leaf-outline" size={20} color="white" />,
        label: "O₃",
        value: "120",
        unit: "µg/m³"
    }
];

const Infolabel = () => (
    <View className="absolute top-5 left-5 flex flex-row justify-center items-center gap-x-2">
        <FontAwesome name="leaf" size={16} color="rgba(243, 244, 246,0.6)" />
        <Text className="text-[16px] text-gray-100/60 font-manrope-medium mb-1">
            {t('airComposition.labelName')}
        </Text>
    </View>
);

export const AirCompositionWidget = () => (

    <View className="flex mt-8 items-center relative overflow-hidden rounded-[35] w-full">
        <BlurView
            intensity={44}
            tint="light"
            className="absolute w-full h-full z-0 overflow-hidden rounded-[35]"
        />
        <View className="absolute w-full h-full bg-[rgba(90,139,171,0.1)] rounded-[35]" />
        <Infolabel />

        <View className="flex-row justify-between">
            {AIR_COMPOSITION.map((item, index) => (
                <View key={index} className="items-center">
                    <View className="mb-1">{item.icon}</View>
                    <Text className="text-white text-sm">{item.label}</Text>
                    <Text className="text-accent text-xl font-manrope-bold">{item.value}</Text>
                    <Text className="text-white/60 text-xs">{item.unit}</Text>
                </View>
            ))}
        </View>
    </View>
);
