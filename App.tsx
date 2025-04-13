import React, { useEffect, useState } from 'react';
import "./global.css";
import { SafeAreaView, Platform, ActivityIndicator, View } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import { HomeScreen } from "./screens/HomeScreen";
import { useCustomFonts } from "./utils/loads/fonts";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
    // Правильное использование хука для загрузки шрифтов
    const [fontsLoaded, fontError] = useCustomFonts();
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Дополнительные асинхронные операции при запуске
                await new Promise(resolve => setTimeout(resolve, 100)); // Пример задержки
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
        }

        if (fontsLoaded) {
            prepare();
        }
    }, [fontsLoaded]);

    if (!appIsReady || !fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <I18nextProvider i18n={i18n}>
            <SafeAreaView className="flex-1" style={{ paddingTop: Platform.OS === 'ios' ? 0 : 0 }}>
                <HomeScreen />
            </SafeAreaView>
        </I18nextProvider>
    );
}