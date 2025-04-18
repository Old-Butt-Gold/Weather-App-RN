import React, {useState} from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { t } from 'i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTemperatureUnit, setWindSpeedUnit } from '../store/slices/weatherSlice';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n/i18n';
import {setLanguage} from "../store/slices/appSettingsSlice";
import {AppSettingsState} from "../store/types/types";
import {BackgroundImage} from "../components/BackgroundImage";

const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-6">
        <Text className="text-white/80 font-manrope-bold text-lg mb-3">{title}</Text>
        <View className="bg-white/10 rounded-2xl p-4">
            {children}
        </View>
    </View>
);

const SettingButton = ({
                           label,
                           isActive,
                           onPress,
                       }: {
    label: string;
    isActive: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-1 p-3 rounded-xl ${isActive ? 'bg-white/20' : 'bg-transparent'}`}
    >
        <Text className={`text-center font-manrope-medium ${isActive ? 'text-accent' : 'text-white/70'}`}>
            {label}
        </Text>
    </TouchableOpacity>
);

export const SettingsScreen = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const { temperatureUnit, windSpeedUnit } = useAppSelector(state => state.weather);
    const { language } = useAppSelector(state => state.appSettings);

    const handleLanguageChange = async (settings: AppSettingsState) => {
        dispatch(setLanguage(settings.language));
    };

    return (
        <View className="flex-1">
            <BackgroundImage />
            <View className="flex-1"
            >
                <View className="p-4 pt-14">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-manrope-bold text-xl">{t('settings.title')}</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Language Settings */}
                        <SettingSection title={t('settings.language')}>
                            <View className="flex-row gap-2">
                                <SettingButton
                                    label="Русский"
                                    isActive={language === 'ru'}
                                    onPress={async () => await handleLanguageChange({language: 'ru'})}
                                />
                                <SettingButton
                                    label="English"
                                    isActive={language === 'en'}
                                    onPress={async () => await handleLanguageChange({language: 'en'})}
                                />
                            </View>
                        </SettingSection>

                        {/* Temperature Units */}
                        <SettingSection title={t('settings.temperatureUnit')}>
                            <View className="flex-row gap-2">
                                <SettingButton
                                    label="°C"
                                    isActive={temperatureUnit === '°C'}
                                    onPress={() => dispatch(setTemperatureUnit('°C'))}
                                />
                                <SettingButton
                                    label="°F"
                                    isActive={temperatureUnit === '°F'}
                                    onPress={() => dispatch(setTemperatureUnit('°F'))}
                                />
                            </View>
                        </SettingSection>

                        {/* Wind Speed Units */}
                        <SettingSection title={t('settings.windSpeedUnit')}>
                            <View className="flex-row gap-2">
                                <SettingButton
                                    label={t("windUnit.km/h")}
                                    isActive={windSpeedUnit === 'km/h'}
                                    onPress={() => dispatch(setWindSpeedUnit('km/h'))}
                                />
                                <SettingButton
                                    label={t("windUnit.m/s")}
                                    isActive={windSpeedUnit === 'm/s'}
                                    onPress={() => dispatch(setWindSpeedUnit('m/s'))}
                                />
                                <SettingButton
                                    label={t("windUnit.mph")}
                                    isActive={windSpeedUnit === 'mph'}
                                    onPress={() => dispatch(setWindSpeedUnit('mph'))}
                                />
                            </View>
                        </SettingSection>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};